import express, { Application, Response, Request } from "express";
import {Kafka} from "kafkajs";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
    return res.send("A complete response from the user service.");
});

// const kafka = new Kafka({
//     clientId: 'user-service',
//     brokers: ['kafka:9092'],
// });
// const consumer = kafka.consumer({ groupId: 'user-group' });
// consumer.connect().then(async ()=>{
//
//     await consumer.subscribe({topic: "user-registration"})
//     await consumer.run({
//         eachMessage: async ({topic, partition, message}) => {
//             console.log(`Received message \'${message}\' from topic \'${topic}\'.`)
//         }
//     })
// });

app.listen(3001, () => {
    console.log("Listening to user-service on port 3001...");
})