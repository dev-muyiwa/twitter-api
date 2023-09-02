import express, {Application, Response, Request} from "express";
import KafkaService from "./utils/kafka";
import {Consumer, Producer} from "kafkajs";
import {sendMail} from "./service/email.service";


const app: Application = express();
const port: number = Number(process.env.PORT);

const kafka = new KafkaService(["kafka:9093"], "notification-service");
let kafkaProducer: Producer, kafkaConsumer: Consumer;


kafka.connectProducer()
    .then((producer) => {
        kafkaProducer = producer;
        console.log("Kafka producer connected")
    }).catch((err) => console.log("Unable to connect to Kafka producer:", err))


app.listen(port, async () => {
    console.log(`Listening to notification service on port ${port}...`);
    kafka.connectConsumer("notification-group")
        .then(async (consumer) => {
            kafkaConsumer = consumer;
            console.log("Kafka consumer connected.")
            // Subscribe to SMS, OTP topics.

            await kafkaConsumer.subscribe({topic: 'user-otp-email'});
            await kafkaConsumer.subscribe({topic: 'user-otp-sms'});
            await kafkaConsumer.subscribe({topic: 'user-verification-email'});
            await kafkaConsumer.subscribe({topic: 'user-registration'});

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
                        case "user-verification-email": {
                            console.log(`Holla, ${recipient}! Welcome to this user verification.`)
                            break;
                        }
                        case "user-registration": {
                            await sendMail(recipient, "Welcome to Twitter Fam!", undefined, "Hello, welcome to this API. This is a test deployment.");
                            console.log("Email sent to", recipient);
                            break;
                        }
                        default: {
                            console.log(`Invalid kafka topic \"${topic}\".`)
                        }
                    }
                }
            });
        }).catch((err) => console.log("Unable to connect to Kafka consumer:", err))

})

process.on('SIGINT', async () => {
    await Promise.all([kafkaProducer.disconnect(), kafkaConsumer.disconnect()]);
    process.exit();
});


export {kafkaProducer, kafkaConsumer};