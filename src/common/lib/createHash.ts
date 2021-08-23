import bcrypt from 'bcryptjs'

export const createHash = (pwd: string) => {
    return bcrypt.hashSync(pwd)
}
