import { authController } from '../../controllers/authController.ts'
import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/authMiddlewares.ts'
import { emailController } from '../../controllers/emailController.ts'
import { emailMiddlewares } from '../../middlewares/emailMiddlewares.ts'
import { requiresRole } from '../../middlewares/helpers/role.ts'
import { setParamsId } from '../../middlewares/helpers/paramsId.ts'
import { userMiddlewares } from '../../middlewares/userMiddlewares.ts'
import { userController } from '../../controllers/userController.ts'

const router = Router()


export default router
