import { UserWithoutMetadata } from "../../database/entities/User"
import { UsersService } from "./UsersService"
import {describe, expect, test} from "@jest/globals"

const mockFindOneBy = jest.fn()
const mockSave = jest.fn()

const mockUpdate = jest.fn()

const usersRepository = {
    findOneBy: mockFindOneBy,
    save: mockSave,
    update: mockUpdate
}
// @ts-ignore
const usersService = new UsersService(usersRepository)

const user: UserWithoutMetadata = {
    login: "login",
    password: "12345678",
    email: "email@email.com",
    username: "username",
    personalColor: "#ffffff",
    isCollaborating: true
}

describe("Users service tests", () => {
    describe("Create user tests", () => {
        test("Should not return 'user already exists' error", async () => {
            usersRepository.save.mockResolvedValueOnce(true)

            const result = await usersService.createUser(user) as any

            expect(result).toBeDefined()
            expect(result).toEqual(true)
        })

        test("Should return 'user already exists' error", async () => {
            usersRepository.save.mockResolvedValueOnce(true)
            usersRepository.findOneBy.mockResolvedValueOnce(user)
            
            const result = await usersService.createUser(user) as any

            expect(result).toBeDefined()
            expect(result.message).toBeDefined()
            expect(result.statusCode).toEqual(400)
        })
    })

    describe("Get user tests", () => {
        test("Should return user data", async () => {
            usersRepository.findOneBy.mockResolvedValueOnce(user)

            const result = await usersService.getUser("login", "login") as any

            expect(result).toBeDefined()
            expect(result.login).toEqual("login")
        })

        test("Should return 'user doesn't exist' error", async () => {
            usersRepository.findOneBy.mockResolvedValueOnce(undefined)

            const result = await usersService.getUser("login", "login") as any

            expect(result).toBeDefined()
            expect(result.message).toBeDefined()
            expect(result.statusCode).toEqual(404)
        })
    })

    describe("Update user tests", () => {
        test("Should return user data", async () => {
            usersRepository.findOneBy.mockResolvedValueOnce(user)
            usersRepository.update.mockResolvedValueOnce(
                { affected: true }
            )

            const result = await usersService.updateUserByLogin("login", {}) as any

            expect(result).toBeDefined()
            expect(result.login).toEqual("login")
        })

        test("Should return 'user doesn't exist' error", async () => {
            usersRepository.update.mockResolvedValueOnce(
                { affected: false }
            )

            const result = await usersService.updateUserByLogin("login", {}) as any

            expect(result).toBeDefined()
            expect(result.message).toBeDefined()
            expect(result.statusCode).toEqual(404)
        })
    })
});
