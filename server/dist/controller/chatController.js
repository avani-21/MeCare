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
exports.ChatController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../di/types"));
const httptatus_1 = require("../utils/httptatus");
const types_2 = require("../types/types");
const message_1 = require("../utils/message");
const logger_1 = __importDefault(require("../utils/logger"));
let ChatController = class ChatController {
    constructor(_chatService) {
        this._chatService = _chatService;
    }
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let messageData = Object.assign({ senderId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }, req.body);
                const newMessage = yield this._chatService.sendMessage(messageData);
                if (newMessage) {
                    logger_1.default.info("New mwssage created successfully");
                    return res.status(httptatus_1.HttpStatus.CREATED).json((0, types_2.successResponse)(message_1.StatusMessages.CREATED, newMessage));
                }
            }
            catch (error) {
                logger_1.default.error("Error ocuured while creating new message", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
    getConversation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { user1Id } = req.params;
                const user2Id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!user2Id) {
                    logger_1.default.warn("Id not fount in the jwt  decode");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                logger_1.default.info("Users id", user1Id, user2Id);
                const message = yield this._chatService.getConversation(user1Id, user2Id);
                if (message) {
                    logger_1.default.info("Converstion getted successfully");
                    return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, message));
                }
            }
            catch (error) {
                logger_1.default.error("Error occurede while getting the conversion", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR, error));
            }
        });
    }
    getUnreadMessageCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const senderId = req.params.id;
                const receiverId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!senderId) {
                    logger_1.default.warn("Sender id not found");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                if (!receiverId) {
                    logger_1.default.warn("Receiver id not found");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                const response = yield this._chatService.getUnreadMessageCount(receiverId, senderId);
                logger_1.default.info("Unread message count fetched successfully");
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, response));
            }
            catch (error) {
                logger_1.default.error("Error occurred in fetching the unread message count", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
    markMessageAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const receiverId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const senderId = req.params.id;
                if (!receiverId || !senderId) {
                    logger_1.default.warn("Receiver or sender id not found");
                    return res.status(httptatus_1.HttpStatus.BAD_REQUEST).json((0, types_2.errorResponse)(message_1.StatusMessages.ID_NOT_FOUNT));
                }
                yield this._chatService.markMessagesAsRead(receiverId, senderId);
                const unreadCount = yield this._chatService.getUnreadMessageCount(receiverId, senderId);
                logger_1.default.info("Messages marked as read successfully");
                return res.status(httptatus_1.HttpStatus.OK).json((0, types_2.successResponse)(message_1.StatusMessages.OK, { unreadCount }));
            }
            catch (error) {
                logger_1.default.error("Error occurred while marking messages as read", error);
                return res.status(httptatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, types_2.errorResponse)(message_1.StatusMessages.INTERNAL_SERVER_ERROR));
            }
        });
    }
};
exports.ChatController = ChatController;
exports.ChatController = ChatController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.ChatService)),
    __metadata("design:paramtypes", [Object])
], ChatController);
