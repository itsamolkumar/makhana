import mongoose from "mongoose";

const slideSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  src: {
    type: String,
    required: true,
  },
});

const customizationSchema = new mongoose.Schema(
  {
    heroSlides: [slideSchema],
    rootImage: { type: String, default: "" },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Prevent Mongoose from caching the old schema in Next.js development mode
if (mongoose.models.Customization) {
  delete mongoose.models.Customization;
}

const Customization = mongoose.model("Customization", customizationSchema);

export default Customization;
