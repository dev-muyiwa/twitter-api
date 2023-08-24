import {Request, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {Kafka} from "kafkajs";

class AuthController {

    async testKafka() {
        const kafka = new Kafka({
            clientId: 'auth-service',
            brokers: ['kafka:9092'],
        });
        const producer = kafka.producer();
        await producer.connect();
        // await producer.send({
        //     topic: 'user-registration',
        //     messages: [{value: "Holla👋🏾. I'm currently testing kafka."}],
        // });
        producer.on("producer.network.request_timeout", async (err) => {
            console.log("request timeout...........",)
            await producer.disconnect()

            return "unable to connect"
        })

        producer.on("producer.connect", async ()=> {
            await producer.send({
                topic: 'user-registration',
                messages: [{value: "Holla👋🏾. I'm currently testing kafka."}],
            });
            console.log("Message sent to a topic.")
        })


        // await producer.disconnect()

        return "Topic sent"
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