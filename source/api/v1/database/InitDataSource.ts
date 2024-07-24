import { DataSource } from "typeorm";
import {UserEntity}  from "./entities/User";
import {NoteEntity}  from "./entities/Note";

export const initAndGetDataSource = (
    host: string,
    port: number,
    username: string,
    password: string,
    database: string
): DataSource => {
    const appDataSource = new DataSource({
        type: "postgres",
        entities: [UserEntity.User, NoteEntity.Note],
        synchronize: true,
        logging: false,
        host,
        port,
        username,
        password,
        database
    })
    
    appDataSource.initialize()
    .then(() => {
        console.log(`[INFO] Connected to database "${database}" at host ${host}:${port} as ${username}, ready to use\n`)    
    })
    .catch((error) => console.log(error))

    return appDataSource
}