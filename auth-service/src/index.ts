import {databaseSetup} from "./config/database";
import app from "./config/app";
import {config} from "./config/config";
import {KafkaService} from "@dev-muyiwa/shared-service";

const port: number = config.server.port;

const kafka: KafkaService = new KafkaService(["kafka:9093"], "auth-service");
const kafkaProducer = kafka.Producer;
const kafkaConsumer = kafka.Consumer;


databaseSetup().then(() => {
    console.log("Database connection successful...");

    kafka.connectProducer()
        .then(() => {
            console.log("Connected to kafka producer.")
        }).catch((err) => console.log("Unable to connect to Kafka producer:", err))

    kafka.connectConsumer()
        .then(() => {
            console.log("Connected to kafka consumer.");

            app.listen(port, () => {
                console.log(`Listening to auth service on port ${port}...`);
            })
        }).catch((err) => console.log("Error connecting to kafka consumer:", err));

}).catch(err => {
    console.error("Error connecting to the database:", err);
});


process.on('SIGINT', async () => {
    await Promise.all([kafkaProducer.disconnect(), kafkaConsumer.disconnect()]);
    process.exit();
});


export {kafkaProducer, kafkaConsumer};