import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (toEmail, subject, body) => {
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL, // sender address
    to: toEmail, // list of receivers
    subject: subject, // Subject line
    html: body, // html body
  });
};
