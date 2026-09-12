import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";
import { getAuth } from "@clerk/express";

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { userId } = getAuth(req);

        const { roomType, pricePerNight, amenities } = req.body;

        // Find hotel belonging to logged-in owner
        const hotel = await Hotel.findOne({ owner: userId });

        if (!hotel) {
            return res.json({
                success: false,
                message: "No Hotel found"
            });
        }

        // Check if images were uploaded
        if (!req.files || req.files.length === 0) {
            return res.json({
                success: false,
                message: "No images uploaded"
            });
        }

        // Upload images to Cloudinary
        const uploadImages = req.files.map(async (file) => {
            console.log("Uploading file:", file.path);

            try {
                const response = await cloudinary.uploader.upload(file.path);

                console.log("Cloudinary upload successful");

                return response.secure_url;

            } catch (error) {
                console.log("CLOUDINARY ERROR:", {
                    message: error.message,
                    http_code: error.http_code,
                    name: error.name
                });

                throw error;
            }
        });

        const images = await Promise.all(uploadImages);

        // Convert amenities JSON string to array
        const amenitiesArray = JSON.parse(amenities);

        // Create room
        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: amenitiesArray,
            images
        });

        res.json({
            success: true,
            message: "Room Created Successfully"
        });

    } catch (error) {
        console.log("FULL ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// API to get all rooms
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({
            isAvailable: true
        })
            .populate({
                path: "hotel",
                populate: {
                    path: "owner",
                    select: "image"
                }
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            rooms
        });

    } catch (error) {
        console.log("GET ROOMS ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// API to get all rooms for a specific hotel
export const getOwnerRooms = async (req, res) => {
    try {
        const { userId } = getAuth(req);

        const hotelData = await Hotel.findOne({
            owner: userId
        });

        if (!hotelData) {
            return res.json({
                success: false,
                message: "No Hotel found"
            });
        }

        const rooms = await Room.find({
            hotel: hotelData._id.toString()
        }).populate("hotel");

        res.json({
            success: true,
            rooms
        });

    } catch (error) {
        console.log("GET OWNER ROOMS ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// API to toggle availability of a room
export const toggleRoomAvailability = async (req, res) => {
   console.log("TOGGLE API IS CALLED");
    try {
        const { roomId } = req.body;
         console.log("Room Id:",roomId);
        const roomData = await Room.findById(roomId);

        if (!roomData) {
            return res.json({
                success: false,
                message: "Room not found"
            });
        }

        roomData.isAvailable = !roomData.isAvailable;

        await roomData.save();

        res.json({
            success: true,
            message: "Room availability Updated"
        });

    } catch (error) {
        console.log("TOGGLE ROOM ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};