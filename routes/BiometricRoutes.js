import express from "express";

import validate from "../middlewares/ValidationHandler.js";

import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AccessMiddleware from "../middlewares/AccessMiddleware.js";
import { handleCreateBiometric, handleCreateNonce, handleDeleteBiometric, handleVerifyNonce } from "../controllers/BiometricController.js";

const router = express.Router();

router.post("/register-biometric/:userId", AuthMiddleware, AccessMiddleware(["User"]), handleCreateBiometric);
router.delete("/delete-biometric/:userId", AuthMiddleware, AccessMiddleware(["User"]), handleDeleteBiometric);
router.post("/create-nonce", handleCreateNonce);
router.post("/verify-user", handleVerifyNonce);

export default router;
