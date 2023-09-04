import {Request, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {Kafka} from "kafkajs";
import {kafkaConsumer, kafkaProducer} from "../index";
import {authService} from "../service/auth.service";
import bcrypt from "bcrypt";
import jwt, {JwtPayload} from "jsonwebtoken";
import {CustomError} from "../utils/CustomError";
import {config} from "../config/config";
import {UserDocument} from "../model/user.model";

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

            const user: UserDocument = await authService.createUser({
                firstName,
                lastName,
                handle,
                email,
                mobile,
                password
            });

            await kafkaProducer.send({
                topic: "user-registration",
                messages: [{value: user.email}]
            });

            return sendSuccessResponse(res, user.getBasicInfo(), "Registration successful", 201);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async login(req: Request, res: Response): Promise<Response> {
        try {
            const {username, password} = req.body;
            const user: UserDocument = await authService.findUser(username);

            if (!await bcrypt.compare(password, user.passwordHash)) {
                throw new CustomError("Invalid login credentials", CustomError.BAD_REQUEST)
            }

            if (!user.isVerified) {
                await kafkaProducer.send({
                    topic: "user-verification",
                    messages: [{value: `${user.email}`}]
                });
            }

            let refreshToken: string;
            let decodedJwt: JwtPayload | null = null;

            if (user.refreshToken) {
                decodedJwt = jwt.verify(user.refreshToken, config.server.jwt_refresh_secret) as JwtPayload;
            }

            if (!decodedJwt || decodedJwt.exp! < Date.now() / 1000) {
                refreshToken = jwt.sign({
                    name: user.firstName + ' ' + user.lastName,
                    role: user.role
                }, config.server.jwt_refresh_secret, {expiresIn: "7d", subject: user.id});

                await user.updateOne({
                    refreshToken: refreshToken
                })
            } else {
                refreshToken = user.refreshToken
            }

            const accessToken: string = jwt.sign({
                name: user.firstName + ' ' + user.lastName,
                role: user.role
            }, config.server.jwt_access_secret, {expiresIn: "30m", subject: user.id});

            return sendSuccessResponse(res, {
                accessToken: accessToken,
                refreshToken: refreshToken
            }, "Login successful");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }
}

export default AuthController;