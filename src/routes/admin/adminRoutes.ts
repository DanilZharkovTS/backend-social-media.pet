import { Router } from 'express'
import { requiresRole } from '../../middlewares/helpers/role.ts'
import { paginate } from '../../middlewares/helpers/pagination.ts'
import { authMiddlewares } from '../../middlewares/authMiddlewares.ts'
import { emailController } from '../../controllers/emailController.ts'
import { emailMiddlewares } from '../../middlewares/emailMiddlewares.ts'
import { setParamsId } from '../../middlewares/helpers/paramsId.ts'
import { userMiddlewares } from '../../middlewares/userMiddlewares.ts'
import { userController } from '../../controllers/userController.ts'
import { postController } from '../../controllers/postController.ts'
import { commentController } from '../../controllers/commentController.ts'

const router = Router()

//users

router.get(
  '/users',
  paginate,
  userMiddlewares.findAsAdmin,
  userController.findAsAdmin
)

router.post(
  '/users/:userId/delete/request',
  setParamsId(['userId']),
  emailMiddlewares.sendAdminDeleteUserEmail,
  emailController.sendAdminDeleteUserEmail
)

router.post(
  '/users/delete/confirm',
  emailMiddlewares.adminDeleteUser,
  emailController.adminDeleteUser
)

//posts

router.delete(
  '/posts/:postId/delete',
  setParamsId(['postId']),
  postController.deleteAsAdmin
)

//comments

router.delete(
  '/posts/:postId/comments/:commentId/delete',
  setParamsId(['postId', 'commentId']),
  commentController.deleteAsAdmin
)

export default router
