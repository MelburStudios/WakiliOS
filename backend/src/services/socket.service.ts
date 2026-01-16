import { Server, Socket } from 'socket.io';
import  Message  from '../models/message/message.model';
import { User } from '../models/user.model';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

// Custom error types for socket operations
class SocketError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SocketError';
  }
}

interface JwtPayload {
  id: string;
  role: string;
}

interface ServerToClientEvents {
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  newMessage: (data: { message: any; sender: any }) => void;
  messageSent: (message: any) => void;
  messageError: (data: { error: string; code: string }) => void;
  userTyping: (userId: string) => void;
  userStoppedTyping: (userId: string) => void;
  messageReadByReceiver: (messageId: string) => void;
  connectionError: (data: { error: string; code: string }) => void;
}

interface ClientToServerEvents {
  authenticate: (userId: string, callback: (error?: { message: string; code: string }) => void) => void;
  privateMessage: (data: MessageData, callback: (error?: { message: string; code: string }, message?: any) => void) => void;
  typing: (data: TypingData) => void;
  stopTyping: (data: TypingData) => void;
  messageRead: (messageId: string, callback: (error?: { message: string; code: string }) => void) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
  authenticated: boolean;
}

type MessageData = {
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: string[];
};

type TypingData = {
  senderId: string;
  receiverId: string;
};

export class SocketService {
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor(io: Server) {
    this.io = io;
    this.setupSocketEvents();
  }

  private async retryOperation<T>(operation: () => Promise<T>, retries = this.MAX_RETRIES): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.retryOperation(operation, retries - 1);
      }
      throw error;
    }
  }

  private setupSocketEvents(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new SocketError('Authentication failed: No token provided', 'AUTH_NO_TOKEN');
        }

        // Verify JWT token
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        if (!decoded || !decoded.id) {
          throw new SocketError('Authentication failed: Invalid token', 'AUTH_INVALID_TOKEN');
        }

        const user = await User.findById(decoded.id);
        if (!user) {
          throw new SocketError('Authentication failed: User not found', 'AUTH_USER_NOT_FOUND');
        }

        socket.data.userId = decoded.id;
        socket.data.authenticated = true;
        next();
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          next(new SocketError('Authentication failed: Invalid token', 'AUTH_INVALID_TOKEN'));
        } else {
          next(error instanceof SocketError ? error : new SocketError('Authentication failed', 'AUTH_FAILED'));
        }
      }
    });

    this.io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
      console.log(`New client connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', async (userId: string, callback) => {
        try {
          await this.retryOperation(async () => {
            this.connectedUsers.set(userId, socket.id);
            socket.join(userId);
            console.log(`User ${userId} authenticated`);
            
            // Notify user's contacts that they're online
            this.io.emit('userOnline', userId);
            callback();
          });
        } catch (error) {
          console.error('Authentication error:', error);
          callback({ message: 'Authentication failed', code: 'AUTH_FAILED' });
        }
      });

      // Handle private messages with retry mechanism
      socket.on('privateMessage', async (data: MessageData, callback) => {
        try {
          const message = await this.retryOperation(async () => {
            const newMessage = await Message.create({
              sender: this.createObjectId(data.senderId),
              receiver: this.createObjectId(data.receiverId),
              content: data.content,
              attachments: data.attachments || []
            });

            const populatedMessage = await newMessage.populate([
              { path: 'sender', select: 'name email image' },
              { path: 'receiver', select: 'name email image' }
            ]);

            // Emit to receiver
            const receiverSocketId = this.connectedUsers.get(data.receiverId);
            if (receiverSocketId) {
              this.io.to(receiverSocketId).emit('newMessage', {
                message: populatedMessage,
                sender: populatedMessage.sender
              });
            }

            return populatedMessage;
          });

          callback(undefined, message);
        } catch (error) {
          console.error('Error sending message:', error);
          callback({ 
            message: error instanceof SocketError ? error.message : 'Failed to send message',
            code: error instanceof SocketError ? error.code : 'MESSAGE_SEND_FAILED'
          });
        }
      });

      // Handle typing indicators with debounce
      let typingTimeouts: { [key: string]: NodeJS.Timeout } = {};
      
      socket.on('typing', (data: TypingData) => {
        const receiverSocketId = this.connectedUsers.get(data.receiverId);
        if (receiverSocketId) {
          // Clear existing timeout
          if (typingTimeouts[data.senderId]) {
            clearTimeout(typingTimeouts[data.senderId]);
          }

          this.io.to(receiverSocketId).emit('userTyping', data.senderId);

          // Set new timeout
          typingTimeouts[data.senderId] = setTimeout(() => {
            this.io.to(receiverSocketId).emit('userStoppedTyping', data.senderId);
            delete typingTimeouts[data.senderId];
          }, 3000); // Stop typing after 3 seconds of inactivity
        }
      });

      // Handle read receipts with retry
      socket.on('messageRead', async (messageId: string, callback) => {
        try {
          await this.retryOperation(async () => {
            const message = await Message.findByIdAndUpdate(
              messageId,
              { read: true },
              { new: true }
            );

            if (!message) {
              throw new SocketError('Message not found', 'MESSAGE_NOT_FOUND');
            }

            const senderSocketId = this.connectedUsers.get(message.sender.toString());
            if (senderSocketId) {
              this.io.to(senderSocketId).emit('messageReadByReceiver', messageId);
            }
          });

          callback();
        } catch (error) {
          console.error('Error marking message as read:', error);
          callback({ message: 'Failed to mark message as read', code: 'MESSAGE_READ_FAILED' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        // Clear any typing timeouts for this user
        if (socket.data.userId && typingTimeouts[socket.data.userId]) {
          clearTimeout(typingTimeouts[socket.data.userId]);
          delete typingTimeouts[socket.data.userId];
        }

        // Remove user from connected users and notify others
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId);
            this.io.emit('userOffline', userId);
            break;
          }
        }
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Method to emit events to specific users with retry
  public async emitToUser(userId: string, event: keyof ServerToClientEvents, data: any): Promise<void> {
    await this.retryOperation(async () => {
      const socketId = this.connectedUsers.get(userId);
      if (socketId) {
        this.io.to(socketId).emit(event, data);
      }
    });
  }

  // Method to broadcast events to all connected users with retry
  public async broadcast(event: keyof ServerToClientEvents, data: any): Promise<void> {
    await this.retryOperation(async () => {
      this.io.emit(event, data);
    });
  }

  private createObjectId(id: string): Types.ObjectId {
    try {
      return Types.ObjectId.createFromHexString(id);
    } catch (error) {
      throw new SocketError('Invalid ID format', 'INVALID_ID_FORMAT');
    }
  }
}

export default SocketService; 