import {describe, expect, test} from "@jest/globals";
import { generateToken } from "./TokenGenerator";
import * as jwt from "jsonwebtoken"

describe("Token generator tests", () => {
    test("Should generate different token twice", () => {
        const token1 = generateToken("login")
        const token2 = generateToken("login")

        expect(token1).toEqual(token2)
    });

    test("Should have payload", () => {
        const token = generateToken("login")
        const { login } = jwt.decode(token) as any
        expect(login).toEqual("login")
    })
});
