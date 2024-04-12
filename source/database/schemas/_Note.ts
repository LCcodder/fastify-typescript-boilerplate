import { Schema } from "mongoose"

export const noteSchema = new Schema({
    // will be login
    author: String,
    // also login
    collaborators: [
        {
            login: String,
            // write or read
            role: String
        }
    ],
    title: String,
    content: String,
    tags: String
}, { timestamps: true, versionKey: false })
