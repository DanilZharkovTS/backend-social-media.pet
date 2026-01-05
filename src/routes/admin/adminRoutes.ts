import { authController } from '../../controllers/authController.ts'
import { Router } from 'express'
import { authMiddlewares } from '../../middlewares/authMiddlewares.ts'
import { emailController } from '../../controllers/emailController.ts'
import { emailMiddlewares } from '../../middlewares/emailMiddlewares.ts'
import { requiresRole } from '../../middlewares/helpers/role.ts'
import { setParamsId } from '../../middlewares/helpers/paramsId.ts'
import { userMiddlewares } from '../../middlewares/userMiddlewares.ts'
import { userController } from '../../controllers/userController.ts'
import { postController } from '../../controllers/postController.ts'
import { commentController } from '../../controllers/commentController.ts'
import { paginate } from '../../middlewares/helpers/pagination.ts'

const router = Router()

//users

router.get(
  '/users',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  paginate,
  userMiddlewares.findAsAdmin,
  userController.findAsAdmin
)

router.post(
  '/users/:userId/delete/request',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  setParamsId(['userId']),
  userMiddlewares.deleteUserAsAdmin,
  userController.deleteUserAsAdmin
)

router.post(
  '/users/delete/confirm',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  emailMiddlewares.adminDeleteUser,
  emailController.adminDeleteUser
)

//posts

router.delete(
  '/posts/:postId/delete',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  setParamsId(['postId']),
  postController.deleteAsAdmin
)

//comments

router.delete(
  '/posts/:postId/comments/:commentId/delete',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  setParamsId(['postId', 'commentId']),
  commentController.deleteAsAdmin
)

export default router
