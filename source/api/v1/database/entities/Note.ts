import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm"
import { DeepOptional } from "typing-assets/src"
import { UserEntity, User, UserWithoutSensetives } from "./User"

export namespace NoteEntity {

    @Entity()
    export class Note {
        @PrimaryColumn("text")
        public id: string
    
        @Column("varchar", {
            length: 16,
            nullable: false
        })
        public author: string
    
    
        @Column("varchar", {
            length: 100,
            nullable: false
        })
        public title: string
    
        @Column("varchar")
        public content: string
    
        @Column("varchar", {
            array: true
        })
        public tags: string[]
    
        @ManyToMany(() => UserEntity.User, null, {cascade: true})
        @JoinTable()
        public collaborators: UserEntity.User[]
    
        @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
        public createdAt: Date;
    
        @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
        public updatedAt: Date;
    }
}


export type Note = Omit<NoteEntity.Note, "collaborators"> & { collaborators: string[] }
export type NoteUpdate = DeepOptional<Pick<Note, "content" | "tags" | "title">>
export type NotePreview = Pick<Note, "id" | "updatedAt" | "tags" | "title">
export type NoteWithoutMetadata = Omit<Note, "createdAt" | "updatedAt" | "id"> 
export type NoteCollaborators = UserWithoutSensetives[]