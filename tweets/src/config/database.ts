import mongoose from "mongoose";
import {config} from "./config";

export const databaseSetup = async () => {
    try {
        await mongoose.connect(config.mongo.url);
    } catch (err) {
        throw err;
    }
}