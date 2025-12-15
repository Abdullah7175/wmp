/**
 * WhatsApp API Service
 * Sends messages via the WhatsApp API endpoint
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'http://erp.rehmanigroup.com:8003/whatsapp.php';
const WHATSAPP_SECRET_KEY = process.env.WHATSAPP_SECRET_KEY || '';

/**
 * Send WhatsApp message
 * @param {string} phoneNumber - Phone number (with country code, e.g., 923001234567)
 * @param {string} message - Message to send
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function sendWhatsAppMessage(phoneNumber, message) {
    try {
        // Clean phone number - remove any spaces, dashes, or special characters
        const cleanPhone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
        
        // Ensure phone number starts with country code (if not, assume Pakistan +92)
        let formattedPhone = cleanPhone;
        if (!cleanPhone.startsWith('92') && !cleanPhone.startsWith('+92')) {
            // If starts with 0, replace with 92
            if (cleanPhone.startsWith('0')) {
                formattedPhone = '92' + cleanPhone.substring(1);
            } else {
                formattedPhone = '92' + cleanPhone;
            }
        }
        
        // Remove + if present
        formattedPhone = formattedPhone.replace(/^\+/, '');

        // Validate secret key
        if (!WHATSAPP_SECRET_KEY) {
            throw new Error('WhatsApp secret key is not configured. Please set WHATSAPP_SECRET_KEY in environment variables.');
        }

        // Prepare request payload
        const payload = {
            secret_key: WHATSAPP_SECRET_KEY,
            phone: formattedPhone,
            message: message
        };

        console.log('Sending WhatsApp message:', {
            phone: formattedPhone,
            messageLength: message.length
        });

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        // Send request to WhatsApp API
        const response = await fetch(WHATSAPP_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('WhatsApp API error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`WhatsApp API returned status ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        
        console.log('WhatsApp API response:', result);

        // Check if the API returned success
        if (result.success || result.status === 'success' || response.ok) {
            return {
                success: true,
                message: 'WhatsApp message sent successfully',
                data: result
            };
        } else {
            return {
                success: false,
                error: result.message || result.error || 'Failed to send WhatsApp message',
                data: result
            };
        }

    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        
        // Handle timeout
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            return {
                success: false,
                error: 'WhatsApp API request timed out. Please try again.'
            };
        }

        // Handle network errors
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
            return {
                success: false,
                error: 'Unable to connect to WhatsApp service. Please try again later.'
            };
        }

        return {
            success: false,
            error: error.message || 'Failed to send WhatsApp message'
        };
    }
}

/**
 * Send OTP via WhatsApp
 * @param {string} phoneNumber - User's phone number
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} userName - User's name (optional)
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function sendOTPViaWhatsApp(phoneNumber, otpCode, userName = 'User') {
    const message = `Dear ${userName},\n\nYour OTP for e-signature verification is: ${otpCode}\n\nThis code is valid for 10 minutes. Please do not share this code with anyone.\n\nThank you,\nE-Filing System`;
    
    return await sendWhatsAppMessage(phoneNumber, message);
}

