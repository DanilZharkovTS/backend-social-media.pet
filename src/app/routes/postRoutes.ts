import Router from 'express'
import { postController } from '../controllers/postController.ts'
import { postMiddlewares } from '../middlewares/postMiddlewares.ts'
import { paginate } from '../middlewares/helpers/pagination.ts'
import { setParamsId } from '../middlewares/helpers/paramsId.ts'
import { commentMiddlewares } from '../middlewares/commentMiddlewares.ts'
import { commentController } from '../controllers/commentController.ts'

const router = Router()

//posts

router.post('/add', postMiddlewares.add, postController.add)

router.get('/getAll', paginate, postController.readAll)

router.patch(
  '/update/:id',
  setParamsId('id'),
  postMiddlewares.update,
  postController.update
)

router.delete(
  '/delete/:id',
  setParamsId('id'),
  postMiddlewares.delete,
  postController.delete
)

router.get('/find', paginate, postMiddlewares.find, postController.find)

//comments

router.post(
  '/:postId/comments/add',
  setParamsId('postId'),
  commentMiddlewares.add,
  commentController.add
)

router.get(
  '/:postId/comments',
  paginate,
  setParamsId('postId'),
  commentController.readAll
)

router.patch(
  '/:postId/comments/:commentId/update',
  setParamsId('postId', 'commentId'),
  commentMiddlewares.update,
  commentController.update
)

router.delete(
  '/:postId/comments/:commentId/delete',
  setParamsId('postId', 'commentId'),
  commentMiddlewares.delete,
  commentController.delete
)

export default router
