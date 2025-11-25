import express from 'express';
import { body } from 'express-validator';
import { submitContactForm } from '../controllers/contact.controller.js';

const router = express.Router();


// Contact form submission
router.post(
  '/contact',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ min: 10 })
      .withMessage('Message must be at least 10 characters long'),
  ],
  submitContactForm
);

export default router;
 