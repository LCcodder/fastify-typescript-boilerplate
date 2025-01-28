import { SERVICE_UNAVAILABLE } from "../exceptions/CommonException"
import { LOGGER } from "../utils/common/Logger"

export const withExceptionCatch = (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
        try {
            return await originalMethod.apply(this, args)
        } catch (error) {
            LOGGER.error(error)
            return SERVICE_UNAVAILABLE
        }
    }

    return descriptor
}