import { Like, Comment, Share, Notification, CommunityPost } from "../models/index.js";

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const existing = await Like.findOne({ where: { postId, userId: req.user.id } });
    if (existing) return res.status(400).json({ message: "Already liked" });

    const like = await Like.create({ postId, userId: req.user.id });

    const post = await CommunityPost.findByPk(postId);
    if (post.userId !== req.user.id) {
      await Notification.create({ type: "like", message: `${req.user.name} liked your post`, userId: post.userId, senderId: req.user.id });
    }

    res.json(like);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const comment = await Comment.create({ content, postId, userId: req.user.id });

    const post = await CommunityPost.findByPk(postId);
    if (post.userId !== req.user.id) {
      await Notification.create({ type: "comment", message: `${req.user.name} commented on your post`, userId: post.userId, senderId: req.user.id });
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const share = await Share.create({ postId, userId: req.user.id });

    const post = await CommunityPost.findByPk(postId);
    if (post.userId !== req.user.id) {
      await Notification.create({ type: "share", message: `${req.user.name} shared your post`, userId: post.userId, senderId: req.user.id });
    }

    res.status(201).json(share);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({ where: { userId: req.user.id }, order: [["createdAt", "DESC"]] });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
