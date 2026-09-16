import express from 'express'
import {
  register,
  login,
  googleLogin,
  getGoogleConfig,
  logout,
  getProfile,
  addToUserWishlist,
  removeFromUserWishlist,
  getUserWishlist
} from '../controllers/authController.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/google-config', getGoogleConfig)
router.post('/google', googleLogin)
router.post('/logout', logout)
router.get('/profile', getProfile)
router.post('/wishlist', addToUserWishlist)
router.delete('/wishlist/:productId', removeFromUserWishlist)
router.get('/wishlist', getUserWishlist)

export default router
