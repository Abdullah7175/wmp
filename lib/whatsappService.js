/**
 * WhatsApp API Service
 * Sends messages via the WhatsApp API endpoint
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'http://erp.rehmanigroup.com:8003/whatsapp.php';

// Handle WhatsApp secret key - try multiple methods to read it
// This is a workaround for Next.js 13.5.11 env variable interpolation issues with $ characters
let WHATSAPP_SECRET_KEY = process.env.WHATSAPP_SECRET_KEY || 'kw$0126001';

// Log what we got from env (for debugging - only first 3 chars)
console.log('[WhatsApp Service Init]', {
    apiUrl: WHATSAPP_API_URL,
    secretKeyFromEnv: process.env.WHATSAPP_SECRET_KEY ? process.env.WHATSAPP_SECRET_KEY.substring(0, 3) + '***' : 'NOT SET',
    secretKeyLength: process.env.WHATSAPP_SECRET_KEY ? process.env.WHATSAPP_SECRET_KEY.length : 0,
    usingFallback: !process.env.WHATSAPP_SECRET_KEY
});

// If env var is set but empty, use the hardcoded fallback
if (!WHATSAPP_SECRET_KEY || WHATSAPP_SECRET_KEY === '' || WHATSAPP_SECRET_KEY === 'undefined') {
    console.warn('[WhatsApp Service] Environment variable WHATSAPP_SECRET_KEY not set or empty, using fallback');
    WHATSAPP_SECRET_KEY = 'kw$0126001';
}

// Clean up the value if it was escaped (remove any double dollar signs that Next.js might have added)
if (WHATSAPP_SECRET_KEY && WHATSAPP_SECRET_KEY.includes('$$') && !WHATSAPP_SECRET_KEY.startsWith('kw$0126001')) {
    // If it's still escaped, we need to unescape it
    // This handles cases where Next.js didn't properly parse it
    console.log('[WhatsApp Service] Unescaping double dollar signs in secret key');
    WHATSAPP_SECRET_KEY = WHATSAPP_SECRET_KEY.replace(/\$\$/g, '$');
}

// Final validation
if (!WHATSAPP_SECRET_KEY || WHATSAPP_SECRET_KEY.length < 5) {
    console.error('[WhatsApp Service] Invalid secret key detected:', {
        length: WHATSAPP_SECRET_KEY?.length,
        firstChars: WHATSAPP_SECRET_KEY?.substring(0, 5)
    });
}

/**
 * Send WhatsApp message
 * @param {string} phoneNumber - Phone number (with country code, e.g., 923001234567)
 * @param {string} message - Message to send
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function sendWhatsAppMessage(phoneNumber, message) {
    try {
        // Clean phone number - remove spaces, dashes, parentheses but keep +
        const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
        
        // Format phone number for WhatsApp API
        // New API format requires: +923018233446 (with + prefix)
        let formattedPhone = cleanPhone;
        
        if (cleanPhone.startsWith('+92')) {
            // Already in correct format with + prefix (e.g., +923018233446)
            formattedPhone = cleanPhone;
        } else if (cleanPhone.startsWith('92')) {
            // Country code format without + (e.g., 923018233446) - add +
            formattedPhone = '+' + cleanPhone;
        } else if (cleanPhone.startsWith('0')) {
            // Local format (e.g., 03330355270) - convert to +92 format
            formattedPhone = '+92' + cleanPhone.substring(1);
        } else {
            // Assume it's a local number without leading 0 - add +92
            formattedPhone = '+92' + cleanPhone;
        }

        // Validate secret key
        if (!WHATSAPP_SECRET_KEY) {
            throw new Error('WhatsApp secret key is not configured. Please set WHATSAPP_SECRET_KEY in environment variables.');
        }

        // Determine request format based on API URL
        // If URL contains 'send-json', use JSON format, otherwise use form data
        const useJsonFormat = WHATSAPP_API_URL.includes('send-json') || WHATSAPP_API_URL.includes('/json');
        
        let requestBody;
        let contentType;
        let headers = {};

        if (useJsonFormat) {
            // JSON format for /api/send-json endpoint
            // Format: { "phone": "+923018233446", "message": "...", "token": "kw$0126001" }
            const jsonPayload = {
                phone: formattedPhone,
                message: message,
                token: WHATSAPP_SECRET_KEY
            };
            requestBody = JSON.stringify(jsonPayload);
            contentType = 'application/json';
            // Token goes in body, not in header
        } else {
            // Form data format for legacy endpoints
            const formData = new URLSearchParams();
            formData.append('secreate_key', WHATSAPP_SECRET_KEY);
            formData.append('mobile_number', formattedPhone);
            formData.append('message', message);
            requestBody = formData.toString();
            contentType = 'application/x-www-form-urlencoded';
        }

        console.log('[WhatsApp] Sending message:', {
            phone: formattedPhone,
            messageLength: message.length,
            token: WHATSAPP_SECRET_KEY ? WHATSAPP_SECRET_KEY.substring(0, 3) + '***' : 'MISSING',
            tokenLength: WHATSAPP_SECRET_KEY ? WHATSAPP_SECRET_KEY.length : 0,
            api_url: WHATSAPP_API_URL,
            format: useJsonFormat ? 'JSON' : 'form-data'
        });
        
        // Debug: Log the actual payload (without exposing full secret key)
        if (useJsonFormat) {
            console.log('[WhatsApp] JSON payload:', {
                phone: formattedPhone,
                message: message.substring(0, 50) + '...',
                token: WHATSAPP_SECRET_KEY ? WHATSAPP_SECRET_KEY.substring(0, 3) + '***' : 'MISSING',
                tokenLength: WHATSAPP_SECRET_KEY ? WHATSAPP_SECRET_KEY.length : 0
            });
        } else {
            console.log('[WhatsApp] Form-data payload:', {
                mobile_number: formattedPhone,
                message: message.substring(0, 50) + '...',
                secreate_key: WHATSAPP_SECRET_KEY ? WHATSAPP_SECRET_KEY.substring(0, 3) + '***' : 'MISSING'
            });
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        // Send request to WhatsApp API
        headers['Content-Type'] = contentType;
        
        let response = await fetch(WHATSAPP_API_URL, {
            method: 'POST',
            headers: headers,
            body: requestBody,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // No retry needed - JSON format uses token in body only

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[WhatsApp] API error response:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
                url: WHATSAPP_API_URL,
                requestMethod: 'POST',
                contentType: contentType,
                format: useJsonFormat ? 'JSON' : 'form-data',
                tokenUsed: WHATSAPP_SECRET_KEY ? WHATSAPP_SECRET_KEY.substring(0, 3) + '***' : 'MISSING',
                tokenLength: WHATSAPP_SECRET_KEY ? WHATSAPP_SECRET_KEY.length : 0,
                requestBodyPreview: useJsonFormat ? JSON.parse(requestBody) : 'form-data'
            });
            
            // Special handling for 404 - URL might be incorrect
            if (response.status === 404) {
                throw new Error(`WhatsApp API endpoint not found (404). Please verify the URL: ${WHATSAPP_API_URL}. The endpoint might be at a different path or the server might be down.`);
            }
            
            // Special handling for 401 - authentication issue
            if (response.status === 401) {
                const errorDetails = {
                    tokenPrefix: WHATSAPP_SECRET_KEY ? WHATSAPP_SECRET_KEY.substring(0, 3) + '***' : 'MISSING',
                    tokenLength: WHATSAPP_SECRET_KEY ? WHATSAPP_SECRET_KEY.length : 0,
                    apiUrl: WHATSAPP_API_URL,
                    format: useJsonFormat ? 'JSON' : 'form-data',
                    apiError: errorText.substring(0, 200)
                };
                console.error('[WhatsApp] 401 Authentication failed - details:', errorDetails);
                throw new Error(`WhatsApp API authentication failed (401). Token: ${errorDetails.tokenPrefix} (length: ${errorDetails.tokenLength}), URL: ${errorDetails.apiUrl}, Format: ${errorDetails.format}. API Error: ${errorDetails.apiError}`);
            }
            
            throw new Error(`WhatsApp API returned status ${response.status}: ${errorText.substring(0, 200)}`);
        }

        // Try to parse JSON response
        let result;
        const responseText = await response.text();
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse WhatsApp API response as JSON:', {
                responseText: responseText,
                error: parseError.message
            });
            // If response is not JSON but status is OK, consider it success
            if (response.ok) {
                return {
                    success: true,
                    message: 'WhatsApp message sent successfully',
                    data: { rawResponse: responseText }
                };
            }
            throw new Error(`Invalid JSON response from WhatsApp API: ${responseText}`);
        }
        
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

