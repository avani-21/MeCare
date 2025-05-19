import { inject,injectable } from "inversify";
import TYPES from "../di/types";
import ChatModel from "../models/chat/chatModel";
import { IChatRepository } from "../interfaces/chatRepositort";
import { IChat } from "../models/chat/chatInterface";
import logger from "../utils/logger";

@injectable()
export class ChatReposiorty implements IChatRepository{
    private chatModel:typeof ChatModel

    constructor(
        @inject(TYPES.ChatModel) chatModel:typeof ChatModel
    ){
       this.chatModel=chatModel
    }



    async createMessage(messageData:IChat):Promise<IChat>{
        return await this.chatModel.create(messageData)
    }

    async getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<IChat[] | null> {
       await  this.chatModel.updateMany(
        {
          senderId:user2Id,
          receiverId:user1Id,
          isRead:false
        },
        {
          $set:{isRead:true}
        }
       )
         return await this.chatModel.find({
            $or:[
                {senderId:user1Id ,receiverId:user2Id},
                {senderId:user2Id,receiverId:user1Id}
            ]
         }).sort({createrAt:-1})
    }

    async getLastMessage(user1Id: string, user2Id: string): Promise<IChat | null> {
        return await this.chatModel.findOne({
          $or: [
            { senderId: user1Id, receiverId: user2Id },
            { senderId: user2Id, receiverId: user1Id }
          ]
        }).sort({ createdAt: -1 }).limit(1).exec();
      }
    
      async markMessagesAsRead(userId: string, senderId: string): Promise<void> {
        await this.chatModel.updateMany(
          { senderId, receiverId: userId, isRead: false },
          { $set: { isRead: true } }
        ).exec();
      }

      async getUnreadMessageCount(receiverId: string, senderId: string): Promise<number> {
        const unReadMessages=await this.chatModel.countDocuments({
           senderId:senderId,
           receiverId:receiverId,
           isRead:false
        })
        logger.info("Unread meaages count findede",unReadMessages)
        return unReadMessages
      }

      
 
}