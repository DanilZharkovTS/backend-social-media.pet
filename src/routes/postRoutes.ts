import Router from 'express'
import { postController } from '../controllers/postController.ts'
import { postMiddlewares } from '../middlewares/postMiddlewares.ts'
import { paginate } from '../middlewares/helpers/pagination.ts'
import { setParamsId } from '../middlewares/helpers/paramsId.ts'
import { commentMiddlewares } from '../middlewares/commentMiddlewares.ts'
import { commentController } from '../controllers/commentController.ts'
import { authMiddlewares } from '../middlewares/authMiddlewares.ts'
import { requiresRole } from '../middlewares/helpers/role.ts'

const router = Router()

//posts

router.post(
  '/add',
  authMiddlewares.verifyAccessToken,
  postMiddlewares.add,
  postController.add
)

router.get('/getAll', paginate, postController.readAll)

router.patch(
  '/update/:postId',
  authMiddlewares.verifyAccessToken,
  setParamsId(['postId']),
  postMiddlewares.update,
  postController.update
)

router.delete(
  '/delete/:postId',
  authMiddlewares.verifyAccessToken,
  setParamsId(['postId']),
  postController.delete
)

router.get(
  '/find',
  authMiddlewares.verifyAccessToken,
  paginate,
  postMiddlewares.find,
  postController.find
)

//admin

router.delete(
  '/:postId/delete/admin',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  setParamsId(['postId']),
  postController.deleteAsAdmin
)

//comments

router.post(
  '/:postId/comments/add',
  authMiddlewares.verifyAccessToken,
  setParamsId(['postId']),
  commentMiddlewares.add,
  commentController.add
)

router.get(
  '/:postId/comments',
  authMiddlewares.verifyAccessToken,
  paginate,
  setParamsId(['postId']),
  commentController.readAll
)

router.patch(
  '/:postId/comments/:commentId/update',
  authMiddlewares.verifyAccessToken,
  setParamsId(['postId', 'commentId']),
  commentMiddlewares.update,
  commentController.update
)

router.delete(
  '/:postId/comments/:commentId/delete',
  setParamsId(['postId', 'commentId']),
  authMiddlewares.verifyAccessToken,
  commentController.delete
)

//admin

router.delete(
  '/:postId/comments/:commentId/delete/admin',
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  setParamsId(['postId', 'commentId']),
  commentController.deleteAsAdmin
)

export default router
