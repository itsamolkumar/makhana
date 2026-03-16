import axios from "axios";

export const uploadProductImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.url;

  } catch (error) {
    console.log("Image upload error:", error);
    throw error;
  }
};