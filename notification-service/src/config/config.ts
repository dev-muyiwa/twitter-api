import * as process from "process";


export const config = {
    port: Number(process.env.PORT),
    host: process.env.SMTP_HOST || "smtp.sendgrid.net",
    smtp_port: Number(process.env.SMTP_PORT) ? Number(process.env.SMTP_PORT) : 465,
    tls: process.env.SMTP_TLS || "yes",
    username: process.env.SMTP_USERNAME || "",
    password: process.env.SMTP_PASSWORD || "",
    sender: process.env.SMTP_SENDER || "hello@twitter.com"
}