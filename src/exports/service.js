const amqp = require('amqplib');

class ProducerService {
    constructor() {
        this._channel = null;
    }

    async connect() {
        const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
        const channel = await connection.createChannel();
        await channel.assertQueue('export:playlists', { durable: true });
        this._channel = channel;
    }

    async sendMessage(queue, message) {
        if (!this._channel) {
            await this.connect();
        }
        this._channel.sendToQueue(queue, Buffer.from(message));
    }
}

module.exports = ProducerService;
