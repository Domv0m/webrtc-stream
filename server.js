const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let streamer = null;
const viewers = new Set();

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    socket.on('streamer-ready', () => {
        streamer = socket;
        console.log('Streamer connected');
    });

    socket.on('viewer-request', () => {
        viewers.add(socket);
        if (streamer) {
            streamer.emit('viewer-request');
        }
    });

    socket.on('streamer-offer', (offer) => {
        viewers.forEach(viewer => {
            viewer.emit('streamer-offer', offer);
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
            console.log('Streamer disconnected');
