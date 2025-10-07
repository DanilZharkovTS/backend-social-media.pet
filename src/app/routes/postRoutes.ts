import Router from 'express'
import { postController } from '../controllers/postController.ts'
import { postMiddlewares } from '../middlewares/postMiddlewares.ts'

const router = Router()

router.post('/add',postMiddlewares.add, postController.add)

export default router
