import bcrypt from 'bcrypt'
import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
import { userRepo } from '../../repos/userRepo.ts'
import type { requestAdminDeleteUserDTO } from '../../interfaces/admin/adminActionsInterfaces.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import { emailService } from '../email/emailService.ts'
import { authRepo } from '../../repos/authRepo.ts'
import { generateAdminDeleteUserToken } from '../../utils/helpers/auth/adminDeleteUserToken.ts'

export const adminActionsService = {
  requestAdminDeleteUser: async (
    admin: TokenPayload,
    data: requestAdminDeleteUserDTO,
    targetUserId: number
  ) => {
    const adminResult = await userRepo.findUserById(admin.userId)
    const adminDb = adminResult.rows[0]
    const isValidPassword = await bcrypt.compare(
      data.password,
      adminDb.password
    )
    if (!isValidPassword) {
      throw ApiError('Password is not valid', 401)
    }
    const tokenData = generateAdminDeleteUserToken()

    await authRepo.insertAdminDeleteUserToken(
      admin.userId,
      tokenData.hashedAdminDeleteUserToken,
      tokenData.expiresAt,
      targetUserId,
      'ADMIN_DELETE_USER'
    )

    await emailService.sendAdminDeleteUserEmail(adminDb.email, tokenData)

    return { emailWasSent: true }
  },
  adminDeleteUserConfirm: async (token: string) => {
    const tokenResult = await authRepo.selectActionTokenByToken(token)
    const dbToken = tokenResult.rows[0]

    if (!dbToken || new Date() > dbToken.expires_at || dbToken.used_at) {
      throw ApiError('Admin delete user token is invalid or expired', 400)
    }

    const payload = dbToken.payload

    const userResult = await userRepo.deleteUserById(payload.targetUserId)
    if (userResult.rows.length === 0) {
      throw ApiError(`User with id: ${payload.targetUserId} is not found`, 404)
    }

    await authRepo.revokeActionTokenById(dbToken.id)

    return { userIsDeleted: true }
  },
}
