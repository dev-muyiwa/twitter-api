import express, {Application} from "express";
import {KafkaEvent, KafkaService} from "@dev-muyiwa/shared-service";
import {sendMail} from "./service/email.service";
import {config} from "./config/config";


const app: Application = express();
const port: number = config.port;

const kafka: KafkaService = new KafkaService(["kafka:9093"], "notification");
const kafkaProducer = kafka.Producer;
const kafkaConsumer = kafka.Consumer;


kafka.connectProducer()
    .then(() => {
        console.log("Connected to kafka producer.")
    }).catch((err) => console.log("Unable to connect to Kafka producer:", err))

kafka.connectConsumer()
    .then(async () => {
        console.log("Connected to kafka consumer.");

        await kafkaConsumer.subscribe({
            topics: [
                KafkaEvent.ACCOUNT_REGISTRATION,
                KafkaEvent.ACCOUNT_VERIFICATION,
                KafkaEvent.FORGOT_PASSWORD,
                KafkaEvent.PASSWORD_RESET
            ]
        })

        app.listen(port, async () => {
            console.log(`Listening to notification service on port ${port}...`);

            await kafkaConsumer.run({
                eachMessage: async ({topic, partition, message}) => {
                    switch (topic) {
                        case KafkaEvent.ACCOUNT_REGISTRATION: {
                            const user = JSON.parse(`${message.value}`);
                            await sendMail(user.email, "Welcome to Twitter Fam!",
                                undefined,
                                `Hi and welcome to Twitter, ${user.firstName}!` +
                                "\n" +
                                "Congratulations, your account has been activated! Log in to your Twitter account to to continue.");
                            break;
                        }
                        case KafkaEvent.ACCOUNT_VERIFICATION: {
                            const user = JSON.parse(`${message.value}`);
                            await sendMail(user.email, "Verify your email",
                                `<p>Hi ${user.firstName} ${user.lastName}\n` +
                                `To activate your Twitter Account, please verify your email address.\n` +
                                `Your account would be restricted until your email address is confirmed. <a href="${user.activationUrl}">Click here</a></p>`);
                            break;
                        }
                        case KafkaEvent.FORGOT_PASSWORD: {
                            const user = JSON.parse(`${message.value}`);
                            await sendMail(user.email, "Reset your Twitter password",
                                `<p>Hello, ${user.firstName}! \nHere is your password reset link. <a href="${user.resetUrl}">Reset password</a></p>`)
                            break;
                        }
                        case KafkaEvent.PASSWORD_RESET: {
                            const user = JSON.parse(`${message.value}`);
                            await sendMail(user.email, "Your Twitter password was reset",
                                `<p>Hello, ${user.firstName}! \nYour Twitter password was reset.</p>`)
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