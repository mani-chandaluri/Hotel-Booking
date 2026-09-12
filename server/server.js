import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

connectDB();
connectCloudinary();

const app = express();

app.use(cors());

app.use(clerkMiddleware());
   
// Clerk webhook
// IMPORTANT: raw body must come before express.json()
app.use(
    "/api/clerk",
    express.raw({
        type: "application/json"
    }),
    clerkWebhooks
);

// Normal JSON requests
app.use(express.json());
app.use('/api/user',userRouter)
app.use('/api/hotels',hotelRouter)
app.use('/api/rooms',roomRouter)
app.use('/api/bookings',bookingRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});