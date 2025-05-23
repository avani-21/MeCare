"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("./middleware/morgan"));
const logger_1 = __importDefault(require("./utils/logger"));
const socket_1 = __importDefault(require("./socket"));
const http_1 = require("http");
const redis_1 = __importDefault(require("./config/redis"));
console.log("Reflect.hasOwnMetadata exists:", typeof Reflect.hasOwnMetadata !== "undefined");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
(0, db_1.default)();
redis_1.default.connect();
app.use(express_1.default.json());
// app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000',
        "https://mecare-ecru.vercel.app/",
        "https://mecare.zapto.org"
    ],
    credentials: true,
}));
app.use(morgan_1.default);
socket_1.default.getInstance(server);
app.use("/api/patient", patientRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/doctor", doctorRoutes_1.default);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.default)();
    logger_1.default.info(`Server started on port ${PORT}`);
}));
