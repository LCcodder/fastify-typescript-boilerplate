import { User, UserUpdate, UserWithoutMetadata } from "../../shared/dto/UserDto";
import { SERVICE_UNAVAILABLE } from "../../shared/exceptions/CommonException";
import { USER_ALREADY_EXISTS } from "../../shared/exceptions/UserExceptions";

export declare interface IUsersService {
    createUser(user: UserWithoutMetadata): Promise<
        | User
        | typeof USER_ALREADY_EXISTS
        | typeof SERVICE_UNAVAILABLE
    >;

    getUser<TKey extends keyof UserWithoutMetadata>(
        key: TKey, 
        value: UserWithoutMetadata[TKey]
    ): Promise<
        | User
        | typeof SERVICE_UNAVAILABLE
        | typeof SERVICE_UNAVAILABLE
    >

    updateUserByLogin(login: string, updateData: UserUpdate): Promise<
        | User
        | typeof SERVICE_UNAVAILABLE
        | typeof SERVICE_UNAVAILABLE
    >
}
