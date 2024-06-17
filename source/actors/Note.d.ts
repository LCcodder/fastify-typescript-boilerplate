import { ObjectId } from "mongoose"

export declare type Note = {
    author: string
    collaborators: string[]
    title: string
    content: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
    _id: ObjectId
}

export declare type NoteUpdate = Pick<Note, "content" | "tags" | "title">
export declare type NotePreview = Pick<Note, "_id" | "collaborators" | "updatedAt" | "tags" | "title">
export declare type NoteWithoutMetadata = Omit<Note, "createdAt" | "updatedAt" | "_id">