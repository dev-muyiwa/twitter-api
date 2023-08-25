import {Request, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {Kafka} from "kafkajs";

class AuthController {

    async testKafka(req: Request, res: Response) {
        let authToken: string = "";
        const kafka = new Kafka({
            clientId: "auth-service",
            brokers: ["kafka:9093"],
        });
        const producer = kafka.producer();
        const consumer = kafka.consumer({ groupId: "auth-group"});

        await producer.connect();
        await consumer.connect();

        await consumer.subscribe({ topic: 'auth-token' });
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                // Process auth token message here
                const tokenData = JSON.parse(`${message.value}`);
                console.log(`Value is .............. ${message.value}`)
                authToken = tokenData.token;
                console.log('Received auth token:', authToken);
            },
        });

        await producer.send({
            topic: "user-registration",
            messages: [{value: "Holla👋🏾. I'm currently testing kafka from the auth service."}],
        });

        // await producer.disconnect();


        return sendSuccessResponse(res, {token: authToken}, "Auth token received.");
    }

    async register(req: Request, res: Response): Promise<Response> {
        try {
            const {firstName, lastName, handle, email, mobile, password} = req.body;
            return sendSuccessResponse(res, {name: "Registration"}, "Registration successful.", 201);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async login(req: Request, res: Response): Promise<Response> {

        return sendSuccessResponse(res, {name: "Login"}, "A test response from login endpoint.");
    }
}

export default AuthController;