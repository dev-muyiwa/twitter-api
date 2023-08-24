import {Kafka, logLevel} from "kafkajs";

const kafka = new Kafka({brokers: ["kafka:9092"], clientId: "auth-service", logLevel: logLevel.DEBUG});

