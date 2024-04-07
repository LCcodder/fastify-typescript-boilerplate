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
    __v: number
}

export declare type NoteWithoutMetadata = Omit<Note, "createdAt" | "updatedAt" | "_id" | "__v">