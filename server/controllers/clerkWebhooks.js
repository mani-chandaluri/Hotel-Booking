import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        // Create Svix webhook instance
        const whook = new Webhook(
            process.env.CLERK_WEBHOOK_SECRET
        );

        // Get headers
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };

        // Verify webhook using RAW body
        const evt = whook.verify(req.body, headers);

        // Get data and event type
        const { data, type } = evt;

        // Prepare user data
        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url
        };

        // Handle different Clerk events
        switch (type) {

            case "user.created":
                await User.create(userData);
                console.log("User created:", data.id);
                break;

            case "user.updated":
                await User.findByIdAndUpdate(
                    data.id,
                    userData
                );
                console.log("User updated:", data.id);
                break;

            case "user.deleted":
                await User.findByIdAndDelete(data.id);
                console.log("User deleted:", data.id);
                break;

            default:
                console.log("Unhandled event:", type);
                break;
        }

        res.status(200).json({
            success: true,
            message: "Webhook received"
        });

    } catch (error) {

        console.log("WEBHOOK ERROR:", error.message);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export default clerkWebhooks;