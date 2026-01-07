import { Router } from 'express'
import { requiresRole } from '../../middlewares/helpers/role.ts'
import { paginate } from '../../middlewares/helpers/pagination.ts'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares.ts'
import { setParamsId } from '../../middlewares/helpers/paramsId.ts'
import { userMiddlewares } from '../../middlewares/user/userMiddlewares.ts'
import { userController } from '../../controllers/user/userController.ts'
import { postController } from '../../controllers/user/postController.ts'
import { commentController } from '../../controllers/user/commentController.ts'
import { adminActionsController } from '../../controllers/admin/adminActionsController.ts'
import { adminActionsMiddlewares } from '../../middlewares/admin/adminActionsMiddlewares.ts'

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
  adminActionsMiddlewares.requestAdminDeleteUser,
  adminActionsController.requestAdminDeleteUser
)

router.post(
  '/users/delete/confirm',
  adminActionsMiddlewares.adminDeleteUserConfirm,
  adminActionsController.adminDeleteUserConfirm
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
