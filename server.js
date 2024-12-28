const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let streamerSocket = null;
const viewerSockets = new Set();

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Регистрация стримера
    socket.on('register-streamer', () => {
        streamerSocket = socket;
        console.log('Streamer connected');
    });

    // Регистрация зрителя
    socket.on('register-viewer', () => {
        viewerSockets.add(socket);
        console.log('Viewer connected');
    });

    // Передача offer от стримера
    socket.on('streamer-offer', (offer) => {
        viewerSockets.forEach(viewer => {
            viewer.emit('streamer-offer', offer);
        });
    });

    // Передача answer от зрителей
    socket.on('viewer-answer', (answer) => {
        if (streamerSocket) {
            streamerSocket.emit('viewer-answer', answer);
        }
    });

    // ICE кандидаты
    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        if (socket === streamerSocket) {
            streamerSocket = null;
            console.log('Streamer disconnected');
        }
        viewerSockets.delete(socket);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
