import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS, ORIGIN_ALLOW } from './config'
import errorHandler from './middlewares/error-handler'
import routes from './routes'
import logger from './utils/logger'

const { PORT = 3000 } = process.env
const app = express()

function getContentSecurityPolicy() {
    const isProduction = process.env.NODE_ENV === 'production'

    return {
        directives: {
            'default-src': ["'self'"],
            'script-src': [
                "'self'",
                ...(!isProduction ? ["'unsafe-eval'"] : []),
            ],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", 'data:'],
            'font-src': ["'self'"],
            'connect-src': [
                "'self'",
                ...(!isProduction ? ['ws://localhost:5173'] : []),
            ],
            'frame-ancestors': ["'none'"],
            'form-action': ["'self'"],
        },
    }
}

app.use(cookieParser())

app.use(helmet({ contentSecurityPolicy: getContentSecurityPolicy() }))
app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true, limit: '1mb' }))
app.use(json({ limit: '1mb' }))

app.options('*', cors({ origin: ORIGIN_ALLOW, credentials: true }))
app.use(routes)
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () =>
            logger.info('Server started', { port: PORT })
        )
    } catch (error) {
        logger.error('Bootstrap failed', { error })
    }
}

bootstrap()
