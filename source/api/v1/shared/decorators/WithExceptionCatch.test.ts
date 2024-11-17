import {describe, expect, test} from "@jest/globals";
import { withExceptionCatch } from "./WithExceptionCatch";
import { Exception } from "../utils/typing/Exception";

class TestClass {


    @withExceptionCatch
    public static async testFunction1() {
        throw new Error("random error")
    }

    @withExceptionCatch
    public static async testFunction2() {
        return true
    }
}


describe("Exception catch decorator tests", () => {
    test("Should catch exception", async () => {
        const result = await TestClass.testFunction1() as unknown as Exception
        expect(
            result.statusCode
        ).toEqual(503)
    })

    test("Should skip result overriding (no error throwed)", async () => {
        const result = await TestClass.testFunction2() as unknown as Exception
        expect(
            result
        ).toBeTruthy()
    })
});
