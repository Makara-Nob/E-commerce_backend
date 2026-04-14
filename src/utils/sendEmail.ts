import nodemailer from 'nodemailer';

export const sendEmail = async (options: {
    email: string;
    subject: string;
    message: string;
    html?: string;
}) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000, // 10s to establish connection
        greetingTimeout: 10000,   // 10s to get SMTP greeting
        socketTimeout: 15000,     // 15s of inactivity before giving up
    });

    const info = await transporter.sendMail({
        from: `"NAGA Shop" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    });

    console.log('Email sent:', info.messageId);
    return info;
};
