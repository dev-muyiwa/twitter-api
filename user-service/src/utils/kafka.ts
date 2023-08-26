import {Kafka} from "kafkajs";

class KafkaService{
    private kafka: Kafka;
    constructor(brokers: string[], clientId: string) {
        this.kafka = new Kafka({brokers: brokers, clientId: clientId});
    }

    async createConnection(groupId: string) {
        const producer = this.kafka.producer();
        await producer.connect();
        const consumer = this.kafka.consumer({groupId: groupId});
        await consumer.connect();
        return {producer, consumer};
    }
}

export default KafkaService;