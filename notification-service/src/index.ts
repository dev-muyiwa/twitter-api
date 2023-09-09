import express, {Application} from "express";
import {KafkaService} from "@dev-muyiwa/shared-service";
import {sendMail} from "./service/email.service";
import {config} from "./config/config";


const app: Application = express();
const port: number = config.port;

const kafka: KafkaService = new KafkaService(["kafka:9093"], "notification-service");
const kafkaProducer = kafka.Producer;
const kafkaConsumer = kafka.Consumer;


kafka.connectProducer()
    .then(() => {
        console.log("Connected to kafka producer.")
    }).catch((err) => console.log("Unable to connect to Kafka producer:", err))

kafka.connectConsumer()
    .then(async () => {
        console.log("Connected to kafka consumer.");

        await kafkaConsumer.subscribe({topic: 'user-otp-email'});
        await kafkaConsumer.subscribe({topic: 'user-otp-sms'});
        await kafkaConsumer.subscribe({topic: 'user-verification'});
        await kafkaConsumer.subscribe({topic: 'user-registration'});
        await kafkaConsumer.subscribe({topic: 'forgot-password'});

        app.listen(port, async () => {
            console.log(`Listening to notification service on port ${port}...`);

            await kafkaConsumer.run({
                eachMessage: async ({topic, partition, message}) => {
                    const recipient: string = `${message.value}`;
                    switch (topic) {
                        case "user-otp-email": {
                            // Send email.
                            console.log(`Holla, ${recipient}! Welcome to this user OTP email.`)
                            break;
                        }
                        case "user-otp-sms": {
                            console.log(`Holla, ${recipient}! Welcome to this user OTP SMS.`)
                            break;
                        }
                        case "user-verification": {
                            console.log(`Holla, ${recipient}! Welcome to this user verification.`)
                            break;
                        }
                        case "user-registration": {
                            await sendMail(recipient, "Welcome to Twitter Fam!",
                                undefined,
                                "Hello, welcome to this API. This is a test deployment for 'user-registration' topic.");
                            console.log("Email sent to", recipient);
                            break;
                        }
                        case "forgot-password": {
                            const user = JSON.parse(`${message.value}`);
                            await sendMail(user.email, "Password reset notification - Twitter",
                                `<p>Hello, ${user.firstName} ${user.lastName}! \nHere is your password reset link. <a href="${user.resetUrl}">Reset password</a></p>`)
                            break;
                        }
                        default: {
                            console.log(`Invalid kafka topic \"${topic}\".`)
                        }
                    }
                }
            });
        })

    })

process.on('SIGINT', async () => {
    await Promise.all([kafkaProducer.disconnect(), kafkaConsumer.disconnect()]);
    process.exit();
});


export {kafka};