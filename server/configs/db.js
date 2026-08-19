import mongoose from "mongoose";
//This file aim is to connect with the backend
const connectDB=async ()=>{
    try{
         mongoose.connection.on('connected',()=>{
            console.log("Database Connected");
         });
         //the above line shows that if it is connected it prints the message
        await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`)
    }
    catch(error){
          console.log(error.message);
    }
}
export default connectDB;