import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { unlinkSync } from 'fs'
import sharp from 'sharp'
import BadRequestError from '../errors/bad-request-error'

export const MIN_FILE_SIZE = 2048
export const MAX_FILE_SIZE = 10 * 1024 * 1024

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    if (req.file.size < MIN_FILE_SIZE) {
        unlinkSync(req.file.path)
        return next(new BadRequestError('Размер файла слишком мал'))
    }

    if (req.file.size > MAX_FILE_SIZE) {
        unlinkSync(req.file.path)
        return next(new BadRequestError('Размер файла слишком велик'))
    }

    try {
        const metadata = await sharp(req.file.path).metadata()
        if (!metadata.format) {
            unlinkSync(req.file.path)
            return next(new BadRequestError('Файл не является изображением'))
        }
    } catch {
        unlinkSync(req.file.path)
        return next(new BadRequestError('Файл не является изображением'))
    }

    try {
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
