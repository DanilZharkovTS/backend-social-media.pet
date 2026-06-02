import type { NextFunction, Request, Response } from 'express'
import { authService } from '../../shared/services/auth/authService.ts'
import { authProvidersService } from '../../shared/services/auth/providers/authProvidersService.ts'
import { AuthProvider } from '../../shared/interfaces/auth/authInterfaces.ts'

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.verifyEmail(req.queryMap.emailToken)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(
        req.body,
        req.hashedTrustedDeviceToken
      )
      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        })
      }
      res.status(200).json(result.logined)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  loginEmailConfirm: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await authService.loginEmailConfirm(req.body)
      res.cookie('trustedDeviceToken', result.trustedDeviceToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
      res.status(200).json(result.logined)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.refresh(req.hashedRefreshToken)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
      res.status(200).json(result.logined)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.logout(req.hashedRefreshToken)
      res.clearCookie('refreshToken')
      res.status(200).json(result)
    } catch (err) {
      res.clearCookie('refreshToken')
      next(err)
    }
  },
  requestChangeEmail: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await authService.requestChangeEmail(req.user, req.body)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  changeEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.changeEmailConfirm(
        req.queryMap.emailChangeToken
      )
      res.status(200).json(result)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.forgotPassword(req.body)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  requestPasswordResetEmail: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await authService.requestPasswordResetEmail(req.user)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.resetPassword(
        req.queryMap.resetPasswordToken,
        req.body
      )
      res.status(200).json(result)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  //oauth
  getAuthProviderUrl: (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = authProvidersService.getAuthProviderUrl(
        req.paramsMap.provider as AuthProvider
      )

      res.status(200).json(result.response)
    } catch (err) {
      next(err)
    }
  },
  authProviderCallback: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await authProvidersService.providerCallback(
        req.paramsMap.provider as AuthProvider,
        req.query.code as string,
        req.query.state as string
      )

      if (result) {
        const { tokens } = result
        res.cookie('refreshToken', tokens.rawRefreshToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        })
      }

      res.redirect(`${process.env.FRONTEND_URL}/posts`)
    } catch (err) {
      console.log(err)

      res.redirect(`${process.env.FRONTEND_URL}/auth/login`)
      next(err)
    }
  },
  //shared
  getAccountInviteUrl: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await authService.createAccountInviteUrl(
        req.user,
        req.body
      )
      res.status(200).json(result)
    } catch (err) {
      console.log(err);
      
      next(err)
    }
  },
  acceptAccountInvite: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await authService.acceptAccountInvite(req.queryMap.token)
      const { response, tokens } = result

      res.cookie('refreshToken', tokens.rawRefreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })

      res.status(200).json(response)
    } catch (err) {
      next(err)
    }
  },
  resolveInvite: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.resolveInvite(req.queryMap.token)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
}
