import express from "express";
import {
  createCommunityPost,
  fetchCommunityPosts,
  deletePost,
  sharePost,
  addComment,
  getNotifications,
  markNotificationRead,
  toggleLikePost,
} from "../controllers/communityController.js";

import { authenticate } from "../middleware/auth.js";
import { uploadMemory } from "../middleware/multer.js"; // <- import memory upload

const router = express.Router();

// Community posts
router.get("/", authenticate, fetchCommunityPosts);
router.post("/", authenticate, uploadMemory.array("images"), createCommunityPost); // <- use multer
router.delete("/:postId", authenticate, deletePost);

// Actions
router.post("/:postId/like", authenticate, toggleLikePost);
router.post("/:postId/share", authenticate, sharePost);
router.post("/:postId/comment", authenticate, addComment);

// Notifications
router.get("/notifications", authenticate, getNotifications);
router.post("/notifications/:id/read", authenticate, markNotificationRead);

export default router;
