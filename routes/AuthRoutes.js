import express from "express";
import { login, logout, refreshToken, register, forgetPassword, verifyOtp, changePassword, HandleGetProfile, HandleUpdateProfile, handleGetUser, handleVerifyDeleteAccount, handleDeleteAccount } from "../controllers/AuthController.js";
import validate from "../middlewares/ValidationHandler.js";
import { loginSchema, adminSchema, userSchema } from "../validations/AuthValidations.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AccessMiddleware from "../middlewares/AccessMiddleware.js";
import { CreateUploadMiddleware } from "../middlewares/MulterMiddleware.js";

const router = express.Router();

router.post("/register", validate(userSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", refreshToken);

router.post("/logout", logout);

router.patch("/forget-password", forgetPassword);

router.patch("/verify-otp", verifyOtp);

router.patch("/change-password", changePassword);

router.get("/profile/:id", HandleGetProfile);

router.patch("/update-profile/:id", AuthMiddleware, AccessMiddleware(["Admin", "User"]), HandleUpdateProfile);

router.post("/:userId/verify-delete-account", AuthMiddleware, AccessMiddleware(["Admin", "User"]), handleVerifyDeleteAccount);

router.delete("/:userId/delete-account", handleDeleteAccount);

// router.get("/get-users", AuthMiddleware, AccessMiddleware(["Admin"]), handleGetUser);
router.get("/get-users", handleGetUser);

export default router;
