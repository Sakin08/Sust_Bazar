import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getAllCommunityPosts,
  createCommunityPost,
  getCommunityPostById,
  deleteCommunityPost,
} from "../controllers/communityController.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`Community Route: ${req.method} ${req.url}`);
  next();
});

router.get("/", getAllCommunityPosts); // Keep this as the first route
router.post("/", authenticate, createCommunityPost);
router.get("/:id", getCommunityPostById);
router.delete("/:id", authenticate, deleteCommunityPost);

export default router;
