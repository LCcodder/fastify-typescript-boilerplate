import { ObjectId } from "mongoose"

export declare type Collaborator = {
    login: string,
    role: 'write' | 'read'
}

export declare type Note = {
    author: string
    collaborators: Collaborator[]
    title: string
    content: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
    _id: ObjectId
}

// export declare type NotePreview = Omit<Note, 
// | "_id" 
// | "createdAt" 
// | "updatedAt" 
// | "collaborato">
export declare type NoteWithoutMetadata = Omit<Note, "createdAt" | "updatedAt" | "_id">