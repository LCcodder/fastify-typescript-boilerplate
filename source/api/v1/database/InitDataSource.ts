import { DataSource } from "typeorm";
import { User as UserEntity }  from "./entities/User";
import { Note as NoteEntity }  from "./entities/Note";
import { withRetry } from "../shared/decorators/WithRetry";
import { LOGGER } from "../shared/utils/common/Logger";


export class DataSourceInitialiser {
    constructor (
        private readonly host: string,
        private readonly port: number,
        private readonly username: string,
        private readonly password: string,
        private readonly database: string
    ) {}

    @withRetry
    public async initAndGetDataSource(): Promise<DataSource> {
        const appDataSource = new DataSource({
            type: "postgres",
            entities: [UserEntity, NoteEntity],
            synchronize: true,
            logging: false,
            host: this.host,
            port: this.port,
            username: this.username,
            password: this.password,
            database: this.database
        })
        
        await appDataSource.initialize()
        LOGGER.log('info', `Connected to database "${this.database}" at host ${this.host}:${this.port} as ${this.username}, ready to use\n`)    
        
    
        return appDataSource
    }
}

