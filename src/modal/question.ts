import mongoose, { Schema } from "mongoose";
import { Message,MessageSchema} from "./user";
 export interface Question {
    _id?:mongoose.Types.ObjectId,
    content:string,
    createdAt:Date,
    userId:mongoose.Types.ObjectId,
    isAcceptingMessage:boolean,
    messages:Message[]
}

const QuesSchema:Schema<Question>=new Schema({
   content:{
     type:String,
     required:true
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now,
    },  
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    isAcceptingMessage: {
        type: Boolean,
        default: true,
    },
    messages:[MessageSchema]
});


const QuesModel=(mongoose.models.Question as mongoose.Model<Question>) || (mongoose.model<Question>("Question",QuesSchema));
export default QuesModel;
