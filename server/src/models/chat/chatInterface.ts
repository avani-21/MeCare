import { Document } from "mongoose";

export interface IChat extends Document{
    _id:string,
    senderId:string,
    receiverId:string,
    message:string,
    isRead:boolean,
    createdAt?: Date;
    updatedAt?: Date;
}