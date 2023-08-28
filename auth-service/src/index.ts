import express, {Application, Response, Request} from "express";
import authRouter from "./routes/auth.routes";
import {Consumer, Producer} from "kafkajs";
import KafkaService from "./utils/kafka";
import {databaseSetup} from "./config/database";


// const kafkaService = new KafkaService(["kafka:9093"],"auth-service");
let kafkaProducer: Producer, kafkaConsumer: Consumer;

// kafkaService.createConnection("auth-group")
//     .then(({producer, consumer})=> {
//         kafkaProducer = producer;
//         kafkaConsumer = consumer;
// }).catch(error => {
//     console.error('Error creating Kafka connection:', error);
// });

// process.on('SIGINT', async () => {
//     await Promise.all([kafkaProducer.disconnect(), kafkaConsumer.disconnect()]);
//     process.exit();
// });


databaseSetup().then(() => {
    console.log("Database connection successful...");

    const port: number = Number(process.env.PORT);
    const app: Application = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.use("/", authRouter);

    app.listen(port, async () => {
        console.log(`Listening to auth-service on port ${port}...`);
    });
}).catch(err => {
    console.error("Error connecting to the database...", err);
});

export {kafkaProducer, kafkaConsumer};