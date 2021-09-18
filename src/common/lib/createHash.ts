import bcrypt from 'bcryptjs'

export const createHash = (text: string) => {
    return bcrypt.hashSync(text)
}
