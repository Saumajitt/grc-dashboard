import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from "./routes/userRoutes.js";
import evidenceRoutes from "./routes/evidenceRoutes.js";
import thirdPartyRoutes from "./routes/thirdPartyRoutes.js";
import authMiddleware from './middleware/auth.js';
import cors from 'cors';
import path from 'path';



dotenv.config();
const app = express();

// Enable CORS for frontend (localhost:3000)
app.use(
    cors({
        origin: "http://localhost:3000", // your Next.js frontend
        credentials: true,               // allow cookies if needed
    })
);

//Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB connect
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/thirdparties", thirdPartyRoutes);

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});


const port = process.env.PORT || 4000;
app.listen(port, ()=>{
    console.log(`grc test app listening on port ${port}`);
    
});