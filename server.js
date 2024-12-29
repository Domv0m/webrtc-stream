const WebSocket = require('ws');
const net = require('net');

class ProxyServer {
    constructor(port = 3000) {
        this.port = port;
        this.clients = new Map();
    }

    start() {
        const wss = new WebSocket.Server({ port: this.port });

        wss.on('connection', (ws) => {
            const clientId = this.generateClientId();
            
            console.log(`Новый клиент: ${clientId}`);

            // Регистрация клиента
            this.clients.set(clientId, ws);

            ws.on('message', (message) => {
                this.handleMessage(clientId, message);
            });

            ws.on('close', () => {
                this.clients.delete(clientId);
                console.log(`Клиент отключен: ${clientId}`);
            });
        });

        console.log(`Прокси-сервер запущен на порту ${this.port}`);
    }

    generateClientId() {
        return Math.random().toString(36).substr(2, 9);
    }

    handleMessage(clientId, message) {
        try {
            const data = JSON.parse(message);
            
            switch(data.type) {
                case 'connect':
                    this.handleConnect(clientId, data);
                    break;
                case 'data':
                    this.forwardData(clientId, data);
                    break;
            }
        } catch (error) {
            console.error('Ошибка обработки сообщения:', error);
        }
    }

    handleConnect(clientId, data) {
        console.log(`Запрос подключения от ${clientId}`);
        // Логика обработки нового подключения
    }

    forwardData(clientId, data) {
        // Пересылка данных между клиентами
        const targetClient = this.clients.get(data.target);
        if (targetClient) {
            targetClient.send(JSON.stringify(data));
        }
    }
}

const server = new ProxyServer();
server.start();
