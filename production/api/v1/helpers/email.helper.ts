import nodemailer from "nodemailer";
import { GMAIL_SMTP } from "../../../configs/constants/env.constant";


/**
 * Creates a nodemailer transporter.
 * @returns {object} - A nodemailer transporter object.
 * @throws {Error} - If there is an error creating the transporter.
 * @author Keith
 * last updated at: December 16, 2025
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_SMTP.APP_EMAIL_ADDRESS,
        pass: GMAIL_SMTP.APP_PASSWORD
    },
});


/**
 * Sends an email using the transporter.
 * @param options - Contains the fields to, subject, text, and html.
 * @param options.to - The recipient's email address.
 * @param options.subject - The subject of the email.
 * @param options.text - The plain text content of the email.
 * @param options.html - The HTML content of the email (optional).
 * @returns A promise that resolves with the result of the email send operation.
 * @throws If there is an error sending the email.
 * @author Keith
 * last updated at: December 16, 2025
 */
export async function sendEmail( options: { to: string; subject: string; text: string; html?: string; }): Promise<any>{
    try{
        const info = await transporter.sendMail({ from: GMAIL_SMTP.APP_BCC_EMAIL_ADDRESS, to: options.to, subject: options.subject, text: options.text, html: options.html });
        return info;
    } 
    catch(error){
        throw error;
    }
}
