import {describe, expect, test} from "@jest/globals";
import { FastifyRequest } from "fastify";
import { extractToken } from "./TokenExtractor";

describe("Token extractor tests", () => {
    test("Should extract Bearer token from headers", () => {
        let req = {
            headers: {
                authorization: "Bearer <token>"
            }
        }

        const token = extractToken(req as FastifyRequest)

        expect(
            token
        ).toEqual("<token>")
    })

    test("Should return undefined (header not provided)", () => {
        let req = {
            headers: {}
        }

        const token = extractToken(req as FastifyRequest)

        expect(
            token
        ).toEqual(undefined)
    })

    test("Should return undefined (authorization header is empty)", () => {
        let req = {
            headers: {
                authorization: ""
            }
        }

        const token = extractToken(req as FastifyRequest)

        expect(
            token
        ).toEqual(undefined)
    })
});
