import {Request, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {Kafka} from "kafkajs";
import {kafkaConsumer, kafkaProducer} from "../index";
import {authService} from "../service/auth.service";

class AuthController {

    async testKafka(req: Request, res: Response) {
        let authToken: any = null;

        await kafkaConsumer.subscribe({topic: 'auth-token'});
        await kafkaConsumer.run({
            eachMessage: async ({topic, partition, message}) => {
                const tokenData = JSON.parse(`${message.value}`);
                console.log(`Topic is .............. ${topic}`)

                authToken = tokenData.token;
                console.log('Received auth token:', authToken);
            },
        });

        await kafkaProducer.send({
            topic: "user-registration",
            messages: [{value: "Holla👋🏾. I'm currently testing kafka from the auth service."}],
        });

        while (!authToken) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return sendSuccessResponse(res, {token: authToken}, "Auth token received.");
    }

    async homeResponse(req: Request, res: Response) {
        return sendSuccessResponse(res, null, "Test response from the auth service.");
    }

    async register(req: Request, res: Response): Promise<Response> {
        try {
            console.log(req.body);
            const {firstName, lastName, handle, email, mobile, password} = req.body;

            const user = await authService.createUser({firstName, lastName, handle, email, mobile, password});

            return sendSuccessResponse(res, user, "Registration successful.", 201);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async login(req: Request, res: Response): Promise<Response> {

        return sendSuccessResponse(res, {name: "Login"}, "A test response from login endpoint.");
    }
}

export default AuthController;