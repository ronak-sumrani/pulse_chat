import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { ENV } from '../lib/env.js';
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js';


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// this is for storing online users and their corresponding socket ids
const userSocketMap = {}; // {userId: socketId}

// listen for socket connections
io.on('connection', (socket) => {
    console.log("A user connected", socket.user.fullName);
    const userId = socket.userId;
    userSocketMap[userId] = socket.id; // store the mapping of userId to socketId

    // io emit is used to send evnets to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // send the list of online userIds to all clients

    // with socket.on we can listen for events from the client
    socket.on('disconnect', () => {
        console.log("A user disconnected", socket.user.fullName);
        delete userSocketMap[userId]; // remove the user from the online users map
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // update the list of online userIds to all clients
    })
});

export { io, app, server };