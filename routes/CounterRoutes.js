import express from "express";

import validate from "../middlewares/ValidationHandler.js";

import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AccessMiddleware from "../middlewares/AccessMiddleware.js";
import { handleGetRealtimeCounter, handleRealtimeCounter, handleResetRealtimeCounter } from "../controllers/CounterController.js";

const router = express.Router();

// router.patch("/update-seq/:userId", handleRealtimeCounter);
router.patch("/update-seq/:userId", AuthMiddleware, AccessMiddleware(["Admin", "User"]), handleRealtimeCounter);

router.get("/get-seq", handleGetRealtimeCounter);
router.patch("/reset-seq", AuthMiddleware, AccessMiddleware(["Admin"]), handleResetRealtimeCounter);

export default router;
