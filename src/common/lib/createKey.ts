import crypto from 'crypto'

export const createKey = () => {
    const firstKey = crypto.randomBytes(256).toString('hex').substr(100, 5)
    const secondKey = crypto.randomBytes(256).toString('base64').substr(50, 5)
    return (firstKey + secondKey).replace(/\//g, '')
}
