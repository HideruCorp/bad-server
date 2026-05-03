import { Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import { generateCsrfToken } from '../middlewares/csrf'
import {
    validateUserUpdateBody,
    validateAuthentication,
    validateUserBody,
} from '../middlewares/validations'
import { authLimiter } from '../middlewares/rate-limit'

const authRouter = Router()

authRouter.get('/user', auth, getCurrentUser)
authRouter.get('/csrf-token', (req, res) => {
    const token = generateCsrfToken(req, res)
    res.json({ csrfToken: token })
})
authRouter.patch('/me', auth, validateUserUpdateBody, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', authLimiter, validateAuthentication, login)
authRouter.get('/token', refreshAccessToken)
authRouter.get('/logout', logout)
authRouter.post('/register', authLimiter, validateUserBody, register)

export default authRouter
