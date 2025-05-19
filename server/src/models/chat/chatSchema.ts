import mongoose, { Schema } from "mongoose";
import { IChat } from "./chatInterface";

export const ChatSchema = new Schema<IChat>(
  {
    senderId: {
      type: String,
      required: true,
      index: true // Add index for faster queries
    },
    receiverId: {
      type: String,
      required: true,
      index: true // Add index for faster queries
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {  
    timestamps: true
  }
);


ChatSchema.index({ senderId: 1, receiverId: 1 });
ChatSchema.index({ receiverId: 1, senderId: 1 });
ChatSchema.index({ receiverId: 1, isRead: 1 });
