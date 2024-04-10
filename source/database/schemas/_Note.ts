import { Schema } from "mongoose"

export const noteSchema = new Schema({
    authorEmail: String,
    // also emails
    collaborators: Array<String>,
    title: String,
    content: String,
    tags: String
}, { timestamps: true, versionKey: false })
