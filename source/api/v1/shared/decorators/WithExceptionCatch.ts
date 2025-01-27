import { SERVICE_UNAVAILABLE } from "../exceptions/CommonException"

export const withExceptionCatch = (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
        try {
            return await originalMethod.apply(this, args)
        } catch (error) {
            console.log(error)
            return SERVICE_UNAVAILABLE
        }
    }

    return descriptor
}