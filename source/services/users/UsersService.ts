import mongoose, { ObjectId } from "mongoose";
import { User, UserWithoutMetadata } from "../../actors/User";
import { IUsersService } from "./IUsersService";
import { UserExceptions } from "./UserExceptions";
import { UserModel } from "../../database/ModelsFactory";

export class UsersService implements IUsersService {
    constructor(private User: UserModel) {}

    public createUser(user: UserWithoutMetadata) {
        return new Promise(async (
            resolve: (state: User) => void,
            reject: (exception: 
                | typeof UserExceptions.ServiceUnavailable
                | typeof UserExceptions.AlreadyExists 
            ) => void
        ) => {
            try {
                const foundUser = await this.User.findOne({
                    email: user.email
                })
                if (foundUser) {
                    return reject(UserExceptions.AlreadyExists)
                }
                const createdUser = await this.User.create(user)
                
                return resolve(createdUser as unknown as User)
            } catch (_error) {
                console.log(_error)
                return reject(UserExceptions.ServiceUnavailable)
            }
        })
    }
}