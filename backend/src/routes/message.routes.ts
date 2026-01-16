
import { createMessage, deleteMessage, getAdminInfo, getChatList, getMessages, userListMessageSend } from "../controllers/message/message.controller";
import { decodeToken, isAnyUser } from "../middleware/auth.middleware";
import { Router } from "express";

const messageRoutes = Router();

messageRoutes.post('/', decodeToken, isAnyUser, createMessage)
messageRoutes.get('/list', decodeToken, isAnyUser, getMessages)
messageRoutes.get('/list/users', decodeToken, isAnyUser, getChatList)
messageRoutes.delete('/delete', decodeToken, isAnyUser, deleteMessage)
messageRoutes.get('/user-list', decodeToken, isAnyUser, userListMessageSend)
messageRoutes.get('/admin-info', decodeToken, isAnyUser, getAdminInfo)

export default messageRoutes;

