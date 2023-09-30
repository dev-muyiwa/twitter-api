import {databaseSetup} from "./config/database";
import {config} from "./config/config";
import app from "./config/app";
import {KafkaService} from "@dev-muyiwa/shared-service";
import {createClient} from "redis";


const port: number = config.server.port;
const kafka: KafkaService = new KafkaService(["kafka:9093"], "user-service");
const kafkaProducer = kafka.Producer;
const kafkaConsumer = kafka.Consumer;


const redisClient = createClient({
    url: config.redis,
})

redisClient.connect().then((value) => {
    console.log("Redis connection successful...")
});

databaseSetup().then(() => {
    console.log("Database connection successful...");

    kafka.connectProducer().then(() => {
        console.log("Connected to kafka producer.")
    }).catch((err) => console.log("Error connecting to kafka producer:", err));

    kafka.connectConsumer().then(() => {
        console.log("Connected to kafka consumer.");

        app.listen(port, () => {
            console.log("Listening to account service on port", port)
        });

    }).catch((err) => console.log("Error connecting to kafka consumer:", err));
}).catch((err) => {
    console.log("Error connecting to database:", err);
})

process.on('SIGINT', async () => {
    await Promise.all([kafkaProducer.disconnect(), kafkaConsumer.disconnect()]);
    process.exit();
});


export {kafkaProducer, kafkaConsumer, redisClient};