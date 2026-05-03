export function requireEnv(name: string, fallback: string): string {
    const value = process.env[name]
    if (value !== undefined && value !== '') {
        return value
    }
    if (process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return fallback
}
