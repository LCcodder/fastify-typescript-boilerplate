import {Schema} from 'mongoose'

export const userSchema = new Schema({
    // primary key
    login: String,
    email: String,
    password: String,
    username: String,
    // #8d62b5 - for example
    personalColor: String,
    isCollaborating: Boolean,
    validToken: String
}, { timestamps: true, versionKey: false })