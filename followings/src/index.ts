import {databaseSetup} from "./config/database";
import app from "./config/app";
import {config} from "./config/config";

const port: number = config.server.port;

databaseSetup().then(() => {
    console.log("Database connection successful...");

    // Connect to Kafka producer. This would be used to send push notifications to a followed user.

    app.listen(port, () => {
        console.log("Listening to followings service on port", port)
    });
}).catch((err) => {
    console.log("Error connecting to database:", err);
})