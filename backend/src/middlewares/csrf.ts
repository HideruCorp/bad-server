import { doubleCsrf } from 'csrf-csrf'
import { requireEnv } from '../utils/requireEnv'

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => requireEnv('CSRF_SECRET', 'csrf-secret-dev'),
    getSessionIdentifier: (req) => req.cookies?.refreshToken || 'anonymous',
    cookieName: '_csrf',
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
