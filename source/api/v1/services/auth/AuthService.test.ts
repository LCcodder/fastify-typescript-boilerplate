import {describe, expect, test} from "@jest/globals"
import * as bcrypt from "bcrypt"
import { User } from "../../database/entities/User";
import { AuthService } from "./AuthService";
import redis from "redis";

const user: User = {
    login: "login",
    password: bcrypt.hashSync("12345678", 4),
    email: "email@email.com",
    username: "username",
    personalColor: "#ffffff",
    isCollaborating: true,
    createdAt: new Date(),
    updatedAt: new Date()
}

// setting different values for different test scenarios
const mockGetUser = jest.fn()
const mockUpdateUser = jest.fn()

const usersService = {
    getUser: mockGetUser,
    updateUserByLogin: mockUpdateUser
}
// @ts-ignore
const authService = new AuthService(usersService, redis.createClient())


describe("Auth service test", () => {
    describe("Authorization tests", () => {
        test("Should authorize, then generate and return token", async () => {
            usersService.getUser.mockResolvedValueOnce(user)
            const result = await authService.authenticateAndGenerateToken("email@email.com", "12345678") as any

            expect(result).toBeDefined()
            expect(result.expiresIn).toBeDefined()
            expect(result.token.length).toBeGreaterThan(10)
        })

        test("Should return wrong credentials error (wrong email)", async () => {
            usersService.getUser.mockResolvedValueOnce({
                message: "",
                statusCode: 404
            })
            const result = await authService.authenticateAndGenerateToken("email@email.com", "12345678") as any

            expect(result).toBeDefined()
            expect(result.message).toBeDefined()
            expect(result.statusCode).toEqual(400)
        })
        
        test("Should return wrong credentials error (wrong password)", async () => {
            usersService.getUser.mockResolvedValueOnce(user)
            const result = await authService.authenticateAndGenerateToken("email@email.com", "123456789") as any

            expect(result).toBeDefined()
            expect(result.message).toBeDefined()
            expect(result.statusCode).toEqual(400)
        })

    });

    describe("Change password tests", () => {
        test("Should return success", async () => {
            usersService.getUser.mockResolvedValueOnce(user)
            const result = await authService.changePassword("login", "12345678", "23423423") as any

            expect(result).toBeDefined()
            expect(result.success).toEqual(true)
        })

        test("Should return wrong credentials error (wrong login)", async () => {
            usersService.getUser.mockResolvedValueOnce({
                message: "",
                statusCode: 404
            })
            const result = await authService.changePassword("login", "12345678", "23423423") as any

            expect(result).toBeDefined()
            expect(result.message).toBeDefined()
            expect(result.statusCode).toEqual(400)
        })

        test("Should return wrong credentials error (wrong old password)", async () => {
            usersService.getUser.mockResolvedValueOnce(user)
            const result = await authService.changePassword("login", "123456789", "23423423") as any

            expect(result).toBeDefined()
            expect(result.message).toBeDefined()
            expect(result.statusCode).toEqual(400)
        })

        test("Should return passwords are same error", async () => {
            usersService.getUser.mockResolvedValueOnce(user)
            const result = await authService.changePassword("login", "12345678", "12345678") as any

            expect(result).toBeDefined()
            expect(result.message).toBeDefined()
            expect(result.statusCode).toEqual(400)
        })
    })

})

