import { generateGuard } from "typing-assets";
import { Exception } from "../Exception";

export const isException = generateGuard<Exception>("message", "string")