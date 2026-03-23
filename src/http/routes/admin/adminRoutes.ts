import { Router } from 'express'
import { paginate } from '../../middlewares/helpers/pagination.ts'
import { setParamsId } from '../../middlewares/helpers/paramsId.ts'
import { userMiddlewares } from '../../middlewares/user/userMiddlewares.ts'
import { userController } from '../../controllers/user/userController.ts'
import { postController } from '../../controllers/user/postController.ts'
import { commentController } from '../../controllers/user/commentController.ts'
import { adminActionsController } from '../../controllers/adminActionsController.ts'
import { adminActionsMiddlewares } from '../../middlewares/admin/adminActionsMiddlewares.ts'
import { rateLimiter } from '../../middlewares/helpers/rateLimiter.ts'

const router = Router()

//users

router.get(
  '/users',
  rateLimiter(10, 60, 'adminUsersList'),
  paginate,
  userMiddlewares.findAsAdmin,
  userController.findAsAdmin
)

router.post(
  '/users/:userId/delete/request',
  rateLimiter(5, 60, 'adminUserDeleteRequest'),
  setParamsId(['userId']),
  adminActionsMiddlewares.requestAdminDeleteUser,
  adminActionsController.requestAdminDeleteUser
)

router.post(
  '/users/delete/confirm',
  rateLimiter(5, 60, 'adminUserDeleteConfirm'),
  adminActionsMiddlewares.adminDeleteUserConfirm,
  adminActionsController.adminDeleteUserConfirm
)
//posts
router.delete(
  '/posts/:postId/delete',
  rateLimiter(10, 60, 'adminPostDelete'),
  setParamsId(['postId']),
  postController.deleteAsAdmin
)
//comments
router.delete(
  '/posts/:postId/comments/:commentId/delete',
  rateLimiter(20, 60, 'adminCommentDelete'),
  setParamsId(['postId', 'commentId']),
  commentController.deleteAsAdmin
)

export default router
