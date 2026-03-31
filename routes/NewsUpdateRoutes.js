import express from "express";

import validate from "../middlewares/ValidationHandler.js";

import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AccessMiddleware from "../middlewares/AccessMiddleware.js";
import { handleAddNews, handleDeleteNews, handleGetNews, handleUpdateNews } from "../controllers/NewsUpdateController.js";

const router = express.Router();

router.post("/add-news", AuthMiddleware, AccessMiddleware(["Admin"]), handleAddNews);

router.get("/get-news", handleGetNews);

router.patch("/:adminID/update-news/:newsID", AuthMiddleware, AccessMiddleware(["Admin"]), handleUpdateNews);
router.delete("/:adminID/delete-news/:newsID", AuthMiddleware, AccessMiddleware(["Admin"]), handleDeleteNews);

export default router;
