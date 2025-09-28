import Evidence from "../models/Evidence.js";
import multer from "multer";
import path from "path";

import fs from "fs";

// Ensure uploads folder exists
const uploadsFolder = path.join(process.cwd(), "/uploads");
if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder, { recursive: true });
}

// Multer setup - local storage (for MVP)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsFolder); // absolute path
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});



export const upload = multer({ storage }).array("files", 10); // max 10 files

// Upload evidence
export const uploadEvidence = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { title, category } = req.body;
        // const uploadedBy = req.user?._id || null; // hook this into auth later

        const evidenceDocs = req.files.map((file) => ({
            title,
            category,
            filename: file.filename,
            path: file.path,
            size: file.size,
            uploadedBy: req.user._id,
        }));

        const savedEvidence = await Evidence.insertMany(evidenceDocs);

        // ✅ Add fileUrl before sending back
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const response = savedEvidence.map(ev => ({
            ...ev.toObject(),
            fileUrl: `${baseUrl}/uploads/${ev.filename}`,
        }));


        res.status(201).json({
            message: "Evidence uploaded successfully",
            count: response.length,
            files: response,
        });
    } catch (error) {
        console.error("Upload evidence error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// get evidences with pagination, filtering, sorting
export const getEvidences = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // // Filter
        // let filter = {};
        // if (req.user.role !== "admin") {
        //     // Normal users see only their evidence
        //     filter.uploadedBy = req.user._id;
        // }

        // Restrict this endpoint to normal users only
        if (req.user.role === "admin") {
            return res.status(403).json({
                error: "Admins should use the /admin/dashboard endpoint"
            });
        }


        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Sorting: newest first
        const sort = { createdAt: -1 };


        // Filter: only this user's evidence
        const filter = { uploadedBy: req.user._id };


        // Optional filters (e.g., category)
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Count total for pagination
        const total = await Evidence.countDocuments(filter);

        // Fetch documents
        const evidences = await Evidence.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate("uploadedBy", "email role"); // optional: populate uploader info

        // ✅ Add fileUrl
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const response = evidences.map(ev => ({
            ...ev.toObject(),
            fileUrl: `${baseUrl}/uploads/${ev.filename}`,
        }));

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            total,
            count: response.length,
            evidences: response,
        });
    } catch (error) {
        console.error("Get evidences error:", error.message);
        res.status(500).json({ error: error.message });
    }
};



// Update evidence metadata (title or category)
export const updateEvidence = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category } = req.body;

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Find evidence
        const evidence = await Evidence.findById(id);
        if (!evidence) {
            return res.status(404).json({ error: "Evidence not found" });
        }

        // Access control: Admin can edit anything, user can edit only their uploads
        if (req.user.role !== "admin" && evidence.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Forbidden: Not allowed to edit this evidence" });
        }

        // Update fields if provided
        if (title) evidence.title = title;
        if (category) evidence.category = category;

        await evidence.save();

        res.json({ message: "Evidence updated successfully", evidence });
    } catch (error) {
        console.error("Update evidence error:", error.message);
        res.status(500).json({ error: error.message });
    }
};


// Delete evidence
export const deleteEvidence = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Find evidence
        const evidence = await Evidence.findById(id);
        if (!evidence) {
            return res.status(404).json({ error: "Evidence not found" });
        }

        // Access control: Admin can delete anything, user can delete only their uploads
        if (req.user.role !== "admin" && evidence.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Forbidden: Not allowed to delete this evidence" });
        }

        // Delete the file from the filesystem
        if (fs.existsSync(evidence.path)) {
            fs.unlinkSync(evidence.path);
        }

        // Remove from database
        await Evidence.findByIdAndDelete(id);

        res.json({ message: "Evidence deleted successfully", deletedId: id });
    } catch (error) {
        console.error("Delete evidence error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

