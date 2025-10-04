import nodemailer from 'nodemailer';

let transporter = null;

// Create transporter lazily after env vars are loaded
function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: true
            }
        });
    }
    return transporter;
}

// Verify email service configuration
async function verifyEmailService() {
    try {
        await getTransporter().verify();
        console.log('✅ Email service is ready to send emails');
        return true;
    } catch (error) {
        console.error('❌ Email service configuration error:', error.message);
        return false;
    }
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(to) {
    const otp = generateOTP();
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
        html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 10 minutes.</p>`
    };

    
    try {
        await getTransporter().sendMail(mailOptions);
        console.log('OTP email sent to', to);
        return otp;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
}

export { sendOTPEmail, verifyEmailService };

