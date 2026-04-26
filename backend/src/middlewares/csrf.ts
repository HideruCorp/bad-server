import { doubleCsrf } from 'csrf-csrf'

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || 'csrf-secret-dev',
    getSessionIdentifier: (req) => {
        const authHeader = req.header('Authorization')
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.split(' ')[1]
        }
        return req.cookies?.refreshToken || 'anonymous'
    },
    cookieName: 'x-csrf-token',
    cookieOptions: {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        path: '/',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
})

export { generateCsrfToken, doubleCsrfProtection }
