import { User, UserWithoutMetadata } from "../../actors/User";
import { DeepPartial } from "../../utils/DeepPartial";
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

    getUserById(id: string): Promise<
        | User
        | typeof UserExceptions.ServiceUnavailable
        | typeof UserExceptions.NotFound  
    >


  // updateUser(updateData: DeepPartial<User>): Promise<User | {
  //     statusCode: 503,
  //     message: 'Cannot get user, service unavalable'
  // } | {
  //     statusCode: 404,
  //     message: 'User not found'
  // }>
}
