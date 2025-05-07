import mongoose from "mongoose";
import { IReview } from "./reviewInterface";
import ReviewSchema from "./reviewSchema";

const ReviewModel=mongoose.model<IReview>('Review',ReviewSchema)
export default ReviewModel