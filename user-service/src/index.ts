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

                // Simulate user creation in the database
                // ...

                // Produce a token message for authentication service
                const token: string = "1235234345";
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