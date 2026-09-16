// Simple in-memory cart storage per session
const userCarts = new Map()

const getCartKey = (req) => {
  // Use a simple session identifier - in production, use proper session/auth
  return req.cookies.sessionId || 'anonymous'
}

export const getCart = (req, res) => {
  const key = getCartKey(req)
  const cart = userCarts.get(key) || []
  
  res.status(200).json({ success: true, data: cart })
}

export const addToCart = (req, res) => {
  try {
    const { product } = req.body
    
    if (!product || !product.id) {
      return res.status(400).json({ success: false, message: 'Invalid product data' })
    }

    const key = getCartKey(req)
    const cart = userCarts.get(key) || []
    
    // Check if product already in cart
    const existingProduct = cart.find((item) => item.id === product.id)
    
    if (existingProduct) {
      existingProduct.quantity = (existingProduct.quantity || 1) + (product.quantity || 1)
    } else {
      cart.push({ ...product, quantity: product.quantity || 1 })
    }
    
    userCarts.set(key, cart)
    
    res.status(200).json({ success: true, data: cart, message: 'Product added to cart' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const removeFromCart = (req, res) => {
  try {
    const { productId } = req.params
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' })
    }

    const key = getCartKey(req)
    let cart = userCarts.get(key) || []
    
    cart = cart.filter((item) => item.id !== productId)
    
    userCarts.set(key, cart)
    
    res.status(200).json({ success: true, data: cart, message: 'Product removed from cart' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const clearCart = (req, res) => {
  try {
    const key = getCartKey(req)
    userCarts.delete(key)
    
    res.status(200).json({ success: true, data: [], message: 'Cart cleared' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateCartItem = (req, res) => {
  try {
    const { productId } = req.params
    const { quantity } = req.body
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' })
    }

    const key = getCartKey(req)
    const cart = userCarts.get(key) || []
    
    const product = cart.find((item) => item.id === productId)
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not in cart' })
    }
    
    if (quantity <= 0) {
      const updatedCart = cart.filter((item) => item.id !== productId)
      userCarts.set(key, updatedCart)
      return res.status(200).json({ success: true, data: updatedCart, message: 'Product removed from cart' })
    }
    
    product.quantity = quantity
    userCarts.set(key, cart)
    
    res.status(200).json({ success: true, data: cart, message: 'Cart updated' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
