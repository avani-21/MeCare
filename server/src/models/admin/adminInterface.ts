import mongoose, { Document } from "mongoose";

export interface IAdmin extends Document{
    email:string;
    password:string;
}