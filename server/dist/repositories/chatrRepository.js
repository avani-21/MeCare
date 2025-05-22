"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatReposiorty = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const logger_1 = __importDefault(require("../utils/logger"));
let ChatReposiorty = class ChatReposiorty {
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    createMessage(messageData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatModel.create(messageData);
        });
    }
    getMessagesBetweenUsers(user1Id, user2Id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.chatModel.updateMany({
                senderId: user2Id,
                receiverId: user1Id,
                isRead: false
            }, {
                $set: { isRead: true }
            });
            return yield this.chatModel.find({
                $or: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id }
                ]
            }).sort({ createrAt: -1 });
        });
    }
    getLastMessage(user1Id, user2Id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatModel.findOne({
                $or: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id }
                ]
            }).sort({ createdAt: -1 }).limit(1).exec();
        });
    }
    markMessagesAsRead(userId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.chatModel.updateMany({ senderId, receiverId: userId, isRead: false }, { $set: { isRead: true } }).exec();
        });
    }
    getUnreadMessageCount(receiverId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unReadMessages = yield this.chatModel.countDocuments({
                senderId: senderId,
                receiverId: receiverId,
                isRead: false
            });
            logger_1.default.info("Unread meaages count findede", unReadMessages);
            return unReadMessages;
        });
    }
};
exports.ChatReposiorty = ChatReposiorty;
exports.ChatReposiorty = ChatReposiorty = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.ChatModel)),
    __metadata("design:paramtypes", [Object])
], ChatReposiorty);
