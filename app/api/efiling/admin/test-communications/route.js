import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sendWhatsAppMessage } from '@/lib/whatsappService';
import { sendEmail } from '@/lib/emailService';
import { logAction } from '@/lib/actionLogger';

function isAdminRole(session) {
    return session?.user?.role != null && parseInt(session.user.role, 10) === 1;
}

export async function POST(request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (!isAdminRole(session)) {
            return NextResponse.json(
                { error: 'Only e-filing admin (role 1) can run communication tests' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { type, phoneNumber, email, message } = body;

        if (!type || !['whatsapp', 'email'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid type. Use "whatsapp" or "email".' },
                { status: 400 }
            );
        }

        if (!message || typeof message !== 'string' || !message.trim()) {
            return NextResponse.json({ error: 'Test message is required' }, { status: 400 });
        }

        const trimmedMessage = message.trim();

        if (type === 'whatsapp') {
            if (!phoneNumber || typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
                return NextResponse.json({ error: 'Contact number is required' }, { status: 400 });
            }

            const result = await sendWhatsAppMessage(phoneNumber.trim(), trimmedMessage);

            await logAction(request, 'TEST', 'communications_test', {
                details: {
                    channel: 'whatsapp',
                    phoneNumber: phoneNumber.trim(),
                    success: result.success,
                    error: result.error || null,
                },
            }).catch(() => {});

            if (!result.success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: result.error || 'Failed to send WhatsApp message',
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: result.message || 'WhatsApp test message sent successfully',
            });
        }

        if (!email || typeof email !== 'string' || !email.trim()) {
            return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
        }

        const trimmedEmail = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const subject = 'E-Filing System — Communication Test';
        const html = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <h2 style="color: #2563eb; margin: 0;">E-Filing — Email Test</h2>
                </div>
                <div style="background-color: #fff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <p style="white-space: pre-wrap;">${trimmedMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                </div>
                <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">This is an automated test from the E-Filing admin panel.</p>
            </body>
            </html>
        `;

        const result = await sendEmail(trimmedEmail, subject, html, trimmedMessage);

        await logAction(request, 'TEST', 'communications_test', {
            details: {
                channel: 'email',
                email: trimmedEmail,
                success: result.success,
                error: result.error || null,
            },
        }).catch(() => {});

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error || 'Failed to send email',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message || 'Test email sent successfully',
            messageId: result.data?.messageId,
        });
    } catch (error) {
        console.error('[test-communications]', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
