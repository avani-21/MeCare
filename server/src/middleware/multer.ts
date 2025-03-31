import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.config";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "profile",
    format: file.mimetype.split("/")[1],
    public_id: `${file.originalname.split(".")[0]}-${Date.now()}`, 
  }),
});

const upload = multer({ storage });

export default upload;


