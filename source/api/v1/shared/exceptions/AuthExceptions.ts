import { Exception } from "../utils/typing/Exception";


const WRONG_CREDENTIALS: Exception = {
    statusCode: 409,
    message: "Wrong credentials"
}

const NEW_PASSWORD_IS_SAME: Exception = {
    statusCode: 400,
    message: "New password can not be same as old"
}

export { NEW_PASSWORD_IS_SAME, WRONG_CREDENTIALS }