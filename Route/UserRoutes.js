const express = require('express');
const authController = require("../RouteController/authController")
const userController = require("../RouteController/UserController")

const router = express.Router();

router.route('/').get(userController.getAllUsers);

router.route('/signup').post(authController.signup);
router.route('/signup').post(authController.signup);

router.route('/login').post(authController.login);

router.route('/forgotpassword').post(authController.forgotPassword);

router.route('/resetpassword/:token').patch(authController.resetPassword);

router.route('/updatemypassword').patch(authController.protect, authController.updatePassword)

router.route('/updateme').patch(authController.protect, userController.updateMe)

router.route('/deleteme').delete(authController.protect, userController.deleteMe)

module.exports = router;