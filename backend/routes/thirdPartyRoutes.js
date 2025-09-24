import express from "express";
import authMiddleware from "../middleware/auth.js";
import { uploadCSV, bulkUploadThirdParties } from "../controllers/thirdPartyController.js";
import { getThirdParties, updateThirdParty, deleteThirdParty, getThirdPartyById} from "../controllers/thirdPartyController.js";

const router = express.Router();

// Bulk upload (Admin only)
router.post("/upload", authMiddleware, uploadCSV, bulkUploadThirdParties);

// Get all third parties (Admin)
router.get("/", authMiddleware, getThirdParties);

// Get a single third party by ID
router.get("/:id", authMiddleware, getThirdPartyById);

// Update a single third party by ID (Admin or creator)
router.put("/:id", authMiddleware, updateThirdParty);

// Delete a single third party by ID (Admin or creator)
router.delete("/:id", authMiddleware, deleteThirdParty);



export default router;
