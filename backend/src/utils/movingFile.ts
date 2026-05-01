import { existsSync, mkdirSync, rename } from 'fs'
import { basename, join } from 'path'
import { isPathWithin } from './pathSafety'

function movingFile(imagePath: string, from: string, to: string) {
    const fileName = basename(imagePath)
    const imagePathTemp = join(from, fileName)
    const imagePathPermanent = join(to, fileName)

    mkdirSync(to, { recursive: true })

    if (!isPathWithin(imagePathTemp, from)) {
        throw new Error('Ошибка при сохранении файла')
    }
    if (!isPathWithin(imagePathPermanent, to)) {
        throw new Error('Ошибка при сохранении файла')
    }

    if (!existsSync(imagePathTemp)) {
        throw new Error('Ошибка при сохранении файла')
    }

    rename(imagePathTemp, imagePathPermanent, (err) => {
        if (err) {
            throw new Error('Ошибка при сохранении файла')
        }
    })
}

export default movingFile
