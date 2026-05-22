import express from "express";

import validate from "../middlewares/ValidationHandler.js";

import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AccessMiddleware from "../middlewares/AccessMiddleware.js";
import { handleDeleteHistory, handleGetHistory } from "../controllers/HistoryController.js";

const router = express.Router();

router.get("/get-history/:userId", handleGetHistory);
router.delete("/delete-history/:userId/:historyId", handleDeleteHistory);

export default router;
