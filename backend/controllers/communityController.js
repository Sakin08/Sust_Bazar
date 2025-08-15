import { CommunityPost, User } from "../models/index.js";
import { Op } from "sequelize";
import multer from "multer";
import path from "path";

// multer configuration for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
}).array("images", 5); // Max 5 images

// GET all posts with optional search and category filter
export const getAllCommunityPosts = async (req, res) => {
  try {
    console.log("Received query:", req.query);
    const { search, category } = req.query;

    let whereClause = {};

    // Add search condition if search query exists
    if (search) {
      whereClause = {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // Add category condition if category is specified and not 'All'
    if (category && category !== "All") {
      whereClause.category = category;
    }

    console.log("Using where clause:", whereClause);

    const posts = await CommunityPost.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "profile_image"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log(`Found ${posts.length} posts`);
    return res.json(posts);
  } catch (error) {
    console.error("Error in getAllCommunityPosts:", error);
    return res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

// GET post by ID
export const getCommunityPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email", "phone", "profile_image"],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Error fetching post details" });
  }
};

// POST create new
export const createCommunityPost = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const imageFiles = req.files.map((file) => file.filename);

      const post = await CommunityPost.create({
        ...req.body,
        images: imageFiles,
        userId: req.user.id,
        tags: JSON.parse(req.body.tags || "[]"),
      });

      const postWithAuthor = await CommunityPost.findByPk(post.id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "profile_image"],
          },
        ],
      });

      res.status(201).json(postWithAuthor);
    });
  } catch (error) {
    console.error("Error in createCommunityPost:", error);
    res.status(500).json({
      message: "Error creating post",
      error: error.message,
    });
  }
};

// DELETE post
export const deleteCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.destroy();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCommunityPost:", error);
    res.status(500).json({
      message: "Error deleting post",
      error: error.message,
    });
  }
};
