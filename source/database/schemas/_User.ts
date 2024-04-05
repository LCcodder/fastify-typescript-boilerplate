import {Schema} from 'mongoose'

export const userSchema = new Schema({
    email: String,
    password: String,
    createdAt: Date
})