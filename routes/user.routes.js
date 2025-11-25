import express from 'express';
import {
  signup,
  login,
  protect,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
  updateProfile
} from '../controllers/auth.controller.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.patch('/reset-password/:token', resetPassword);

// Protected routes (require authentication)
router.use(protect);

// User profile routes
router.route('/me')
  .get((req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'fail',
          message: 'You are not logged in. Please log in to get access.'
        });
      }

      // Remove sensitive data
      const user = { ...req.user._doc };
      delete user.password;
      delete user.passwordChangedAt;
      delete user.passwordResetToken;
      delete user.passwordResetExpires;

      res.status(200).json({
        status: 'success',
        data: {
          user: user
        }
      });
    } catch (error) {
      console.error('Error in /me route:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching user data'
      });
    }
  })
  .patch(updateProfile);

// Logout route
router.get('/logout', logout);

export default router;
