import { DeepOptional } from 'typing-assets'
import { Note as NoteEntity } from '../../database/entities/Note'
import { UserWithoutSensetives } from './UserDto'

export type Note = Omit<NoteEntity, "collaborators"> & { collaborators: string[] }
export type NoteUpdate = DeepOptional<Pick<Note, "content" | "tags" | "title">>
export type NotePreview = Pick<Note, "id" | "updatedAt" | "tags" | "title">
export type NoteWithoutMetadata = Omit<Note, "createdAt" | "updatedAt" | "id"> 
export type NoteCollaborators = UserWithoutSensetives[]