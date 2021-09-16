import express from 'express'
import * as controller from '@controllers/count'

const router = express.Router()
export default router

router.get('/', controller.GetCount)
