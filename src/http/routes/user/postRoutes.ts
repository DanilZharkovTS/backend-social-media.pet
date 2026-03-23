import Router from 'express'
import { postController } from '../../controllers/user/postController.ts'
import { postMiddlewares } from '../../middlewares/user/postMiddlewares.ts'
import { paginate } from '../../middlewares/helpers/pagination.ts'
import { setParamsId } from '../../middlewares/helpers/paramsId.ts'
import { commentMiddlewares } from '../../middlewares/user/commentMiddlewares.ts'
import { commentController } from '../../controllers/user/commentController.ts'
import { authMiddlewares } from '../../middlewares/auth/authMiddlewares.ts'
import { requiresRole } from '../../middlewares/helpers/role.ts'
import { rateLimiter } from '../../middlewares/helpers/rateLimiter.ts'

const router = Router()

//posts

router.post(
  '/add',
  rateLimiter(10, 60, 'addPost'),
  authMiddlewares.verifyAccessToken,
  postMiddlewares.add,
  postController.add
)

router.get(
  '/getAll',
  rateLimiter(60, 60, 'getPosts'),
  paginate,
  postController.readAll
)

router.get(
  '/find',
  rateLimiter(60, 60, 'findPost'),
  authMiddlewares.verifyAccessToken,
  paginate,
  postMiddlewares.find,
  postController.find
)

router.get(
  '/:postId',
  rateLimiter(60, 60, 'getPost'),
  authMiddlewares.verifyAccessToken,
  setParamsId(['postId']),
  postController.getById
)

router.patch(
  '/update/:postId',
  rateLimiter(10, 60, 'updatePost'),
  authMiddlewares.verifyAccessToken,
  setParamsId(['postId']),
  postMiddlewares.update,
  postController.update
)

router.delete(
  '/delete/:postId',
  rateLimiter(5, 60, 'deletePost'),
  authMiddlewares.verifyAccessToken,
  setParamsId(['postId']),
  postController.delete
)

//admin

//comments

router.post(
  '/:postId/comments/add',
  rateLimiter(10, 60, 'addComment'),
  authMiddlewares.verifyAccessToken,
  setParamsId(['postId']),
  commentMiddlewares.add,
  commentController.add
)

router.get(
  '/:postId/comments',
  rateLimiter(60, 60, 'getComments'),
  authMiddlewares.verifyAccessToken,
  paginate,
  setParamsId(['postId']),
  commentController.readAll
)

router.patch(
  '/:postId/comments/:commentId/update',
  rateLimiter(10, 60, 'updateComment'),

  authMiddlewares.verifyAccessToken,
  setParamsId(['postId', 'commentId']),
  commentMiddlewares.update,
  commentController.update
)

router.delete(
  '/:postId/comments/:commentId/delete',
  rateLimiter(5, 60, 'deleteComment'),

  setParamsId(['postId', 'commentId']),
  authMiddlewares.verifyAccessToken,
  commentController.delete
)

//admin

router.delete(
  '/:postId/comments/:commentId/delete/admin',
  rateLimiter(30, 60, 'deleteCommentAdmin'),
  authMiddlewares.verifyAccessToken,
  requiresRole('admin'),
  setParamsId(['postId', 'commentId']),
  commentController.deleteAsAdmin
)

//post_actions

router.patch(
  '/:postId/like',
  rateLimiter(30, 60, 'togglePostLike'),
  authMiddlewares.verifyAccessToken,
  setParamsId(['postId']),
  postController.toggleLike
)

router.patch(
  '/:postId/favorite',
  rateLimiter(30, 60, 'togglePostFavorite'),
  authMiddlewares.verifyAccessToken,
  setParamsId(['postId']),
  postController.toggleFavorite
)

export default router
