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
exports.ChatService = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
let ChatService = class ChatService {
    constructor(_chatRepository) {
        this._chatRepository = _chatRepository;
    }
    sendMessage(messageData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._chatRepository.createMessage(messageData);
        });
    }
    getConversation(user1Id, user2Id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._chatRepository.getMessagesBetweenUsers(user1Id, user2Id);
        });
    }
    getUnreadMessageCount(receiverId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._chatRepository.getUnreadMessageCount(receiverId, senderId);
        });
    }
    markMessagesAsRead(userId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._chatRepository.markMessagesAsRead(userId, senderId);
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.ChatRepository)),
    __metadata("design:paramtypes", [Object])
], ChatService);
