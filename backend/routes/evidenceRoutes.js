import express from "express";
import { upload, uploadEvidence, getEvidences } from "../controllers/evidenceController.js";
import { updateEvidence, deleteEvidence } from "../controllers/evidenceController.js";
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post("/upload", authMiddleware, upload, uploadEvidence);
router.get("/", authMiddleware, getEvidences);
router.put("/:id", authMiddleware, updateEvidence);
router.delete("/:id", authMiddleware, deleteEvidence);

export default router;
