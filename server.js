const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const net = require('net');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Динамический порт
const PORT = process.env.PORT || 10000;

// Безопасный запуск серверов
function startServers() {
    try {
        // HTTP/WebSocket сервер
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`HTTP/WS сервер запущен на порту ${PORT}`);
        });

        // Minecraft UDP прокси
        const minecraftServer = net.createServer((socket) => {
            console.log('Входящее Minecraft подключение');
        });

        // Попытка запуска на том же порту
        minecraftServer.listen(PORT, '0.0.0.0', () => {
            console.log(`Minecraft UDP сервер запущен на порту ${PORT}`);
        });

        // Обработка ошибок
        server.on('error', (error) => {
            console.error('Ошибка HTTP сервера:', error);
        });

        minecraftServer.on('error', (error) => {
            console.error('Ошибка Minecraft сервера:', error);
        });

    } catch (error) {
        console.error('Критическая ошибка запуска:', error);
    }
}

// Базовый роут
app.get('/', (req, res) => {
    res.send('Minecraft Proxy Server');
});

// WebSocket обработчик
wss.on('connection', (ws) => {
    console.log('Новое WebSocket подключение');
    
    ws.on('message', (message) => {
        console.log('Получено сообщение:', message);
    });
});

// Запуск серверов
startServers();
