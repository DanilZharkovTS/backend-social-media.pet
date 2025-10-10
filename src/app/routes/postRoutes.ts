import Router from 'express'
import { postController } from '../controllers/postController.ts'
import { postMiddlewares } from '../middlewares/postMiddlewares.ts'
import { paginate } from '../middlewares/helpers/pagination.ts'
import { setParamsId } from '../middlewares/helpers/paramsId.ts'

const router = Router()

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

router.get('/find', postMiddlewares.find, postController.find)

export default router
