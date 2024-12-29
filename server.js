const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.static('public'));

// Глобальные переменные
let streamer = null;
const viewers = new Set();

// Логирование подключений
io.on('connection', (socket) => {
    console.log(`[SOCKET] New connection: ${socket.id}`);

    // Регистрация стримера
    socket.on('streamer-ready', () => {
        streamer = socket;
        console.log(`[STREAMER] Connected: ${socket.id}`);
    });

    // Запрос от зрителя
    socket.on('viewer-request', () => {
        viewers.add(socket);
        console.log(`[VIEWER] Connected: ${socket.id}`);
        
        // Если стример уже есть, можно сразу запросить стрим
        if (streamer) {
            streamer.emit('viewer-connected', socket.id);
        }
    });

    // Передача оффера от стримера
    socket.on('screen-offer', (offer) => {
        console.log(`[OFFER] Received from streamer`);
        viewers.forEach(viewer => {
            viewer.emit('screen-offer', offer);
        });
    });

    // Ответ от зрителя
    socket.on('viewer-screen-answer', (answer) => {
        console.log(`[ANSWER] Received from viewer`);
        if (streamer) {
            streamer.emit('viewer-screen-answer', answer);
        }
    });

    // Обработка ICE кандидатов
    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    // Отключение
    socket.on('disconnect', () => {
        console.log(`[DISCONNECT] Socket: ${socket.id}`);
        viewers.delete(socket);
        
        if (socket === streamer) {
            streamer = null;
            console.log('[STREAMER] Disconnected');
        }
    });
});

// Порт и запуск
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Running on port ${PORT}`);
});
