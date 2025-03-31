// morganMiddleware.ts
import logger from "../utils/logger";
import morgan, { StreamOptions } from "morgan";

const stream: StreamOptions = {
    write: (message) => logger.http(message.trim())
};

const skip = () => process.env.NODE_ENV === 'test'; // Skip during tests

const morganMiddleware = morgan(
    ':method :url :status :response-time ms - :res[content-length]',
    { stream, skip }
);

export default morganMiddleware;