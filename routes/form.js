const express = require('express');
const router = express.Router();
const { contactForm, contactBlogAuthorForm } = require('../controllers/form');

// validators
const { validationResult } = require('../validators/index');
const { contactFormValidator } = require('../validators/form');

router.post('/contact', contactFormValidator, validationResult, contactForm);
router.post('/contact-blog-author', contactFormValidator, validationResult, contactBlogAuthorForm);

module.exports = router;