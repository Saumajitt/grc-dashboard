import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from "./routes/userRoutes.js";
import evidenceRoutes from "./routes/evidenceRoutes.js";
import thirdPartyRoutes from "./routes/thirdPartyRoutes.js";
import authMiddleware from './middleware/auth.js';

dotenv.config();
const app = express();

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

const port = process.env.PORT || 4000;
app.listen(port, ()=>{
    console.log(`grc test app listening on port ${port}`);
    
});