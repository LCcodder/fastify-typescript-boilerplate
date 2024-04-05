export declare type Note = {
    authorId: string
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
}

export declare type NoteWithoutTimestamps = Omit<Note, "createdAt" | "updatedAt">