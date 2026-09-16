import { createUser, findUserByEmail, findUserById, updateUser, addToWishlist, removeFromWishlist, getWishlist } from '../models/User.js'
import { OAuth2Client } from 'google-auth-library'

// VITE_GOOGLE_CLIENT_ID is accepted here for existing local setups. Prefer
// GOOGLE_CLIENT_ID for the server-only configuration going forward.
const getGoogleClientId = () => process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID
const isConfiguredGoogleClientId = (clientId) => Boolean(
  clientId && !clientId.includes('your-google-oauth-client-id')
)

// Simple JWT-like token (in production use proper JWT library)
const generateToken = (userId) => {
  return Buffer.from(userId).toString('base64')
}

const verifyToken = (token) => {
  try {
    return Buffer.from(token, 'base64').toString('utf-8')
  } catch {
    return null
  }
}

export const register = (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    // Check if user exists
    if (findUserByEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email already in use' })
    }

    // Create user
    const user = createUser({ name, email, password })
    const token = generateToken(user.id)

    // Set token in cookie
    res.cookie('auth_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const login = (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' })
    }

    const user = findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found. Create an account first.' })
    }

    // Simple password check (in production use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const token = generateToken(user.id)
    res.cookie('auth_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body
    const googleClientId = getGoogleClientId()

    if (!credential || !isConfiguredGoogleClientId(googleClientId)) {
      return res.status(400).json({ success: false, message: 'Google sign-in is not configured' })
    }

    const ticket = await new OAuth2Client(googleClientId).verifyIdToken({
      idToken: credential,
      audience: googleClientId
    })
    const payload = ticket.getPayload()

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({ success: false, message: 'Google account could not be verified' })
    }

    let user = findUserByEmail(payload.email)
    if (!user) {
      user = createUser({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        googleId: payload.sub
      })
    } else if (!user.googleId) {
      user = updateUser(user.id, { googleId: payload.sub })
    }

    const token = generateToken(user.id)
    res.cookie('auth_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.status(200).json({
      success: true,
      message: 'Google sign-in successful',
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error) {
    res.status(401).json({ success: false, message: 'Google sign-in failed' })
  }
}

export const getGoogleConfig = (_req, res) => {
  const clientId = getGoogleClientId()
  res.status(200).json({
    success: true,
    clientId: isConfiguredGoogleClientId(clientId) ? clientId : null
  })
}

export const logout = (req, res) => {
  res.clearCookie('auth_token')
  res.status(200).json({ success: true, message: 'Logged out successfully' })
}

export const getProfile = (req, res) => {
  try {
    const token = req.cookies.auth_token
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    const userId = verifyToken(token)
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }

    const user = findUserById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        wishlist: user.wishlist,
        cart: user.cart
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const addToUserWishlist = (req, res) => {
  try {
    const token = req.cookies.auth_token
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    const userId = verifyToken(token)
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }

    const { product } = req.body
    const wishlist = addToWishlist(userId, product)

    res.status(200).json({ success: true, data: wishlist })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const removeFromUserWishlist = (req, res) => {
  try {
    const token = req.cookies.auth_token
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    const userId = verifyToken(token)
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }

    const { productId } = req.params
    const wishlist = removeFromWishlist(userId, productId)

    res.status(200).json({ success: true, data: wishlist })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getUserWishlist = (req, res) => {
  try {
    const token = req.cookies.auth_token
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    const userId = verifyToken(token)
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }

    const wishlist = getWishlist(userId)
    res.status(200).json({ success: true, data: wishlist })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
