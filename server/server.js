import express from "express"
import "dotenv/config"
import cors from "cors"
import connectDB from "./configs/db.js"
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js"
connectDB()
const app=express()
app.use(cors())//Enable Cross-orgin resource sharing
app.use(clerkMiddleware())//Middleware
//API to listen to clerk webhooks
app.use("/api/clerk",clerkWebhooks)
app
app.use(express.json())
app.get('/',(req,res)=>{
    res.send("Api is working")
})
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`Server runnig on port ${PORT}`)
})