import mongoose from "mongoose";

const EvidenceSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        category: {
            type: String,
            enum: ["policy", "diagram", "doc", "other"],
            default: "other",
        },
        filename: { type: String, required: true },
        path: { type: String, required: true },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Evidence = mongoose.model("Evidence", EvidenceSchema);

export default Evidence;
