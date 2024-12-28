const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Разрешаем все источники
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.static('public'));

// WebRTC signaling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Логирование всех событий
    socket.on('offer', (offer) => {
        console.log('Received offer from:', socket.id);
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        console.log('Received answer from:', socket.id);
        socket.broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate) => {
        console.log('Received ICE candidate from:', socket.id);
        socket.broadcast.emit('ice-candidate', candidate);
    });

    // Обработка disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Порт для Render
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
