import express from "express"
import { getUsers, getUser, updateUser, deleteUser, savePost, getNotificationNumber } from "../controllers/user.controller.js"
import { verifyToken } from "../middleware/verifyToken.js"

const router = express.Router()

router.get("/user", getUsers)
router.get("/:id", verifyToken, getUser)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)
router.post("/save", verifyToken, savePost)
router.get("/notification", verifyToken, getNotificationNumber)

export default router
