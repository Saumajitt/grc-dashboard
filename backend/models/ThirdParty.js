import mongoose from "mongoose";

const ThirdPartySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        industry: { type: String },
        riskScore: { type: Number, default: 0 },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const ThirdParty = mongoose.model("ThirdParty", ThirdPartySchema);

export default ThirdParty;
