import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm"
import { DeepOptional } from "typing-assets"
import { Note } from "./_Note"

export namespace UserEntity {

    @Entity()
    export class User {
        @PrimaryColumn("varchar")
        public login: string
    
        @Column("varchar", {
            length: 60,
            nullable: false
        })
        public email: string
    
        @Column("text")
        public password: string
    
        @Column("varchar", {
            length: 32
        })
        public username: string
    
        @Column("varchar", {
            length: 7,
            nullable: false
        })
        public personalColor: string
    
        @Column("boolean", {
            nullable: false
        })
        public isCollaborating: boolean
    
        @Column("text", {
            nullable: true
        })
        public validToken: string
    
        
    
        @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
        public createdAt: Date;
    
        @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
        public updatedAt: Date;
    }
}

export type User = UserEntity.User
export type UserUpdate = DeepOptional<
    Omit<User, "updatedAt" | "createdAt" | "email" | "login">
>
export type UserCredentials = Pick<User, "email" | "password">
export type UserWithoutSensetives = Omit<User, "validToken" | "password">
export type UserWithoutMetadata = Omit<User, "updatedAt" | "createdAt" | "validToken">