import winston, { level } from "winston";

const customFormat = winston.format.printf(({level, message}) => {
    return `[${level.toUpperCase()}]: ${message}\n`
})

export const LOGGER = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                
                winston.format.colorize({all: true}),
                winston.format.simple(),
            ),
        })
    ]
})