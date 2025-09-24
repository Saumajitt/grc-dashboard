import ThirdParty from "../models/ThirdParty.js";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import path from "path";

const uploadsFolder = path.join(process.cwd(), "uploads"); // absolute path in project
if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsFolder),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

export const uploadCSV = multer({ storage }).single("file");

// Bulk upload from CSV
export const bulkUploadThirdParties = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }

        const filePath = req.file.path;
        const results = [];
        const errors = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                // normalize keys to lowercase
                const normalizedRow = {};
                for (const key in row) {
                    normalizedRow[key.toLowerCase()] = row[key];
                }


                if (!normalizedRow.name) {
                    errors.push({ row, error: "name is required" });
                } else if (normalizedRow.riskScore && isNaN(Number(normalizedRow.riskScore))) {
                    errors.push({ row, error: "riskScore must be a number" });
                } else {
                    results.push({
                        name: normalizedRow.name,
                        email: normalizedRow.email || "",
                        company: normalizedRow.company || "",
                        role: normalizedRow.role || "",
                        industry: normalizedRow.industry || "",
                        riskScore: Number(normalizedRow.riskscore) || 0,
                        createdBy: req.user._id,
                    });
                }
            })
            .on("end", async () => {
                try {
                    const saved = await ThirdParty.insertMany(results);

                    res.status(201).json({
                        message: "CSV processed",
                        successCount: saved.length,
                        failureCount: errors.length,
                        errors,
                    });
                } catch (err) {
                    console.error("DB insert error:", err.message);
                    res.status(500).json({ error: err.message });
                }
            });
    } catch (error) {
        console.error("Bulk upload error:", error.message);
        res.status(500).json({ error: error.message });
    }
};


//get all third parties

export const getThirdParties = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }


        if (req.user.role === "client") {
            return res.status(403).json({ error: "Forbidden: Clients cannot view third-party entries" });
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Sorting
        const sort = { createdAt: -1 };

        // Filter
        let filter = {};

        if (req.query.industry) filter.industry = req.query.industry;
        if (req.query.name) filter.name = { $regex: req.query.name, $options: "i" };

        const total = await ThirdParty.countDocuments(filter);
        const thirdParties = await ThirdParty.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate("createdBy", "email role");

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            total,
            count: thirdParties.length,
            thirdParties,
        });
    } catch (error) {
        console.error("Get third parties error:", error.message);
        res.status(500).json({ error: error.message });
    }
};


//update a third party
export const updateThirdParty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, industry, riskScore, email, company, role } = req.body;

        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const thirdParty = await ThirdParty.findById(id);
        if (!thirdParty) return res.status(404).json({ error: "Third party not found" });

        if (req.user.role === "client" && thirdParty.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Forbidden: Cannot edit this entry" });
        }

        if (name) thirdParty.name = name;
        if (industry) thirdParty.industry = industry;
        if (riskScore !== undefined) thirdParty.riskScore = riskScore;
        if (email) thirdParty.email = email;
        if (company) thirdParty.company = company;
        if (role) thirdParty.role = role;

        await thirdParty.save();

        res.json({ message: "Third party updated successfully", thirdParty });
    } catch (error) {
        console.error("Update third party error:", error.message);
        res.status(500).json({ error: error.message });
    }
};


//delete a third party

export const deleteThirdParty = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const thirdParty = await ThirdParty.findById(id);
        if (!thirdParty) return res.status(404).json({ error: "Third party not found" });

        if (req.user.role === "client" && thirdParty.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Forbidden: Cannot delete this entry" });
        }

        await ThirdParty.findByIdAndDelete(id);

        res.json({ message: "Third party deleted successfully", deletedId: id });
    } catch (error) {
        console.error("Delete third party error:", error.message);
        res.status(500).json({ error: error.message });
    }
};


//get a single third party by id
    
export const getThirdPartyById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const thirdParty = await ThirdParty.findById(id);
        if (!thirdParty) return res.status(404).json({ error: "Third party not found" });

        // Access control: Admin can access all, clients only their own
        if (req.user.role === "client" && thirdParty.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Forbidden: Cannot view this entry" });
        }

        res.json({ thirdParty });
    } catch (error) {
        console.error("Get third party error:", error.message);
        res.status(500).json({ error: error.message });
    }
};