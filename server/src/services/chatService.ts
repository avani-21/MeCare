import { inject,injectable } from "inversify";
import TYPES from "../di/types";
import { IChatService } from "../interfaces/chat.service";
import { IChatRepository } from "../interfaces/chatRepositort";
import { IChat } from "../models/chat/chatInterface";

@injectable()
export  class ChatService implements IChatService{
    private _chatRepository:IChatRepository;

    constructor(
        @inject(TYPES.ChatRepository) _chatRepository:IChatRepository
    ){
     this._chatRepository=_chatRepository
    }


   async sendMessage(messageData: IChat): Promise<IChat> {
       return await this._chatRepository.createMessage(messageData)
   }

   async getConversation(user1Id: string, user2Id: string): Promise<IChat[] | null> {
       return await this._chatRepository.getMessagesBetweenUsers(user1Id,user2Id)
   }

   async getUnreadMessageCount(receiverId: string, senderId: string): Promise<number> {
        return await this._chatRepository.getUnreadMessageCount(receiverId,senderId)
   }

   async markMessagesAsRead(userId: string, senderId: string): Promise<void> {
       return await this._chatRepository.markMessagesAsRead(userId,senderId)
   }
}