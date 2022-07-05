const express = require('express');
const BlogsController = require("../RouteController/blogController");
const authController = require("../RouteController/authController")
const router = express.Router();
router.route('/').get( authController.protect, BlogsController.getAllBlogs);

router.route('/:id').get(authController.restrictTo('admin'), BlogsController.getBlogs).patch(BlogsController.updateBlogs).delete(authController.protect, BlogsController.deleteBlogs)

module.exports = router; 