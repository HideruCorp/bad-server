import { extname, resolve, sep } from 'path'
import uniqueSlug from 'unique-slug'

export function isPathWithin(targetPath: string, baseDir: string): boolean {
    const resolved = resolve(targetPath)
    const resolvedBase = resolve(baseDir)
    return resolved.startsWith(resolvedBase + sep) || resolved === resolvedBase
}

export function sanitizeFileName(fileName: string): string {
    const ext = extname(fileName)
    return `${uniqueSlug()}${ext}`
}
