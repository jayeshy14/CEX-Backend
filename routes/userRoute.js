// userRoute.js
const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.post("/login", userController.loginUser);

router.post('/google-login', userController.googleLogin);

// router
//   .route("/trades")
//   .get(userController.getTradeHistory);

router.get("/profile", userController.getUserProfile);

// Forgot Password Route (Send email with reset token)
router.post('/forgot-password', userController.forgotPassword);

// Reset Password Route (Change password using token)
router.post('/reset-password/:token', userController.resetPassword);

module.exports = router;
