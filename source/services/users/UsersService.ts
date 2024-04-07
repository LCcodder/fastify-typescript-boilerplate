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
                return reject(UserExceptions.ServiceUnavailable)
            }
        })
    }

    public getUser<TKey extends keyof UserWithoutMetadata>(key: TKey, value: UserWithoutMetadata[TKey]) {
        return new Promise( async (
            resolve: (state: User) => void,
            reject: (exception: 
                | typeof UserExceptions.ServiceUnavailable
                | typeof UserExceptions.NotFound
            ) => void
        ) => {
            try {
                let query: Record<string, UserWithoutMetadata[TKey]> = {}
                query[key] = value

                const user = await this.User.findOne(query)
                
                if (!user) return reject(UserExceptions.NotFound)
                return resolve(user as unknown as User)
            } catch (_error) {
                return reject(UserExceptions.ServiceUnavailable)
            }
        })
    }
    
    public getUserById(id: string) {
        return new Promise( async (
            resolve: (state: User) => void,
            reject: (exception: 
                | typeof UserExceptions.ServiceUnavailable
                | typeof UserExceptions.NotFound
            ) => void
        ) => {
            try {
                const user = await this.User.findById(id)
                if (!user) return reject(UserExceptions.NotFound)
                return resolve(user as unknown as User)
            } catch (_error) {
                return reject(UserExceptions.ServiceUnavailable)
            }
        })
    }

    // public getUserByEmail(email: string) {
    //     return new Promise( async (
    //         resolve: (state: User) => void,
    //         reject: (exception: 
    //             | typeof UserExceptions.ServiceUnavailable
    //             | typeof UserExceptions.NotFound
    //         ) => void
    //     ) => {
    //         try {
    //             const user = await this.User.findOne({ email })
    //             if (!user) return reject(UserExceptions.NotFound)
    //             return resolve(user as unknown as User)
    //         } catch (_error) {
    //             return reject(UserExceptions.ServiceUnavailable)
    //         }
    //     })
    // }

    // public getUserByUsername(username: string) {
    //     return new Promise( async (
    //         resolve: (state: User) => void,
    //         reject: (exception: 
    //             | typeof UserExceptions.ServiceUnavailable
    //             | typeof UserExceptions.NotFound
    //         ) => void
    //     ) => {
    //         try {
    //             const user = await this.User.findOne({ username })
    //             if (!user) return reject(UserExceptions.NotFound)
    //             return resolve(user as unknown as User)
    //         } catch (_error) {
    //             return reject(UserExceptions.ServiceUnavailable)
    //         }
    //     })
    // }
}