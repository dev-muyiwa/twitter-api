import dotenv from "dotenv";
import * as process from "process";

dotenv.config();
export const config = {
    mongo: {
        url: process.env.MONGO_URL || ""
    },
    server: {
        env: process.env.NODE_ENV ? process.env.NODE_ENV : "local",
        port: Number(process.env.PORT),
        url: process.env.BASE_URL || `http://localhost:8000`,
    }
}
