import nodemailer, {SentMessageInfo, Transporter} from "nodemailer";
import {config} from "../config/config";


const sendMail = async (to: string | string[], subject: string, html?: string, body?: string, ): Promise<void> => {
    try {
        const transporter: Transporter<SentMessageInfo> = nodemailer.createTransport({
            host: config.host,
            port: config.smtp_port,
            name: "Twitter",
            secure: config.tls === "yes",
            auth: {
                user: config.username,
                pass: config.password
            },
        });

        return await transporter
            .sendMail({
                from: `Twitter ${config.sender}`,
                sender: config.sender,
                to: to,
                subject: subject,
                text: body,
                html: html
            });
    } catch (err) {
        throw err;
    }
}


export {sendMail};