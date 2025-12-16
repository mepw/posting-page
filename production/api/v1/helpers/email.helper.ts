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
export async function sendEmail(options: { to: string; subject: string; text: string; html?: string; bcc?: string; }): Promise<any> {
    try {
        const info = await transporter.sendMail(options);
        return info;
    }
    catch (error) {
        throw error;
    }
}
/**
 * Sends an email with the new comment details.
 * @param owner_email - The email address of the post owner.
 * @param params - The parameters of the new comment.
 * @returns A promise that resolves with the result of the email send operation.
 * @throws If there is an error sending the email.
 * @author Keith
 * last updated at: December 16, 2025
 */
export async function sendNewCommentEmail( owner_email: string, params: {
        user_id: number;
        comment: string;
        post_id: number;
        title: string; 
        owner_first_name: string;
        owner_last_name: string;
        
        commenter_first_name: string;
        commenter_last_name: string;
    }): Promise<void>{
    const commenter_full_name = `${params.commenter_first_name} ${params.commenter_last_name}`;

    const mail_configs = {
        from: `"Posting App" <${GMAIL_SMTP.APP_BCC_EMAIL_ADDRESS}>`,
        to: owner_email,
        subject: `New comment on post ${params.title}`,
        text: `User ${commenter_full_name} commented: "${params.comment}" on post by ${params.owner_first_name} ${params.owner_last_name}`,
    };

    await transporter.sendMail(mail_configs);
}

/**
 * 
 * 
 * 
 * 
*/
