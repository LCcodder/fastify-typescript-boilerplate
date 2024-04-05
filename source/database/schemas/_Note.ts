import { Schema } from "mongoose";

export const noteSchema = new Schema({
    // stands for default mongo _id
    authorId: String,
    title: String,
    content: String,
}, { timestamps: true });
