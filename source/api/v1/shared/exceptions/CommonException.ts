import { Exception } from "../utils/typing/Exception";

export const SERVICE_UNAVAILABLE: Exception = {
  statusCode: 503,
  message: "Service unavailable"
}