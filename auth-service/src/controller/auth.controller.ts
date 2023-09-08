import {Request, response, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {kafkaConsumer, kafkaProducer} from "../index";
import {authService} from "../service/auth.service";
import bcrypt from "bcrypt";
import jwt, {JwtPayload} from "jsonwebtoken";
import {CustomError} from "../utils/CustomError";
import {config} from "../config/config";
import {UserDocument} from "../model/user.model";
import axios, {AxiosResponse, AxiosError} from "axios";

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

    async forgotPassword(req: Request, res: Response) {
        // try {
        const {email} = req.body;
        const {id} = req.body

        // Set the timeout to 20 seconds (20,000 milliseconds)
        const timeout = 20000;
        let resp: any;
        axios.get(`http://user-service:3001/users/${id}`, {
            validateStatus: (status) => {
                return (status >= 200 && status < 505)
            }
        })
            .then((response: AxiosResponse) => {

                console.log("Response.........", response.status)
                if (response.status == 200) {
                    console.log("Checkpoint B", response.data)
                    return sendSuccessResponse(res, response.data, "Request")
                } else {
                    console.log("Checkpoint C")
                    return sendSuccessResponse(res, null, "User not found", 404)
                }
            }).catch((err) => {
            console.log("Log breakpoint")
            console.log("Error is:", err)
            return sendErrorResponse(res, err);
        })
        // axios
        //     .get("http://user-service:3001/users/23", {timeout})
        //     .then((response: AxiosResponse) => {
        //         // Handle the successful response here
        //         resp = response
        //     })
        //     .catch((error: AxiosError) => {
        //         if (axios.isCancel(error)) {
        //             console.error('Request timed out:', error.message);
        //             // Handle timeout error here
        //             return sendErrorResponse(res, error, "Request timed out");
        //         } else {
        //             console.error(`Request error: ${error}`);
        //             // Handle other errors here
        //             return sendErrorResponse(res, error);
        //         }
        //     });
        // return sendSuccessResponse(res, resp, "Request");
        // } catch (err) {
        //     return sendErrorResponse(res, err);
        // }
    }
}

export default AuthController;