import {databaseSetup} from "./config/database";
import {config} from "./config/config";
import app from "./config/app";
import {KafkaService} from "@dev-muyiwa/shared-service";
import {createClient} from "redis";
import {promisify} from "util";


const port: number = config.server.port;
const kafka: KafkaService = new KafkaService(["kafka:9093"], "user-service");
const kafkaProducer = kafka.Producer;
const kafkaConsumer = kafka.Consumer;

let redisGet: (key: string) => Promise<string | null>;
let redisSet: (key: string, seconds: number, value: string) => Promise<string>;

const redisClient = createClient({
    url: config.redis,
})

redisClient.connect().then((value) => {
    console.log("Redis connection successful...")
    redisGet = promisify(value.get).bind(redisClient);
    redisSet = promisify(value.setEx).bind(redisClient);
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


export {kafkaProducer, kafkaConsumer, redisGet, redisSet, redisClient};