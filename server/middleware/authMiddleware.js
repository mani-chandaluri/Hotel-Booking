import User from "../models/User.js";
import { getAuth, clerkClient } from "@clerk/express";

export const protect = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "not authenticated"
            });
        }

        let user = await User.findById(userId);

        // Fallback: user not synced yet (webhook missed/delayed) — fetch from Clerk and create
        if (!user) {
            const clerkUser = await clerkClient.users.getUser(userId);

            user = await User.create({
                _id: clerkUser.id,
                email: clerkUser.emailAddresses[0]?.emailAddress || "",
                username: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
                image: clerkUser.imageUrl
            });

            console.log("User auto-synced from Clerk:", user._id);
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("AUTH ERROR:", error.message);
        res.status(401).json({
            success: false,
            message: "authentication failed"
        });
    }
};