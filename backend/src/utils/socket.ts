import { Server, Socket } from "socket.io";
import http from "http";
import jwt from 'jsonwebtoken';
import { config } from "../config/config";

interface User {
  _id: string;
  uid: string;
}

const secret = config.jwt.secret as string;

export const socket = (httpServer: http.Server) => {
  let io = new Server(httpServer, {
    cors: {
      origin: '*',
    }
  });


  let users: { [key: string]: string[] } = {};
  io.on('connection', (socket: Socket) => {
    console.log('connected');
    
    let token = socket.handshake?.auth?.token || socket.handshake?.headers?.token;
    let user: User | undefined;

    if (token) {
      try {
        user = jwt.verify(token, secret) as User;

        let connected = users[user._id] || [];
        connected.push(socket.id);
        users[user._id] = connected;
      } catch (e) {
        console.error('JWT verification error:', e);
        return;
      }
    }
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('disconnect', () => {
      if (user) {
        let connected = users[user._id] || [];
        connected = connected.filter(id => id !== socket.id);
        users[user._id] = connected;
      }
    });
  });

  const notify = (_id: string, event: string, data: any) => {
    let connected = users[_id] || [];
    connected.forEach(id => {
      io.to(id).emit(event, data);
    });
  };

  return {
    io,
    notify
  };
};

