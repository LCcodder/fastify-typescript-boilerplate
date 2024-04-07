import { ObjectId } from "mongoose"

export declare type Note = {
    authorUsername: string
    collaborators: string[]
    title: string
    content: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
    _id: ObjectId
}

export declare type NoteWithoutMetadata = Omit<Note, "createdAt" | "updatedAt" | "_id">