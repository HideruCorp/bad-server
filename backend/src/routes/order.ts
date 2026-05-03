import { Router } from 'express'
import {
    createOrder,
    deleteOrder,
    getOrderByNumber,
    getOrderCurrentUserByNumber,
    getOrders,
    getOrdersCurrentUser,
    updateOrder,
} from '../controllers/order'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import {
    validateOrderBody,
    validateOrderCurrentUserQuery,
    validateOrderQuery,
} from '../middlewares/validations'
import { Role } from '../models/user'

const orderRouter = Router()

orderRouter.get('/me/:orderNumber', auth, getOrderCurrentUserByNumber)
orderRouter.get(
    '/all/me',
    auth,
    validateOrderCurrentUserQuery,
    getOrdersCurrentUser
)
orderRouter.post('/', auth, validateOrderBody, createOrder)
orderRouter.use(roleGuardMiddleware(Role.Admin))
orderRouter.get('/all', auth, validateOrderQuery, getOrders)
orderRouter.get('/:orderNumber', auth, getOrderByNumber)
orderRouter.patch('/:orderNumber', auth, updateOrder)
orderRouter.delete('/:id', auth, deleteOrder)

export default orderRouter
