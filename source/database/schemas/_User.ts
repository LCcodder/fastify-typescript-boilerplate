import {Schema} from 'mongoose'

export const userSchema = new Schema({
    email: String,
    password: String,
    username: String,
    // #8d62b5 - for example
    personalColor: String,
}, { timestamps: true })