import dotenv from "dotenv";
import * as process from "process";
import {setupEnv} from "@dev-muyiwa/shared-service";

dotenv.config();
export const config = {
    mongo: {
        url: process.env.MONGO_URL || ""
    },
    server: {
        app_name: process.env.APP_NAME,
        env: process.env.NODE_ENV ? process.env.NODE_ENV : "local",
        port: Number(process.env.PORT),
        url: process.env.BASE_URL || `http://localhost:8000`,
        bcrypt_rounds: process.env.BCRYPT_ROUNDS ? Number(process.env.BCRYPT_ROUNDS) : 14,


        jwt_access_secret: process.env.ACCESS_SECRET || "test",
        jwt_refresh_secret: process.env.REFRESH_TOKEN_SECRET || "refresh",
        jwt_reset_secret: process.env.RESET_TOKEN_SECRET || "",
    },

}
console.log("Access secret is:", config.server.jwt_access_secret)
setupEnv(config.server.jwt_access_secret);