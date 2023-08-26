import express, { Application, Response, Request } from "express";
import authRouter from "./routes/auth.routes";
import {Consumer, Producer} from "kafkajs";
import KafkaService from "./utils/kafka";

const port: number = Number(process.env.PORT);
const app: Application = express();

const kafkaService = new KafkaService(["kafka:9093"],"auth-service");
let kafkaProducer: Producer, kafkaConsumer: Consumer;

kafkaService.createConnection("auth-group")
    .then(({producer, consumer})=> {
        kafkaProducer = producer;
        kafkaConsumer = consumer;
}).catch(error => {
    console.error('Error creating Kafka connection:', error);
});

process.on('SIGINT', async () => {
    await Promise.all([kafkaProducer.disconnect(), kafkaConsumer.disconnect()]);
    process.exit();
});

app.listen(port, async () => {
    console.log(`Listening to auth-service on port ${port}...`);
});

app.use("/", authRouter);


export {kafkaProducer, kafkaConsumer};