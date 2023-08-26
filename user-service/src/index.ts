import express, { Application, Response, Request } from "express";
import {Kafka} from "kafkajs";

const app: Application = express();
const port: number = Number(process.env.PORT);


app.get("/", (req: Request, res: Response) => {
    return res.send("A complete response from the user service.");
});


app.listen(port, async () => {
    console.log(`Listening to user-service on port ${port}...`);

    const kafka = new Kafka({
        clientId: 'user-service',
        brokers: ["kafka:9093"],
    });

    const consumer = kafka.consumer({ groupId: 'user-group' });
    const producer = kafka.producer();

    async function start() {
        await producer.connect();
        await consumer.connect();
        await consumer.subscribe({ topic: 'user-registration' });
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                // Process user registration message here
                const userData: string = `${message.value}`;
                console.log(`Value in the user service .............. ${message.value}`)

                // Simulate user creation in the database
                // ...

                // Produce a token message for authentication service
                const token: string = `${Math.random()}`;
                console.log("The current token is", token)
                await producer.send({
                    topic: 'auth-token',
                    messages: [{ value: JSON.stringify({ test: userData, token }) }],
                });
            },
        });

        // await producer.disconnect()
    }

    start().catch(console.error);
})

/**
 * import express, { Application, Response, Request } from "express";
 * import {Consumer, Producer} from "kafkajs";
 * import KafkaService from "./utils/kafka";
 *
 * const port: number = Number(process.env.PORT);
 * const app: Application = express();
 *
 * const kafkaService = new KafkaService(["kafka:9093"],"user-service");
 *
 * let kafkaProducer: Producer, kafkaConsumer: Consumer;
 *
 * kafkaService.createConnection("user-group")
 *     .then(({producer, consumer})=> {
 *         kafkaProducer = producer;
 *         kafkaConsumer = consumer;
 *     }).catch(error => {
 *     console.error('Error creating Kafka connection:', error);
 * });
 *
 * process.on('SIGINT', async () => {
 *     await Promise.all([kafkaProducer.disconnect(), kafkaConsumer.disconnect()]);
 *     process.exit();
 * });
 *
 * app.listen(port, async () => {
 *     console.log(`Listening to auth-service on port ${port}...`);
 *
 *     start().catch((e)=> console.log("Error", e));
 * });
 *
 * app.get("/", (req: Request, res: Response) => {
 *     return res.send("A complete response from the user service.");
 * });
 *
 * async function start() {
 *     await kafkaConsumer.subscribe({ topic: 'user-registration' });
 *     await kafkaConsumer.run({
 *         eachMessage: async ({ topic, partition, message }) => {
 *             const userData: string = `${message.value}`;
 *             console.log(`Value in the user service .............. ${message.value}`)
 *
 *             const token: string = `${Math.random()}`;
 *             console.log("The current token is", token)
 *             await kafkaProducer.send({
 *                 topic: 'auth-token',
 *                 messages: [{ value: JSON.stringify({ test: userData, token }) }],
 *             });
 *         },
 *     });
 * }
 */