const express = require("express");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");

const app = express();
const server = createServer(app);
const io = new Server(server);

// Database configuration
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'chat',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Global variables
const globalRoom = "global";
const userList = {};

// Utility functions
const getCurrentDateTime = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
};

const sanitizeInput = (input) => {
    return input.replace(/[<>]/g, '');
};

// Database functions
const saveMessage = async (roomName, senderName, content, isUpdate = false) => {
    try {
        const query = 'INSERT INTO messages(room_name, sender_name, content, date, is_update) VALUES($1, $2, $3, $4, $5)';
        const values = [roomName, senderName, content, getCurrentDateTime(), isUpdate];
        await pool.query(query, values);
        console.log('Message saved to database');
    } catch (error) {
        console.error('Database error:', error);
    }
};

const getMessages = async (roomName) => {
    try {
        const query = 'SELECT sender_name, content, is_update, date FROM messages WHERE room_name = $1 ORDER BY id ASC';
        const result = await pool.query(query, [roomName]);
        return result.rows;
    } catch (error) {
        console.error('Database error:', error);
        return [];
    }
};

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    let currentRoom;
    let username;

    // Handle user login
    socket.on("login", async (data) => {
        try {
            username = sanitizeInput(data.username);
            const room = sanitizeInput(data.room) || globalRoom;
            
            userList[socket.id] = username;
            currentRoom = room;
            
            // Join the room
            socket.join(currentRoom);
            
            console.log(`${username} joined room: ${currentRoom}`);
            console.table(userList);
            
            // Send user list to all users in the room
            const roomUsers = Object.entries(userList)
                .filter(([socketId]) => {
                    const userSocket = io.sockets.sockets.get(socketId);
                    return userSocket && Array.from(userSocket.rooms).includes(currentRoom);
                })
                .map(([, user]) => user);
            
            io.to(currentRoom).emit("userList", roomUsers);
            
            // Send existing messages to the user
            const messages = await getMessages(currentRoom);
            socket.emit("existingMessages", messages);
            
        } catch (error) {
            console.error('Login error:', error);
            socket.emit('error', 'Failed to join room');
        }
    });

    // Handle user update (join notification)
    socket.on("update", async (data) => {
        try {
            const message = `${username} has joined room ${currentRoom}`;
            socket.broadcast.to(currentRoom).emit("update", message);
            await saveMessage(currentRoom, username, 'has joined the room', true);
        } catch (error) {
            console.error('Update error:', error);
        }
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
        const message = `${sanitizeInput(data)} is typing...`;
        socket.broadcast.to(currentRoom).emit("typing", message);
    });

    socket.on("stopTyping", () => {
        socket.broadcast.to(currentRoom).emit("stopTyping");
    });

    // Handle chat messages
    socket.on("chat", async (message) => {
        try {
            const sanitizedMessage = {
                name: sanitizeInput(message.name),
                text: sanitizeInput(message.text),
                dateTime: message.dateTime
            };
            
            // Broadcast to other users in the room
            socket.broadcast.to(currentRoom).emit("chat", sanitizedMessage);
            
            // Save to database
            await saveMessage(currentRoom, username, sanitizedMessage.text);
            
        } catch (error) {
            console.error('Chat error:', error);
        }
    });

    // Handle user leaving
    socket.on("leave", async (leavingUsername) => {
        try {
            const message = `${sanitizeInput(leavingUsername)} has left the conversation`;
            socket.broadcast.to(currentRoom).emit("leave", message);
            
            // Remove from user list
            delete userList[socket.id];
            
            // Update user list for remaining users
            const roomUsers = Object.entries(userList)
                .filter(([socketId]) => {
                    const userSocket = io.sockets.sockets.get(socketId);
                    return userSocket && Array.from(userSocket.rooms).includes(currentRoom);
                })
                .map(([, user]) => user);
            
            io.to(currentRoom).emit("userList", roomUsers);
            
            // Save leave message to database
            await saveMessage(currentRoom, username, "has left the conversation", true);
            
            console.log(`${leavingUsername} disconnected`);
            console.table(userList);
            
        } catch (error) {
            console.error('Leave error:', error);
        }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
        try {
            if (username && currentRoom) {
                const message = `${username} has left the conversation`;
                socket.broadcast.to(currentRoom).emit("leave", message);
                
                // Remove from user list
                delete userList[socket.id];
                
                // Update user list for remaining users
                const roomUsers = Object.entries(userList)
                    .filter(([socketId]) => {
                        const userSocket = io.sockets.sockets.get(socketId);
                        return userSocket && Array.from(userSocket.rooms).includes(currentRoom);
                    })
                    .map(([, user]) => user);
                
                io.to(currentRoom).emit("userList", roomUsers);
                
                // Save disconnect message to database
                await saveMessage(currentRoom, username, "has left the conversation", true);
                
                console.log(`${username} disconnected`);
                console.table(userList);
            }
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    });
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const PORT = process.env.PORT || 3009;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the chat`);
});