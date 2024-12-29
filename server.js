const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const net = require('net');
const dgram = require('dgram');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Динамический порт
const PORT = process.env.PORT || 10000;
const MINECRAFT_PORT = 19132;

// UDP сервер для Minecraft
const minecraftUdpServer = dgram.createSocket('udp4');

// Логирование с метками времени
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
}

// Базовый роут
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        service: 'Minecraft Proxy',
        ports: {
            http: PORT,
            minecraft: MINECRAFT_PORT
        }
    });
});

// Настройка UDP сервера
minecraftUdpServer.on('listening', () => {
    const address = minecraftUdpServer.address();
    log(`UDP сервер прослушивает ${address.address}:${address.port}`);
});

minecraftUdpServer.on('message', (msg, rinfo) => {
    log(`Получено UDP сообщение от ${rinfo.address}:${rinfo.port}`);
    log(`Размер сообщения: ${msg.length} байт`);
    
    // Базовая обработка пакетов Minecraft
    try {
        // Здесь можно добавить декодирование пакетов Minecraft
        const packetType = msg[0]; // Первый байт часто указывает тип пакета
        log(`Тип пакета: 0x${packetType.toString(16)}`);
    } catch (error) {
        log(`Ошибка обработки пакета: ${error}`, 'error');
    }
});

minecraftUdpServer.on('error', (err) => {
    log(`Ошибка UDP сервера: ${err}`, 'error');
});

// WebSocket для дополнительной диагностики
wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    log(`Новое WebSocket подключение от ${clientIp}`);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            log(`Получены данные: ${JSON.stringify(data)}`);

            // Диагностический ответ
            ws.send(JSON.stringify({
                status: 'connected',
                message: 'Готов к обработке Minecraft-соединения',
                clientIp: clientIp
            }));
        } catch (error) {
            log(`Ошибка обработки сообщения: ${error}`, 'error');
        }
    });
});

// Функция запуска серверов
function startServers() {
    return new Promise((resolve, reject) => {
        try {
            // HTTP/WebSocket сервер
            server.listen(PORT, '0.0.0.0', () => {
                log(`HTTP/WebSocket сервер запущен на порту ${PORT}`);
            });

            // UDP сервер для Minecraft
            minecraftUdpServer.bind(MINECRAFT_PORT, '0.0.0.0', () => {
                log(`UDP сервер Minecraft запущен на порту ${MINECRAFT_PORT}`);
                resolve();
            });
        } catch (error) {
            log(`Критическая ошибка запуска: ${error}`, 'error');
            reject(error);
        }
    });
}

// Основная функция
async function main() {
    try {
        await startServers();
        log('Все сервера успешно запущены');
    } catch (error) {
        log(`Ошибка инициализации: ${error}`, 'error');
        process.exit(1);
    }
}

// Запуск
main();

// Обработка неперехваченных исключений
process.on('uncaughtException', (error) => {
    log(`Непредвиденная ошибка: ${error}`, 'critical');
});
