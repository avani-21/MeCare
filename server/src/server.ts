import "reflect-metadata"
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDb from "./config/db"
import patientRoutes from "./routes/patientRoutes"
import adminRoutes from "./routes/adminRoutes"
import doctorRoutes from "./routes/doctorRoutes"
import cookieParser  from "cookie-parser"
import morganMiddleware from "./middleware/morgen"
import logger from "./utils/logger"

console.log("Reflect.hasOwnMetadata exists:", typeof Reflect.hasOwnMetadata !== "undefined");

dotenv.config();
const app=express()

connectDb();

app.use(express.json())
// app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});


app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));



app.use(morganMiddleware)

app.use("/api/patient",patientRoutes)
app.use("/api/admin",adminRoutes)
app.use("/api/doctor",doctorRoutes)


const PORT=process.env.PORT || 5000

app.listen(PORT,()=>{
  logger.info(`Server started on port ${PORT}`);
})