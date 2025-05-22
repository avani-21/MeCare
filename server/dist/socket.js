"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = __importDefault(require("./config/redis"));
const chatModel_1 = __importDefault(require("./models/chat/chatModel"));
const logger_1 = __importDefault(require("./utils/logger"));
class SocketService {
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });
        this.initialize();
    }
    static getInstance(server) {
        if (!SocketService.instance && server) {
            SocketService.instance = new SocketService(server);
        }
        return SocketService.instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!redis_1.default.isReady()) {
                    yield redis_1.default.connect();
                }
                const pubClient = redis_1.default.getClient();
                const subClient = pubClient.duplicate();
                this.io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
                logger_1.default.info('Socket.IO Redis adapter initialized');
                this.io.on('connection', (socket) => {
                    logger_1.default.info(`User connected: ${socket.id}`);
                    // Join room based on user ID
                    socket.on('join', (userId) => {
                        socket.join(userId);
                        logger_1.default.info(`User ${userId} joined their room`);
                    });
                    // Handle sending messages
                    socket.on('sendMessage', (data) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const { senderId, receiverId, message } = data;
                            // Save message to database
                            const newMessage = new chatModel_1.default({
                                senderId,
                                receiverId,
                                message,
                                isRead: false
                            });
                            yield newMessage.save();
                            // Emit to receiver
                            this.io.to(receiverId).emit('receiveMessage', newMessage);
                            // Also emit to sender for their own UI update
                            this.io.to(senderId).emit('receiveMessage', newMessage);
                            logger_1.default.info(`Message sent from ${senderId} to ${receiverId}`);
                        }
                        catch (err) {
                            logger_1.default.error('Error sending message:', err);
                        }
                    }));
                    // Handle marking messages as read
                    socket.on('markAsRead', (_a) => __awaiter(this, [_a], void 0, function* ({ userId, senderId }) {
                        try {
                            yield chatModel_1.default.updateMany({ senderId, receiverId: userId, isRead: false }, { $set: { isRead: true } });
                            const unreadCount = yield chatModel_1.default.countDocuments({
                                senderId,
                                receiverId: userId,
                                isRead: false
                            });
                            this.io.to(userId).emit('messagesRead', { senderId, unreadCount });
                            this.io.to(senderId).emit('messagesRead', { receiverId: userId, unreadCount });
                            logger_1.default.info(`Messages from ${senderId} marked as read by ${userId}`);
                        }
                        catch (err) {
                            logger_1.default.error('Error marking messages as read:', err);
                        }
                    }));
                    socket.on('disconnect', () => {
                        logger_1.default.info(`User disconnected: ${socket.id}`);
                    });
                });
            }
            catch (err) {
                logger_1.default.error('Socket.IO initialization error:', err);
            }
        });
    }
    getIO() {
        return this.io;
    }
}
exports.default = SocketService;
