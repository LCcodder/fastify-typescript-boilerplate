import { User, UserWithoutMetadata } from "../../actors/User";
import { DeepPartial } from "../../utils/DeepPartial";
import { UserExceptions } from "./UserExceptions";

export declare interface IUsersService {
    createUser(user: UserWithoutMetadata): Promise<
        | User
        | typeof UserExceptions.AlreadyExists
        | typeof UserExceptions.ServiceUnavailable
    >;

  // getUser(email: string): Promise<User | {
  //     statusCode: 503,
  //     message: 'Cannot get user, service unavalable'
  // } | {
  //     statusCode: 404,
  //     message: 'User not found'
  // }>

  // updateUser(updateData: DeepPartial<User>): Promise<User | {
  //     statusCode: 503,
  //     message: 'Cannot get user, service unavalable'
  // } | {
  //     statusCode: 404,
  //     message: 'User not found'
  // }>
}
