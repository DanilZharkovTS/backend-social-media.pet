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
  setParamsId,
  postMiddlewares.update,
  postController.update
)

router.delete(
  '/delete/:id',
  setParamsId,
  postMiddlewares.delete,
  postController.delete
)

router.get('/find', paginate, postMiddlewares.find, postController.find)

//comments

router.post(
  '/:id/comments/add',
  setParamsId,
  commentMiddlewares.add,
  commentController.add
)

export default router
