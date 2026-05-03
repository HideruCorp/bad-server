import { existsSync, mkdirSync } from 'fs'
import { rename } from 'fs/promises'
import { basename, join } from 'path'
import { isPathWithin } from './pathSafety'

async function movingFile(imagePath: string, from: string, to: string) {
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

    try {
        await rename(imagePathTemp, imagePathPermanent)
    } catch {
        throw new Error('Ошибка при сохранении файла')
    }
}

export default movingFile
