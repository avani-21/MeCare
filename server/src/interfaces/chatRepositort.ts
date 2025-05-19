import { IChat } from "../models/chat/chatInterface";


export interface IChatRepository{
    createMessage(messageData:IChat):Promise<IChat>
    getMessagesBetweenUsers(user1Id:string,user2Id:string):Promise<IChat[] | null>
    getLastMessage(user1Id: string, user2Id: string): Promise<IChat | null>;
    markMessagesAsRead(userId: string, senderId: string): Promise<void>;
    getUnreadMessageCount(receiverId:string,senderId:string):Promise<number>
}