import { NextFunction, Request, Response, Router } from 'express'
import NotFoundError from '../errors/not-found-error'

import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { Role } from '../models/user'
import { doubleCsrfProtection } from '../middlewares/csrf'
import { authLimiter, defaultLimiter } from '../middlewares/rate-limit'
import authRouter from './auth'
import customerRouter from './customers'
import orderRouter from './order'
import productRouter from './product'
import uploadRouter from './upload'

const router = Router()

router.use('/auth', authLimiter, authRouter)
router.use('/product', defaultLimiter, productRouter)
router.use(doubleCsrfProtection)
router.use('/order', auth, defaultLimiter, orderRouter)
router.use('/upload', auth, defaultLimiter, uploadRouter)
router.use('/customers', auth, roleGuardMiddleware(Role.Admin), defaultLimiter, customerRouter)

router.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError('Маршрут не найден'))
})

export default router
