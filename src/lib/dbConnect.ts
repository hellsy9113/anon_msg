//it check the value and data type of the object
//that is getting passed in the database connection

import mongoose from "mongoose"

type ConnectionObject={
    //?-optinal
    isConnected?:number
}
const connection:ConnectionObject={}
async function dbConnect():Promise<void>{
    if(connection.isConnected)
    {
        console.log("already connected to database")
        return 
    }
    try{
       const db=await mongoose.connect(process.env.MONGODB_URI|| '',{});
       connection.isConnected=db.connections[0].readyState
       console.log(db)
       console.log(db.connections[0])
     //readysate is a number in itself
     console.log("db connected suceesfully")
    }
    catch(error){
        console.log("db connection failed")
      process.exit(1);
    } 
}

export default dbConnect;
//here void mean .do not care what is the data type of promise 

// type ConnectionObject={
    //?-optinal
    // isConnected?:number
// }  what is this .explain line by line?
// type ConnectionObject={  //we are defining a type called connection object
    //?-optinal
    // isConnected?:number  //we are defining a property called isConnected which is of type number and it is optional
// }  //end of the type definition

// async function dbConnect():Promise<void>{  //we are defining an asynchronous function called dbConnect which returns a promise of type void
    // if(connection.isConnected)  //if the connection is already established
    // {
        // console.log("already connected to database")  //log that we are already connected to the database
        // return   //return from the function
    // }
    // try{  //try to connect to the database

    //    connection.isConnected=db.connections[0].readyState.what will be its output?
    //    console.log(db)  //log the database connection object
    //    console.log(db.connections[0])  //log the first connection object in the connections array
     //readysate is a number in itself
     //readyState is a property of the connection object which indicates the state of the connection. it can have the following values:
     //0: disconnected
     //1: connected
     //2: connecting
     //3: disconnecting
     //4: unauthorized
     //5: uninitialized

     //so, when we assign connection.isConnected=db.connections[0].readyState, we are assigning the readyState value to the isConnected property of the connection object. this way, we can keep track of the state of the database connection.
    //    console.log("db connected suceesfully")  //log that we have connected to the database successfully
    // }
    // catch(error){  //if there