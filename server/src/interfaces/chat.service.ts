import { IChat } from "../models/chat/chatInterface";

export interface IChatService{
sendMessage(messageData:IChat):Promise<IChat>
getConversation(user1Id:string,user2Id:string):Promise<IChat[] | null>
 getUnreadMessageCount(receiverId:string,senderId:string):Promise<number>
  markMessagesAsRead(userId: string, senderId: string): Promise<void>;
}