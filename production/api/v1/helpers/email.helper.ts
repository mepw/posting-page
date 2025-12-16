import nodemailer from "nodemailer";
import { SMTP_USER, SMTP_PASS, SMTP_FROM } from "../../../configs/constants/env.constant"; // adjust path

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

export const sendEmail = async ({ to, subject, text, html, }:{
    to: string;
    subject: string;
    text: string;
    html?: string;
}) => {

    try{
        const info = await transporter.sendMail({ from: SMTP_FROM, to, subject, text, html, });
        return info;
    }
    catch(error){
        throw error;
    }
};
