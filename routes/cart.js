import express from 'express'
import { getCart, addToCart, removeFromCart, clearCart, updateCartItem } from '../controllers/cartController.js'

const router = express.Router()

router.get('/', getCart)
router.post('/', addToCart)
router.delete('/:productId', removeFromCart)
router.delete('/', clearCart)
router.patch('/:productId', updateCartItem)

export default router
