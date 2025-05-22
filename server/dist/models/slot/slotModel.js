"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const slotSchema_1 = __importDefault(require("./slotSchema"));
const SlotModel = mongoose_1.default.model("Slot", slotSchema_1.default);
exports.default = SlotModel;
