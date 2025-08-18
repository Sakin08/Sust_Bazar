import { CommunityPost, Comment, Like, Share, Notification, User } from "../models/index.js";

// -------------------- Fetch Community Posts --------------------
export const fetchCommunityPosts = async (req, res) => {
  try {
    const { search = "", category = "All" } = req.query;

    const whereClause = {};
    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }
    if (category && category !== "All") {
      whereClause.category = category;
    }

  const posts = await CommunityPost.findAll({
  where: whereClause,
  include: [
    { model: User, as: "author", attributes: ["id", "name", "profile_image"] }, // <-- added profile_image
    { model: Comment, as: "comments", include: [{ model: User, as: "author", attributes: ["id","name","profile_image"] }] }, // optional: include author pic for comments
    { model: Like, as: "likes" },
    { model: Share, as: "shares" },
  ],
  order: [["createdAt", "DESC"]],
});


    res.json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// -------------------- Create Community Post --------------------
//import { CommunityPost, User, Notification } from "../models/index.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

export const createCommunityPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, category, tags } = req.body;

    // Upload images to Cloudinary
    const imageFiles = req.files || [];
    const imageUrls = await Promise.all(
      imageFiles.map((file) => uploadBufferToCloudinary(file.buffer, "community"))
    );

    const post = await CommunityPost.create({
      title,
      description,
      category,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      images: imageUrls.map((img) => img.secure_url),
      userId,
    });

    const postWithAuthor = await CommunityPost.findByPk(post.id, {
      include: [{ model: User, as: "author", attributes: ["id", "name","profile_image"] }],
    });

    req.app.get("io")?.emit("newPost", postWithAuthor);

    res.status(201).json(postWithAuthor);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// -------------------- Like a Post --------------------
export const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const post = await CommunityPost.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existingLike = await Like.findOne({ where: { userId, postId } });
    if (existingLike) return res.status(400).json({ message: "Already liked" });

    const like = await Like.create({ userId, postId });

    if (post.userId !== userId) {
      await Notification.create({
        type: "like",
        message: `${req.user.name} liked your post`,
        userId: post.userId,
        senderId: userId,
      });
    }

    req.app.get("io")?.emit("postLiked", { postId, userId });

    res.status(201).json(like);
  } catch (err) {
    console.error("Like post error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// -------------------- Share a Post --------------------
export const sharePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const post = await CommunityPost.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const share = await Share.create({ userId, postId });

    if (post.userId !== userId) {
      await Notification.create({
        type: "share",
        message: `${req.user.name} shared your post`,
        userId: post.userId,
        senderId: userId,
      });
    }

    req.app.get("io")?.emit("postShared", { postId, userId });

    res.status(201).json(share);
  } catch (err) {
    console.error("Share post error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// -------------------- Add Comment --------------------
export const addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;
    const { content } = req.body;

    const post = await CommunityPost.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({ content, userId, postId });

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
    });

    if (post.userId !== userId) {
      await Notification.create({
        type: "comment",
        message: `${req.user.name} commented on your post`,
        userId: post.userId,
        senderId: userId,
      });
    }

    req.app.get("io")?.emit("newComment", { postId, comment: commentWithAuthor });

    res.status(201).json(commentWithAuthor);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// -------------------- Delete Post --------------------
export const deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const post = await CommunityPost.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.destroy();

    req.app.get("io")?.emit("postDeleted", { postId });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



// -------------------- Get User Notifications --------------------
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { userId },
      include: [
        { model: User, as: "sender", attributes: ["id", "name"] }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(notifications);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// -------------------- Mark Notification as Read --------------------
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.notificationId;

    const notification = await Notification.findOne({ where: { id: notificationId, userId } });
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// -------------------- Toggle Like --------------------
export const toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await CommunityPost.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if user already liked this post
    const existingLike = await Like.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      // If already liked → remove like
      await existingLike.destroy();

      req.app.get("io")?.emit("postUnliked", { postId, userId });

      return res.json({
        success: true,
        message: "Unliked",
        liked: false,
      });
    } else {
      // If not liked → create like
      await Like.create({ postId, userId });

      if (post.userId !== userId) {
        await Notification.create({
          type: "like",
          message: `${req.user.name} liked your post`,
          userId: post.userId,
          senderId: userId,
        });
      }

      req.app.get("io")?.emit("postLiked", { postId, userId });

      return res.json({
        success: true,
        message: "Liked",
        liked: true,
      });
    }
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
