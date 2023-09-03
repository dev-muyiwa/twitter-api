import {Consumer, Producer} from "kafkajs";
import {databaseSetup} from "./config/database";
import {config} from "./config/config";
import app from "./config/app";
import KafkaService from "./utils/kafka";


const port: number = config.server.port;
let kafkaProducer: Producer, kafkaConsumer: Consumer;

databaseSetup().then(() => {
    console.log("Database connection successful...");

    const kafka: KafkaService = new KafkaService(["kafka:9093"], "user-service");

    kafka.connectProducer().then((producer) => {
        kafkaProducer = producer
        console.log("Connected to kafka producer.")
    }).catch((err) => console.log("Error connecting to kafka producer:", err));

    kafka.connectConsumer("user-group").then(async (consumer) => {
        kafkaConsumer = consumer;
        console.log("Connected to kafka consumer.");

        app.listen(port, () => console.log("Listening on port", port));

    }).catch((err) => console.log("Error connecting to kafka consumer:", err));
}).catch((err) => {
    console.log("Error connecting to database:", err);
})

process.on('SIGINT', async () => {
    await Promise.all([kafkaProducer.disconnect(), kafkaConsumer.disconnect()]);
    process.exit();
});


export {kafkaProducer, kafkaConsumer};