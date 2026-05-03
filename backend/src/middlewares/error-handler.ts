import { ErrorRequestHandler } from 'express'
import logger from '../utils/logger'

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    const statusCode = err.statusCode || 500
    const message =
        statusCode === 500 ? 'На сервере произошла ошибка' : err.message

    logger.error('Request error', {
        statusCode,
        name: err.name,
        message,
        err: { message: err.message, stack: err.stack },
    })

    res.status(statusCode).send({ message })

    next()
}

export default errorHandler
