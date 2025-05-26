import "reflect-metadata"
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDb from "./config/db"
import patientRoutes from "./routes/patientRoutes"
import adminRoutes from "./routes/adminRoutes"
import doctorRoutes from "./routes/doctorRoutes"
import cookieParser  from "cookie-parser"
import morganMiddleware from "./middleware/morgan"
import logger from "./utils/logger"
import SocketService from "./socket"
import { createServer } from "http"
import redisClient from "./config/redis"


dotenv.config();
const app=express()
const server=createServer(app)

connectDb();
redisClient.connect()





app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://mecare-ecru.vercel.app',
    'https://mecare.zapto.org'
  ],
  credentials: true,
  exposedHeaders: ['set-cookie'],
 allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));




app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  next();
});


app.use(express.json())
app.use(cookieParser());
app.use(morganMiddleware)

SocketService.getInstance(server)

app.use("/api/patient",patientRoutes)
app.use("/api/admin",adminRoutes)
app.use("/api/doctor",doctorRoutes)


const PORT=process.env.PORT || 5000


server.listen(PORT, async () => {
  await connectDb();
  logger.info(`Server started on port ${PORT}`);
});