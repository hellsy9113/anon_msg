import mongoose, { Schema, Document } from "mongoose";


export interface Reply {
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