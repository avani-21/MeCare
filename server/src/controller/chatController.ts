import { inject,injectable } from "inversify";
import TYPES from "../di/types";
import { IChatService } from "../interfaces/chat.service";
import { Request, Response } from "express";
import { HttpStatus } from "../utils/httptatus";
import { errorResponse, successResponse } from "../types/types";
import { StatusMessages } from "../utils/message";
import logger from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/patientAuthMiddleware";

@injectable()
export class ChatController{
    constructor(
        @inject(TYPES.ChatService) private _chatService:IChatService
    ){}

    async sendMessage(req:AuthenticatedRequest,res:Response){
        try {
             let messageData={
                senderId:req.user?.id,
                ...req.body
             }
            const newMessage=await this._chatService.sendMessage(messageData)
            if(newMessage){
                logger.info("New mwssage created successfully")
                return res.status(HttpStatus.CREATED).json(successResponse(StatusMessages.CREATED,newMessage))
            }
        } catch (error:any) {
            logger.error("Error ocuured while creating new message",error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error)) 
        }
    }


    async getConversation(req:AuthenticatedRequest,res:Response){
        try {
            const { user1Id} = req.params;
            const user2Id=req.user?.id
            if(!user2Id){
                logger.warn("Id not fount in the jwt  decode")
                return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT))
            }
            logger.info("Users id",user1Id,user2Id)
            const message=await this._chatService.getConversation(user1Id,user2Id)
            if(message){
                logger.info("Converstion getted successfully")
                return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK,message))
            }
        } catch (error:any) {
            logger.error("Error occurede while getting the conversion",error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR,error))
        }
    }

async getUnreadMessageCount(req: AuthenticatedRequest, res: Response) {
  try {
    const senderId = req.params.id;
    const receiverId = req.user?.id;

    if (!senderId) {
      logger.warn("Sender id not found");
      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT));
    }

    if (!receiverId) {
      logger.warn("Receiver id not found");
      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT)
    );
    }

    const response = await this._chatService.getUnreadMessageCount(receiverId, senderId);
    logger.info("Unread message count fetched successfully");
    return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK, response));
  } catch (error) {
    logger.error("Error occurred in fetching the unread message count", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR));
  }
}

async markMessageAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const receiverId = req.user?.id;
    const senderId = req.params.id;

    if (!receiverId || !senderId) {
      logger.warn("Receiver or sender id not found");
      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(StatusMessages.ID_NOT_FOUNT));
    }

    await this._chatService.markMessagesAsRead(receiverId, senderId);
    const unreadCount = await this._chatService.getUnreadMessageCount(receiverId, senderId);

    logger.info("Messages marked as read successfully");
    return res.status(HttpStatus.OK).json(successResponse(StatusMessages.OK, { unreadCount }));
  } catch (error) {
    logger.error("Error occurred while marking messages as read", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse(StatusMessages.INTERNAL_SERVER_ERROR));
  }
}
    
}