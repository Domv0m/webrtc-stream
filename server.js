const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const net = require('net');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Динамический порт
const PORT = process.env.PORT || 10000;

// WebSocket обработчик
wss.on('connection', (ws) => {
    console.log('🔗 Новое подключение');

    ws.on('message', (message) => {
        console.log('📥 Получено:', message.toString());
        
        // Эхо-ответ
        ws.send(`Сервер получил: ${message}`);
    });

    ws.on('close', () => {
        console.log('👋 Клиент отключился');
    });
});

// Базовый роут
app.get('/', (req, res) => {
    res.send('VPN Туннель готов');
});

// Запуск сервера
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Сервер запущен на порту ${PORT}`);
});
