const nodemailer = require("nodemailer");

// mailSender function
const mailSender = async (email, title, body) => {
    try {
        // create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 587,
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM || 'StudyNotion <no-reply@example.com>',
            to: email,
            subject: title,
            html: body,
        });
        console.log('Mail sent:', info.messageId);
        return info;
    } catch (error) {
        console.log('mailSender error:', error.message);
        throw error;
    }
};

module.exports = mailSender;