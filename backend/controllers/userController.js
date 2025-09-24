import User from "../models/User.js";
import Evidence from "../models/Evidence.js";
import ThirdParty from "../models/ThirdParty.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({ email, passwordHash, role });

        res.status(201).json({ message: "User registered", id: user._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get profile data with role-aware uploaded content
export const getUserProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const user = req.user; // Already populated by authMiddleware

        let evidence = [];
        let thirdParties = [];
        let users = [];

        if (user.role === "client") {
            // Client sees only their uploaded evidence
            evidence = await Evidence.find({ uploadedBy: user._id }).sort({ createdAt: -1 });
        } else if (user.role === "admin") {
            // Admin sees all evidence
            evidence = await Evidence.find().sort({ createdAt: -1 }).populate("uploadedBy", "email role");
            
            // Admin sees all third parties
            thirdParties = await ThirdParty.find().sort({ createdAt: -1 }).populate("createdBy", "email role");


            // Admin can also see all clients (excluding other admins)
            users = await User.find({ role: "client" }).sort({ createdAt: -1 });
        }

        // Stats
        const evidenceCount = evidence.length;
        const thirdPartyCount = thirdParties.length;
        const clientCount = users.length;

        res.json({
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            stats: {
                evidenceCount,
                thirdPartyCount,
                clientCount,
            },
            evidence,
            thirdParties,
            users,
        });
    } catch (error) {
        console.error("Get profile error:", error.message);
        res.status(500).json({ error: error.message });
    }
};



// Logout user (optional: frontend deletes token)
export const logoutUser = async (req, res) => {
    try {
        // In JWT stateless setup, no DB changes needed
        // Frontend should delete the token from storage (localStorage/cookies)
        res.json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error.message);
        res.status(500).json({ error: error.message });
    }
};




// ------------------ Admin: List all clients ------------------
export const getAllClients = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        const clients = await User.find({ role: "client" }).sort({ createdAt: -1 });
        res.json({ clients });
    } catch (error) {
        console.error("Get all clients error:", error.message);
        res.status(500).json({ error: error.message });
    }
};


// ------------------ Admin: Update client ------------------
export const updateClient = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        const { id } = req.params;
        const { email, role } = req.body;

        const client = await User.findById(id);
        if (!client || client.role !== "client") {
            return res.status(404).json({ message: "Client not found" });
        }

        if (email) client.email = email;
        if (role) client.role = role;

        await client.save();
        res.json({ message: "Client updated successfully", client });
    } catch (error) {
        console.error("Update client error:", error.message);
        res.status(500).json({ error: error.message });
    }
};


// ------------------ Admin: Delete client and their evidence ------------------
export const deleteClient = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        const { id } = req.params;
        const client = await User.findById(id);

        if (!client || client.role !== "client") {
            return res.status(404).json({ message: "Client not found" });
        }

        // Delete all evidence uploaded by this client : optional
        // await Evidence.deleteMany({ uploadedBy: client._id });

        // Delete client
        await client.deleteOne();

        res.json({ message: "Client removed successfully", deletedId: id });
    } catch (error) {
        console.error("Delete client error:", error.message);
        res.status(500).json({ error: error.message });
    }
};