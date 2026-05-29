import mongoose ,{Schema,Document} from "mongoose";  
//document used for type safety;
//using interface to define the types of the content
//ex-string,data,
import { Reply,ReplySchema} from "./reply";
export interface Message {
     _id?: mongoose.Types.ObjectId;
    content:string;
    createdAt:Date;
    replies:Reply[];
    replyAccessToken: string;
}

//note-string in ts is small  but in mongoose it is capital
const MessageSchema:Schema<Message>=new Schema({
content:{
    type:String,
    required:true   
},
createdAt:{
    type:Date,
    required:true,
    default: Date.now
},
 replies:[ReplySchema],
  
replyAccessToken:{
   type:String,
   required:true,
}
})

export interface User extends Document{
  username:string;
  email:string;
  password:string;
  verifyCode:string;
  isVerified:boolean;
  verifyCodeExpiry:Date;
  isAcceptingMessage:boolean;
  messages:Message[]

}

const UserSchema:Schema<User>=new Schema({
  username:{
    type:String,
    required:[true,"user name is required"],
    trim:true,
    unique:true
  },
    email:{
    type:String,
    required:[true,"Email is required"],
    trim:true,
    unique:true,
    match:[/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
        'please use a valid email address']
  },
    password:{
    type:String,
    required:[true,"password is required"],
  },
  verifyCode:{
    type:String,
    required:[true,"verify code is required"]
     
  },
    verifyCodeExpiry:{
    type:Date,
    required:[true,"Expiry is code is required"],
     
  },
  isVerified:{
    type:Boolean,
    default:false,
  },
  isAcceptingMessage:{
    type:Boolean,
    default:true
  },
  messages:[MessageSchema],

})
//next.js does not by default know whether a model exist in the db or not.
//it get confused whether it is first time or  not.
//therefore,we must explicity  define parameters to to avail this functinality
const UserModel=(mongoose.models.User as mongoose.Model<User>) || (mongoose.model<User>("User",UserSchema));

export default UserModel;

//why do we use schema and model in mongoose?
//schema is used to define the structure of the document and model is used to create and read the document from the database.
//why nextjs does not know whether a model exist in the db or not?
//because next.js is a serverless framework and it does not maintain a persistent connection to the database. therefore, it does not know whether a model exist in the db or not. 
//elaborate on the above point
//in a traditional server-based application, the server maintains a persistent connection to the database. therefore, it can check whether a model exist in the db or not. however, in a serverless application,
//  the server does not maintain a persistent connection to the database. therefore, it cannot check whether a model exist in the db or not. this is why we need to explicitly define parameters to avail this functionality in next.js.

//basic structureof the interafce is 
//interface schema_name externds Document{
//field neme:field type
//}

// basic structure of the schema is 
//cosnt schema_name:Schema<interface_namew>-new Schemma({
//field name:{
//type:field type,
//required:true/false,
//default:value
//}
//})

  //why do it uses the ({}) syntax in the schema definition?
  //the ({}) syntax is used to define the schema in mongoose. it is a shorthand syntax for defining the schema. it is equivalent to writing
  //  new Schema({field name:{type:field type,required:true/false,default:value}}). it is used to make the code more concise and readable.

  //what does package Document do in mongoose?
  //the Document package in mongoose is used to define the types of the content in the schema. it is used to provide type safety
  //  when working with the schema. it allows us to define the types of the fields in the schema and ensures that we are using the correct types when working with the schema.

  //then what does package scehma do?
  //the Schema package in mongoose is used to define the structure of the document in the database. it is used to define the fields 
  // and their types in the document. it also allows us to define validation rules for the fields in the document. it is used to create 
  // a model from the schema which can be used to create and read documents from the database.