import nodemailer from 'nodemailer';

/**
 * Send email using Gmail service
 */
export async function sendEmail(dest, subject, message, attachments = []) {
    try {
        // Create reusable transporter object using Gmail service
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODEMAILER_EMAIL, // Gmail address
                pass: process.env.NODEMAILER_PASSWORD, // App password
            },
        });

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"Electronics Store" <${process.env.nodeMailerEmail}>`, // sender address
            to: dest, // list of receivers
            subject, // Subject line
            html: message, // html body
            attachments
        });

        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetCode) => {
    const subject = 'Password Reset Code';
    const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Use the following code to reset your password:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
        ${resetCode}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

    return await sendEmail(email, subject, message);
};

export default sendEmail;
