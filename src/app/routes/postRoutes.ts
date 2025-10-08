import Router from 'express'
import { postController } from '../controllers/postController.ts'
import { postMiddlewares } from '../middlewares/postMiddlewares.ts'
import { paginate } from '../middlewares/pagination.ts'

const router = Router()

router.post('/add', postMiddlewares.add, postController.add)

router.get('/getAll', paginate, postController.getAll)

export default router
