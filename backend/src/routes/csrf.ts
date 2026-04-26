import { Router } from 'express'

import auth from '../middlewares/auth'
import { generateCsrfToken } from '../middlewares/csrf'

const csrfRouter = Router()

csrfRouter.get('/csrf-token', auth, (req, res) => {
    const token = generateCsrfToken(req, res)
    res.json({ csrfToken: token })
})

export default csrfRouter
