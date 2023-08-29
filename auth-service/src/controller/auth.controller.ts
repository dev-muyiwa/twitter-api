import {Request, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {Kafka} from "kafkajs";
import {kafkaConsumer, kafkaProducer} from "../index";
import {authService} from "../service/auth.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {CustomError} from "../utils/CustomError";
import {config} from "../config/config";

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
            const {firstName, lastName, handle, email, mobile, password} = req.body;

            const user = await authService.createUser({firstName, lastName, handle, email, mobile, password});

            // Send an account creation email.
            await kafkaProducer.send({
                topic: "user-verification-email",
                messages: [{value: `${user.firstName}`}],
            });

            return sendSuccessResponse(res, user.getBasicInfo(), "Registration successful", 201);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async login(req: Request, res: Response): Promise<Response> {
        try {
            const {username, password} = req.body;
            const user = await authService.findUser(username);

            if (!await bcrypt.compare(password, user.passwordHash)) {
                throw new CustomError("Invalid username/password", CustomError.BAD_REQUEST)
            }

            // if(!user.isVerified){
            //
            // }

            // Send a verification mail if the account isn't verified yet.
            // Check if account is suspended.
            // Check if 2FA is active to send OTP.
            // Send access and refresh token.
            const refreshToken: string = user.refreshToken ?? jwt.sign({
                name: user.firstName + ' ' + user.lastName,
                role: user.role
            }, config.server.jwt_refresh_secret, {expiresIn: "7d", subject: user.id})

            if (!refreshToken || !jwt.verify(user.refreshToken, config.server.jwt_refresh_secret)) {
                await user.updateOne({
                    refreshToken: refreshToken
                })
            }

            const accessToken: string = jwt.sign({
                name: user.firstName + ' ' + user.lastName,
                role: user.role
            }, config.server.jwt_access_secret, {expiresIn: "30m", subject: user.id});

            console.log("Refresh token is", refreshToken);
            return sendSuccessResponse(res, {
                accessToken: accessToken,
                refreshToken: refreshToken
            }, "Login successful.");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }
}

export default AuthController;