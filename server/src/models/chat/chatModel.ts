import mongoose from "mongoose";
import { IChat } from "./chatInterface";
import { ChatSchema } from "./chatSchema";

const ChatModel=mongoose.model<IChat>("Chat",ChatSchema)

export default ChatModel