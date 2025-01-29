import { LOGGER } from "../utils/common/Logger"

export const withRetry = (maxRetries: number = 5, delay: number = 1000) => {
    return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
  
        descriptor.value = async function (...args: any[]) {
            let attempts = 0;
            let lastError: any;
    
            while (attempts < maxRetries) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    lastError = error;
                    attempts++;
                    LOGGER.error(error)
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
  
            throw lastError;
        };
    };
}