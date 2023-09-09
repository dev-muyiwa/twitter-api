import {Request, Response} from "express";
import {sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {kafkaConsumer, kafkaProducer} from "../index";
import {authService} from "../service/auth.service";
import bcrypt from "bcrypt";
import jwt, {JwtPayload} from "jsonwebtoken";
import {CustomError} from "../utils/CustomError";
import {config} from "../config/config";
import {UserDocument} from "../model/user.model";
import axios, {AxiosResponse} from "axios";
import {maskEmail} from "../utils/helper";

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
        try {
            const {email} = req.body;

            const axiosResponse: AxiosResponse = await axios.get(`http://user-service:3001/users/internal/${email}`, {
                validateStatus: (status) => {
                    return (status >= 200 && status < 505)
                },
                timeout: 10000,
                timeoutErrorMessage: "Request timed out"
            })

            const response = axiosResponse.data
            if (axiosResponse.status !== 200 && !response.data) {
                return sendSuccessResponse(res, null, response.message, axiosResponse.status)
            }

            const resetToken: string = jwt.sign({
                email: response.data.email,
            }, config.server.jwt_reset_secret, {expiresIn: "20m", subject: response.data.id});
            response.data["resetUrl"] = `${config.server.url}/auth/reset-password/${resetToken}`

            await kafkaProducer.send({
                topic: "forgot-password",
                messages: [{value: JSON.stringify(response.data)}]
            })

            const maskedEmail: string = maskEmail(response.data.email);
            return sendSuccessResponse(res, null, `Password reset email sent to ${maskedEmail}`)

        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const {newPassword} = req.body;
            const {resetToken} = req.params
            const decodedJwt = jwt.verify(resetToken, config.server.jwt_reset_secret) as JwtPayload;

            const email = decodedJwt.email;
            console.log("Reset email:", email);
            const axiosResponse: AxiosResponse = await axios.get(`http://user-service:3001/users/internal/${email}`, {
                validateStatus: (status) => {
                    return (status >= 200 && status < 505)
                },
                timeout: 10000,
                timeoutErrorMessage: "Request timed out"
            })

            const response = axiosResponse.data
            if (axiosResponse.status !== 200 && !response.data) {
                return sendSuccessResponse(res, null, response.message, axiosResponse.status)
            }

            // Generate an access token to update the user
            // make a post request to update the user


            return sendSuccessResponse(res, null, "Password reset. Please login to continue");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }
}

export default AuthController;