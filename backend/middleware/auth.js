import jwt from "jsonwebtoken";
import User from "../models/User.js"; 

// Middleware to protect routes
const authMiddleware = async (req, res, next) => {
    let token;

    try {
        // Expect header: Authorization: Bearer <token>
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user object (without password) to request
            req.user = await User.findById(decoded.id).select("-passwordHash");

            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }

            next();
        } else {
            return res.status(401).json({ message: "No token provided" });
        }
    } catch (err) {
        console.error("Auth error:", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default authMiddleware;
