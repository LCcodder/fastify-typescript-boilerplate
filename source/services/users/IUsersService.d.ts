import { User, UserUpdate, UserWithoutMetadata } from "../../actors/User";
import { UserExceptions } from "./UserExceptions";

export declare interface IUsersService {
    createUser(user: UserWithoutMetadata): Promise<
        | User
        | typeof UserExceptions.AlreadyExists
        | typeof UserExceptions.ServiceUnavailable
    >;

    getUser<TKey extends keyof UserWithoutMetadata>(
        key: TKey, 
        value: UserWithoutMetadata[TKey]
    ): Promise<
        | User
        | typeof UserExceptions.ServiceUnavailable
        | typeof UserExceptions.NotFound  
    >

    updateUserByEmail(email: string, updateData: UserUpdate): Promise<
        | User
        | typeof UserExceptions.ServiceUnavailable
        | typeof UserExceptions.NotFound  
        | typeof UserExceptions.AlreadyExists
    >
}
