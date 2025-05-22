import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server as HttpServer } from 'http';
import redisClient from './config/redis';
import ChatModel from './models/chat/chatModel';
import logger from './utils/logger';

class SocketService {
  private io: Server;
  private static instance: SocketService;

  private constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.initialize();
  }

  public static getInstance(server?: HttpServer): SocketService {
    if (!SocketService.instance && server) {
      SocketService.instance = new SocketService(server);
    }
    return SocketService.instance;
  }

  private async initialize() {
    try {

        if (!redisClient.isReady()) {
            await redisClient.connect();
          }

      const pubClient = redisClient.getClient();
      const subClient = pubClient.duplicate();
      

      this.io.adapter(createAdapter(pubClient, subClient));
      logger.info('Socket.IO Redis adapter initialized');

      this.io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.id}`);

        // Join room based on user ID
        socket.on('join', (userId: string) => {
          socket.join(userId);
          logger.info(`User ${userId} joined their room`);
        });

        // Handle sending messages
        socket.on('sendMessage', async (data: { senderId: string; receiverId: string; message: string }) => {
          try {
            const { senderId, receiverId, message } = data;
            
            // Save message to database
            const newMessage = new ChatModel({
              senderId,
              receiverId,
              message,
              isRead: false
            });

            await newMessage.save();

            // Emit to receiver
            this.io.to(receiverId).emit('receiveMessage', newMessage);
            
            // Also emit to sender for their own UI update
            this.io.to(senderId).emit('receiveMessage', newMessage);

            logger.info(`Message sent from ${senderId} to ${receiverId}`);
          } catch (err) {
            logger.error('Error sending message:', err);
          }
        });

        // Handle marking messages as read
socket.on('markAsRead', async ({ userId, senderId }) => {
  try {
    await ChatModel.updateMany(
      { senderId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    const unreadCount = await ChatModel.countDocuments({
      senderId,
      receiverId: userId,
      isRead: false
    });

    this.io.to(userId).emit('messagesRead', { senderId, unreadCount });
    this.io.to(senderId).emit('messagesRead', { receiverId: userId, unreadCount });

    logger.info(`Messages from ${senderId} marked as read by ${userId}`);
  } catch (err) {
    logger.error('Error marking messages as read:', err);
  }
});

        socket.on('disconnect', () => {
          logger.info(`User disconnected: ${socket.id}`);
        });
      });
    } catch (err) {
      logger.error('Socket.IO initialization error:', err);
    }
  }

  public getIO(): Server {
    return this.io;
  }
}

export default SocketService;