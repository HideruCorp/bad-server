import { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    const statusCode = err.statusCode || 500
    const message =
        statusCode === 500 ? 'На сервере произошла ошибка' : err.message

    if (process.env.NODE_ENV !== 'production') {
        console.log({
            statusCode,
            name: err.name,
            message: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString(),
        })
    } else {
        console.log({
            statusCode,
            name: err.name,
            message,
            timestamp: new Date().toISOString(),
        })
    }

    res.status(statusCode).send({ message })

    next()
}

export default errorHandler
