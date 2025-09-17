import express from 'express'
import { usersController } from '../controllers/usersController.js'

const router = express.Router()

router.get('/check-email', usersController.checkEmail)
router.get('/check-username', usersController.checkUsername)
router.get('/check-phone', usersController.checkPhone)

export const usersRoutes = router
