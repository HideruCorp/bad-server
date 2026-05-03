import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import winston from 'winston'
import { LOG_LEVEL } from '../config'

const isProd = process.env.NODE_ENV === 'production'
const logDir = join(dirname(__filename), '../../logs')

mkdirSync(logDir, { recursive: true })

const stripSensitive = winston.format(({ err: _err, ...rest }) => rest)

const devFormat = winston.format.printf(
    ({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : ''
        return `${timestamp} [${level}]: ${message}${metaStr}`
    }
)

const logger = winston.createLogger({
    level: LOG_LEVEL,
    defaultMeta: { timestamp: new Date().toISOString() },
    format: winston.format.combine(winston.format.timestamp()),
    transports: [
        new winston.transports.Console({
            format: isProd
                ? winston.format.combine(stripSensitive(), winston.format.json())
                : winston.format.combine(
                      winston.format.colorize(),
                      devFormat
                  ),
        }),
        new winston.transports.File({
            filename: join(logDir, 'error.log'),
            level: 'error',
            maxsize: 10_485_760,
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: join(logDir, 'combined.log'),
            maxsize: 10_485_760,
            maxFiles: 5,
        }),
    ],
})

export default logger
