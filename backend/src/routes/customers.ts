import { Router } from 'express'
import {
    deleteCustomer,
    getCustomerById,
    getCustomers,
    updateCustomer,
} from '../controllers/customers'
import {
    validateCustomerQuery,
    validateCustomerUpdateBody,
} from '../middlewares/validations'

const customerRouter = Router()

customerRouter.get('/', validateCustomerQuery, getCustomers)
customerRouter.get('/:id', getCustomerById)
customerRouter.patch('/:id', validateCustomerUpdateBody, updateCustomer)
customerRouter.delete('/:id', deleteCustomer)

export default customerRouter
