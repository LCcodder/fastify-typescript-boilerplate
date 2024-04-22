import { User, UserUpdate, UserWithoutMetadata } from "../../actors/User";
import { USER_EXCEPTIONS } from "./UserExceptions";

export declare interface IUsersService {
    createUser(user: UserWithoutMetadata): Promise<
        | User
        | typeof USER_EXCEPTIONS.AlreadyExists
        | typeof USER_EXCEPTIONS.ServiceUnavailable
    >;

    getUser<TKey extends keyof UserWithoutMetadata>(
        key: TKey, 
        value: UserWithoutMetadata[TKey]
    ): Promise<
        | User
        | typeof USER_EXCEPTIONS.ServiceUnavailable
        | typeof USER_EXCEPTIONS.NotFound  
    >

    updateUserByLogin(login: string, updateData: UserUpdate): Promise<
        | User
        | typeof USER_EXCEPTIONS.ServiceUnavailable
        | typeof USER_EXCEPTIONS.NotFound  
    >
}
