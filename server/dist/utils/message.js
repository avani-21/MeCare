"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusMessages = void 0;
var StatusMessages;
(function (StatusMessages) {
    StatusMessages["OK"] = "Request processed successfully";
    StatusMessages["CREATED"] = "Resource created successfully";
    StatusMessages["BAD_REQUEST"] = "Bad request";
    StatusMessages["UNAUTHORIZED"] = "Unauthorized access";
    StatusMessages["FORBIDDEN"] = "Forbidden access";
    StatusMessages["NOT_FOUND"] = "Resource not found";
    StatusMessages["INTERNAL_SERVER_ERROR"] = "Something went wrong on the server";
    StatusMessages["ID_NOT_FOUNT"] = "id not found";
    StatusMessages["EMAIL_REQUIRED"] = "Email not found";
    StatusMessages["OTP_SENT"] = "OTP sent to email for Google login.";
    StatusMessages["REGISTRATION_SUCCESS"] = "Patient registration successfully";
})(StatusMessages || (exports.StatusMessages = StatusMessages = {}));
