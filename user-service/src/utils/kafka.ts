import {Kafka} from "kafkajs";

class KafkaService{
    private kafka: Kafka;

    constructor(brokers: string[], clientId: string) {
        this.kafka = new Kafka({brokers: brokers, clientId: clientId});
    }

    async connectProducer() {
        const producer = this.kafka.producer();
        await producer.connect();
        return producer;
    }

    async connectConsumer(groupId: string) {
        const consumer = this.kafka.consumer({groupId: groupId});
        await consumer.connect();
        return consumer;
    }
}

export default KafkaService;