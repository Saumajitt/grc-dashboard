// backend/scripts/backfillEvidenceSize.js
import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import Evidence from "../models/Evidence.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/grc-dashboard";

async function main() {
    console.log("Connecting to", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    // find docs without size
    const missing = await Evidence.find({ $or: [{ size: { $exists: false } }, { size: null }] });
    console.log(`Found ${missing.length} docs without size`);

    let updated = 0;
    for (const ev of missing) {
        if (ev.path && fs.existsSync(ev.path)) {
            const stats = fs.statSync(ev.path);
            ev.size = stats.size;
            await ev.save();
            console.log(`Updated ${ev.filename}: ${stats.size} bytes`);
            updated++;
        } else {
            console.warn(`File not found for ${ev._id}: ${ev.path}`);
        }
    }

    console.log(`✅ Backfill complete. Updated ${updated} docs.`);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
