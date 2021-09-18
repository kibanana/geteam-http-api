import passport from 'passport'
import express from 'express'
import * as controller from '@controllers/auth'

const router = express.Router()
export default router

router.post('/sign-up', controller.Create)
router.post('/compare-email', controller.CompareEmail)
router.post('/verify', controller.CompareVerifyKey)
router.post('/verify/new', controller.SetVerifyKey)
router.post('/sign-in', controller.SignIn) // Access Token, Refresh Token 발급

// Refresh Token을 이용(DB에서 Get)하여 Access Token 재발급 (실패시 false, /signin으로 redirect)
// Access Token이 만료되었을 것이므로 passport는 사용할 수 없음
router.post('/refresh-token', controller.RefreshToken)

router.post('/verify-token', controller.VerifyToken)
router.post('/check-email', controller.CheckIsDuplicatedEmail)
router.post('/check-snum', controller.CheckIsDuplicatedSnum)

// Reset Password (Check Interests, Create Hash)
router.patch('/password/reset', controller.ResetPassword)

router.use(passport.authenticate('jwt'))

router.post('/sign-out', controller.SignOut) // Blacklisting Token, Set null RefreshToken in DB. 정상적인 Access Token이 있어야 Signout이 진행된다.

router.get('/info', controller.GetInfo)

router.patch('/password', controller.UpdatePassword)
router.patch('/info', controller.UpdateInfo)
router.patch('/notifications', controller.UpdateNotifications)

router.delete('/', controller.Delete)