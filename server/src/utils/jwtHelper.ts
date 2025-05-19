import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateAccessToken = (id: string, email: string, role: string) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
  
  console.log("Generating token with payload:", { id, email, role });
  const token = jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: "15d" });
  
  return token;
};


export const generateRefreshToken = (id: string, email: string, role: string) => {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET missing");
  return jwt.sign({ id, email, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "17d" });
};

