import mongoose, { Schema, Document } from "mongoose";


export interface Reply extends Document{
    content:string,
    createdAt:Date;
}

export const ReplySchema: Schema<Reply>=new Schema({
     content:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
});