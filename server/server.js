import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB();

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

app.get("/", (req, res) => {
    res.send("Api is working");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});