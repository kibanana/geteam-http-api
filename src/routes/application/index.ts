
import passport from 'passport'
import express from 'express'
import * as controller from '@controllers/application'

const router = express.Router()
export default router

router.use(passport.authenticate('jwt'))

router.get('/', controller.GetList)
router.get('/:id', controller.GetListOnMyParticularBoard)

router.post('/', controller.Create)

router.patch('/:id/:applicationid/accept', controller.UpdateAccept)

router.delete('/:id/:applicationid', controller.Delete)
