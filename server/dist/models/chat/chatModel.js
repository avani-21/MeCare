"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chatSchema_1 = require("./chatSchema");
const ChatModel = mongoose_1.default.model("Chat", chatSchema_1.ChatSchema);
exports.default = ChatModel;
