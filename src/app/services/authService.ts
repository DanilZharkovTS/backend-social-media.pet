import bcrypt from 'bcrypt'
import type { registerUserDTO } from '../interfaces/authInterfaces.ts'
import { authRepo } from '../repos/authRepo.ts'

export const authService = {
  register: async (data: registerUserDTO) => {
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(data.password, saltRounds)
    data.password = hashedPassword

    const result = await authRepo.createUser(data)
    return { registered: result.rows[0] }
  },
}
