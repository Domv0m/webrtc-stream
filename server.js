const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

app.use(express.static('public'));

let streamer = null;
const viewers = new Set();

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('register-streamer', () => {
        streamer = socket;
        console.log('Streamer registered');
    });

    socket.on('register-viewer', () => {
        viewers.add(socket);
        console.log('Viewer registered');
    });

    socket.on('stream-offer', (offer) => {
        viewers.forEach(viewer => {
            viewer.emit('stream-offer', offer);
        });
    });

    socket.on('viewer-answer', (answer) => {
        if (streamer) {
            streamer.emit('viewer-answer', answer);
        }
    });

    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        viewers.delete(socket);
        if (socket === streamer) {
            streamer = null;
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
