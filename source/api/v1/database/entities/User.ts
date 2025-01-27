import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";

@Entity()
export class User {
    @PrimaryColumn("varchar")
    public login: string;

    @Column("varchar", {
        length: 60,
        nullable: false
    })
    public email: string;

    @Column("text")
    public password: string;

    @Column("varchar", {
        length: 32
    })
    public username: string;

    @Column("varchar", {
        length: 7,
        nullable: false
    })
    public personalColor: string;

    @Column("boolean", {
        nullable: false
    })
    public isCollaborating: boolean;

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
