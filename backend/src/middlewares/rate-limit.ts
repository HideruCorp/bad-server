import { Request, Response, NextFunction } from 'express'
import rateLimit, { Options } from 'express-rate-limit'

type LimiterConfig = Partial<Options> & { max?: number; windowMs?: number }

const globalDefaults = {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 5000),
    max: Number(process.env.RATE_LIMIT_POINTS || 100),
}

const createLimiter = (overrides: LimiterConfig = {}) => {
    if (process.env.RATE_LIMITED !== 'true') {
        return (_req: Request, _res: Response, next: NextFunction) => next()
    }

    return rateLimit({
        windowMs: globalDefaults.windowMs,
        max: globalDefaults.max,
        message: { message: 'Слишком много запросов' },
        ...overrides,
    })
}

export const authLimiter = createLimiter({ windowMs: 5_000, max: 5 })
export const defaultLimiter = createLimiter()

export default createLimiter
