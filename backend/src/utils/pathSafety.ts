import { basename, resolve, sep } from 'path'

export function isPathWithin(targetPath: string, baseDir: string): boolean {
    const resolved = resolve(targetPath)
    const resolvedBase = resolve(baseDir)
    return resolved.startsWith(resolvedBase + sep) || resolved === resolvedBase
}

export function sanitizeFileName(fileName: string): string {
    return basename(fileName)
}
