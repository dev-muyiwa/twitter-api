import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {UserDocument, UserModel} from "../model/user.model";
import {CustomError, sendErrorResponse, sendSuccessResponse} from "@dev-muyiwa/shared-service";
import {config} from "../config/config";
import {kafkaProducer} from "../index";
import jwt, {JwtPayload} from "jsonwebtoken";
import {KafkaEvent} from "@dev-muyiwa/shared-service";
import {findUser} from "../service/user.service";
import {maskEmail} from "../utils/helper";

class AuthController {
    async register(req: Request, res: Response): Promise<Response> {
        try {
            const {firstName, lastName, handle, email, mobile, password} = req.body;

            const existingUser: UserDocument | null = await UserModel.findOne({
                $or: [{email: email}, {mobile: mobile}, {handle: handle}]
            });
            if (existingUser) {
                throw new CustomError("User(s) exists with this credential(s).", CustomError.BAD_REQUEST);
            }
            const user: UserDocument = await new UserModel({
                firstName: firstName,
                lastName: lastName,
                handle: handle,
                email: email,
                mobile: mobile,
                passwordHash: await bcrypt.hash(password, config.server.bcrypt_rounds)
            }).save();

            const activationToken: string = jwt.sign({
                email: user.email
            }, config.server.jwt_activation_secret, {expiresIn: "24h", subject: user.id})

            const activationUrl: string = `${config.server.url}/auth/activate-account?t=${activationToken}`;

            await kafkaProducer.send({
                topic: KafkaEvent.ACCOUNT_VERIFICATION,
                messages: [{value: JSON.stringify({...user.getBasicInfo(), activationUrl: activationUrl})}]
            });

            return sendSuccessResponse(res, user.getBasicInfo(), "Registration successful", 201);
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async login(req: Request, res: Response): Promise<Response> {
        try {
            const {username, password} = req.body;
            const user: UserDocument | null = await UserModel.findOne({
                $or: [{email: username}, {mobile: username}, {handle: username}]
            });

            if (!user || !await bcrypt.compare(password, user.passwordHash)) {
                throw new CustomError("Invalid login credentials", CustomError.BAD_REQUEST)
            }

            if (!user.isVerified) {
                const activationToken: string = jwt.sign({
                    email: user.email
                }, config.server.jwt_activation_secret, {expiresIn: "24h", subject: user.id})

                const activationUrl: string = `${config.server.url}/auth/activate-account?t=${activationToken}`;

                await kafkaProducer.send({
                    topic: KafkaEvent.ACCOUNT_VERIFICATION,
                    messages: [{value: JSON.stringify({...user.getBasicInfo(), activationUrl: activationUrl})}]
                });

                throw new CustomError("Account isn't verified yet. Check email for activation link", CustomError.UNAUTHORIZED)
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

    async activateAccount(req: Request, res: Response): Promise<Response> {
        try {
            const activationToken = req.query.t as string;
            const decodedJwt = jwt.verify(activationToken, config.server.jwt_activation_secret) as JwtPayload | null;

            if (!decodedJwt || decodedJwt.exp! < Date.now() / 1000) {
                throw new CustomError("Activation token has expired");
            }

            const user: UserDocument | null = await UserModel.findOne({
                _id: decodedJwt.sub,
                email: decodedJwt.email
            })

            if (!user) {
                throw new CustomError("User does not exist");
            }

            await user.updateOne({
                isVerified: true
            })

            await kafkaProducer.send({
                topic: KafkaEvent.ACCOUNT_REGISTRATION,
                messages: [{value: JSON.stringify(user.getBasicInfo())}]
            });

            return sendSuccessResponse(res, null, "Account activated");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<Response> {
        try {
            const {email} = req.body;
            const user: UserDocument = await findUser(email);

            const resetToken: string = jwt.sign({
                email: user.email,
            }, config.server.jwt_reset_secret, {expiresIn: "20m", subject: user.id});

            await user.updateOne({
                resetToken: resetToken
            })

            const resetUrl: string = `${config.server.url}/auth/reset-password/${resetToken}`

            await kafkaProducer.send({
                topic: KafkaEvent.FORGOT_PASSWORD,
                messages: [{value: JSON.stringify({...user.getBasicInfo(), resetUrl: resetUrl})}]
            })

            const maskedEmail: string = maskEmail(user.email);
            return sendSuccessResponse(res, null, `Password reset email sent to ${maskedEmail}`)
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }

    async resetPassword(req: Request, res: Response): Promise<Response> {
        try {
            const {resetToken} = req.params;
            const {newPassword} = req.body;

            const decodedJwt = jwt.verify(resetToken, config.server.jwt_reset_secret) as JwtPayload | null;

            if (!decodedJwt || decodedJwt.exp! < Date.now() / 1000) {
                throw new CustomError("Reset token has expired");
            }

            const user: UserDocument | null = await UserModel.findOne({
                _id: decodedJwt.sub,
                resetToken: resetToken,
                email: decodedJwt.email
            })

            if (!user) {
                throw new CustomError("User does not exist");
            }

            await user.updateOne({
                password: await bcrypt.hash(newPassword, config.server.bcrypt_rounds),
                refreshToken: null,
                resetToken: null
            });

            await kafkaProducer.send({
                topic: KafkaEvent.PASSWORD_RESET,
                messages: [{value: JSON.stringify(user.getBasicInfo())}]
            });

            return sendSuccessResponse(res, null, "Password reset. Please login to continue");
        } catch (err) {
            return sendErrorResponse(res, err);
        }
    }
}

export default AuthController;