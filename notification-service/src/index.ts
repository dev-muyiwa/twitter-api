import express, {Application} from "express";
import KafkaService from "./utils/kafka";
import {Consumer, Producer} from "kafkajs";
import {sendMail} from "./service/email.service";
import {config} from "./config/config";


const app: Application = express();
const port: number = config.port;

const kafka: KafkaService = new KafkaService(["kafka:9093"], "notification-service");
let kafkaProducer: Producer, kafkaConsumer: Consumer;


kafka.connectProducer()
    .then((producer) => {
        kafkaProducer = producer;
        console.log("Connected to kafka producer.")
    }).catch((err) => console.log("Unable to connect to Kafka producer:", err))

kafka.connectConsumer("notification-group")
    .then(async (consumer) => {
        kafkaConsumer = consumer;
        console.log("Connected to kafka consumer.");

        await kafkaConsumer.subscribe({topic: 'user-otp-email'});
        await kafkaConsumer.subscribe({topic: 'user-otp-sms'});
        await kafkaConsumer.subscribe({topic: 'user-verification'});
        await kafkaConsumer.subscribe({topic: 'user-registration'});

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


export {kafkaProducer, kafkaConsumer};