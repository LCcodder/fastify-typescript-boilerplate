import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

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
        array: true
    })
    public collaborators: string[]

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


    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public createdAt: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updatedAt: Date;
}


export type NoteUpdate = Pick<Note, "content" | "tags" | "title">
export type NotePreview = Pick<Note, "id" | "collaborators" | "updatedAt" | "tags" | "title">
export type NoteWithoutMetadata = Omit<Note, "createdAt" | "updatedAt">