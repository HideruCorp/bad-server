import { unlink } from 'fs'
import mongoose, { Document } from 'mongoose'
import { join } from 'path'
import { isPathWithin } from '../utils/pathSafety'
import logger from '../utils/logger'

export interface IFile {
    fileName: string
    originalName: string
}

export interface IProduct extends Document {
    title: string
    image: IFile
    category: string
    description: string
    price: number
}

const cardsSchema = new mongoose.Schema<IProduct>(
    {
        title: {
            type: String,
            unique: true,
            required: [true, 'Поле "title" должно быть заполнено'],
            minlength: [2, 'Минимальная длина поля "title" - 2'],
            maxlength: [30, 'Максимальная длина поля "title" - 30'],
        },
        image: {
            fileName: {
                type: String,
                required: [true, 'Поле "image.fileName" должно быть заполнено'],
            },
            originalName: String,
        },
        category: {
            type: String,
            required: [true, 'Поле "category" должно быть заполнено'],
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            default: null,
        },
    },
    { versionKey: false }
)

cardsSchema.index({ title: 'text' })

// Можно лучше: удалять старое изображением перед обновлением сущности
cardsSchema.pre('findOneAndUpdate', async function deleteOldImage() {
    // @ts-ignore
    const updateImage = this.getUpdate().$set?.image
    const docToUpdate = await this.model.findOne(this.getQuery())
    if (updateImage && docToUpdate) {
        const targetPath = join(__dirname, `../public/${docToUpdate.image.fileName}`)
        const publicDir = join(__dirname, '../public')
        if (!isPathWithin(targetPath, publicDir)) {
            logger.warn('Skipping deletion: path escapes public directory', {
                targetPath,
            })
        } else {
            unlink(targetPath, (err) => {
                if (err) {
                    logger.warn('Failed to delete file', {
                        path: targetPath,
                        message: err.message,
                    })
                }
            })
        }
    }
})

// Можно лучше: удалять файл с изображением после удаление сущности
cardsSchema.post('findOneAndDelete', async (doc: IProduct) => {
    const targetPath = join(__dirname, `../public/${doc.image.fileName}`)
    const publicDir = join(__dirname, '../public')
    if (!isPathWithin(targetPath, publicDir)) {
        logger.warn('Skipping deletion: path escapes public directory', {
            targetPath,
        })
    } else {
        unlink(targetPath, (err) => {
            if (err) {
                logger.warn('Failed to delete file', {
                    path: targetPath,
                    message: err.message,
                })
            }
        })
    }
})

export default mongoose.model<IProduct>('product', cardsSchema)
