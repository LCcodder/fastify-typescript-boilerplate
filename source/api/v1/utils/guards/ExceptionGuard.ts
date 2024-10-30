import { generateGuard } from "typing-assets";
import { Exception } from "../typing/Exception";

export const isException = generateGuard<Exception>("message", "string")