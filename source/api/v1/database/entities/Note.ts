import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable
} from "typeorm";
import {User as UserEntity} from "./User";

@Entity()
export class Note {
    @PrimaryColumn("text")
    public id: string;

    @Column("varchar", {
        length: 16,
        nullable: false
    })
    public author: string;

    @Column("varchar", {
        length: 100,
        nullable: false
    })
    public title: string;

    @Column("varchar")
    public content: string;

    @Column("varchar", {
        array: true
    })
    public tags: string[];

    @ManyToMany(() => UserEntity, null, {cascade: true})
    @JoinTable()
    public collaborators: UserEntity[];

    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    public createdAt: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        onUpdate: "CURRENT_TIMESTAMP(6)"
    })
    public updatedAt: Date;
}
