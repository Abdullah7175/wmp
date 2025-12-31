import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { sendWhatsAppMessage } from '@/lib/whatsappService';

/**
 * GET endpoint to check for files with TAT deadlines approaching (1 hour remaining)
 * This should be called by a cron job or scheduled task
 */
export async function GET(request) {
    let client;
    try {
        client = await connectToDatabase();
        
        // Find files with TAT deadline between 1 hour and 1 hour 5 minutes from now
        // This gives a 5-minute window to avoid duplicate notifications
        const oneHourFromNow = new Date();
        oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
        
        const oneHourFiveMinutesFromNow = new Date();
        oneHourFiveMinutesFromNow.setMinutes(oneHourFiveMinutesFromNow.getMinutes() + 65);
        
        const filesRes = await client.query(`
            SELECT 
                f.id,
                f.file_number,
                f.subject,
                f.sla_deadline,
                f.assigned_to,
                eu.user_id,
                u.name as user_name,
                u.contact_number,
                u.email,
                eu.google_email,
                EXTRACT(EPOCH FROM (f.sla_deadline - NOW()))/3600.0 as hours_remaining
            FROM efiling_files f
            JOIN efiling_users eu ON f.assigned_to = eu.id
            JOIN users u ON eu.user_id = u.id
            WHERE f.sla_deadline IS NOT NULL
            AND f.sla_deadline BETWEEN $1 AND $2
            AND f.sla_paused = false
            AND NOT EXISTS (
                SELECT 1 FROM efiling_tat_logs 
                WHERE file_id = f.id 
                AND user_id = eu.id 
                AND event_type = 'ONE_HOUR_WARNING'
                AND created_at > NOW() - INTERVAL '1 hour'
            )
        `, [oneHourFromNow.toISOString(), oneHourFiveMinutesFromNow.toISOString()]);
        
        const notificationsSent = [];
        const errors = [];
        
        for (const file of filesRes.rows) {
            try {
                const hoursRemaining = parseFloat(file.hours_remaining) || 0;
                const deadline = new Date(file.sla_deadline);
                const deadlineStr = deadline.toLocaleString('en-PK', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                // Send WhatsApp notification
                const phoneNumber = file.contact_number;
                if (phoneNumber) {
                    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+92${phoneNumber.replace(/^0/, '')}`;
                    const message = `⏰ *TAT Deadline Reminder*\n\n` +
                        `File Number: ${file.file_number}\n` +
                        `Subject: ${file.subject}\n` +
                        `⏰ Deadline: ${deadlineStr}\n` +
                        `⏳ Time Remaining: ${Math.floor(hoursRemaining)} hour${Math.floor(hoursRemaining) !== 1 ? 's' : ''}\n\n` +
                        `Please add your e-signature and take necessary action on this file.\n\n` +
                        `Thank you,\nE-Filing System`;
                    
                    const whatsappResult = await sendWhatsAppMessage(formattedPhone, message);
                    
                    // Log the TAT event
                    await client.query(`
                        INSERT INTO efiling_tat_logs 
                        (file_id, user_id, event_type, sla_deadline, time_remaining_hours, message, notification_sent, notification_method, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                    `, [
                        file.id,
                        file.assigned_to,
                        'ONE_HOUR_WARNING',
                        file.sla_deadline,
                        hoursRemaining,
                        message,
                        whatsappResult.success,
                        'whatsapp'
                    ]);
                    
                    notificationsSent.push({
                        file_id: file.id,
                        file_number: file.file_number,
                        user_name: file.user_name,
                        notification_sent: whatsappResult.success
                    });
                }
                
                // Also create in-app notification
                await client.query(`
                    INSERT INTO efiling_notifications 
                    (user_id, file_id, type, message, priority, action_required, created_at)
                    VALUES ($1, $2, $3, $4, 'high', true, NOW())
                `, [
                    file.assigned_to,
                    file.id,
                    'tat_warning',
                    `⏰ TAT Deadline Approaching: File ${file.file_number} has ${Math.floor(hoursRemaining)} hour${Math.floor(hoursRemaining) !== 1 ? 's' : ''} remaining. Deadline: ${deadlineStr}`
                ]);
                
            } catch (error) {
                console.error(`Error sending 1-hour warning for file ${file.id}:`, error);
                errors.push({
                    file_id: file.id,
                    error: error.message
                });
            }
        }
        
        return NextResponse.json({
            success: true,
            files_checked: filesRes.rows.length,
            notifications_sent: notificationsSent.length,
            notifications: notificationsSent,
            errors: errors
        });
        
    } catch (error) {
        console.error('Error checking TAT warnings:', error);
        return NextResponse.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}
