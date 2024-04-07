import { Schema } from "mongoose"

export const noteSchema = new Schema({
    authorUsername: String,
    collaborators: Array<String>,
    title: String,
    content: String,
    tags: String
}, { timestamps: true })
