import express from "express";
import {
    registerUser,
    loginUser, 
    logoutUser, 
    getUserProfile, 
    getAllClients, 
    updateClient, 
    deleteClient
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);



// Profile route
router.get("/profile", authMiddleware, getUserProfile);

// Admin routes
router.get("/", authMiddleware, getAllClients);
router.put("/:id", authMiddleware, updateClient); 
router.delete("/:id", authMiddleware, deleteClient); 


export default router;
