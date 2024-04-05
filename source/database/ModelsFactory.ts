import mongoose, { Mongoose, mongo } from "mongoose";
import { userSchema } from "./schemas/_User";
import { noteSchema } from "./schemas/_Note";

export const modelsFactory = (mongoose: Mongoose) => {
    return {
        User: mongoose.model('User', userSchema),
        Note: mongoose.model('Note', noteSchema)
    }
}
export type UserModel = ReturnType<typeof modelsFactory>['User']
export type NoteModel = ReturnType<typeof modelsFactory>['Note']