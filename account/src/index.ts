import {databaseSetup} from "./config/database";
import {config} from "./config/config";
import app from "./config/app";
import {KafkaService} from "@dev-muyiwa/shared-service";
import {createClient, RedisClientType, SocketClosedUnexpectedlyError} from "redis";


const port: number = config.server.port;
const kafka: KafkaService = new KafkaService(["kafka:9093"], "user-service");
const kafkaProducer = kafka.Producer;
const kafkaConsumer = kafka.Consumer;


let redisClient: RedisClientType;

(async () => {
    redisClient = createClient({
        url: config.redis,
    });

    redisClient.on("error", async (err) => {
        console.error(`Error connecting to Redis: ${err}`)
        if (err instanceof SocketClosedUnexpectedlyError) {
            console.log("Reconnecting in 15s...");
            new Promise((resolve) => setTimeout(resolve, 15_000));
            console.log("Reconnecting...");
            await redisClient.connect();
            console.log("Redis connection successful")
        }
    });

    await redisClient.connect();
    console.log("Redis connection successful")
})();

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
    await Promise.all([kafkaProducer.disconnect(), kafkaConsumer.disconnect(), redisClient.disconnect()]);
    process.exit();
});


export {kafkaProducer, kafkaConsumer, redisClient};