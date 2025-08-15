import { Op } from 'sequelize';
import { LostFound, User } from '../models/index.js';

export const createLostFound = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, category, type, location, image_urls, contact_info } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ message: 'title, description, and type are required' });
    }

    const post = await LostFound.create({
      title,
      description,
      category,
      type,
      location,
      image_urls,     // array or []
      contact_info,
      posted_by: userId,
    });
    const withUser = await LostFound.findByPk(post.id, {
      include: [{ model: User, as: 'poster', attributes: ['id','name','email','profile_image'] }],
    });
    res.json(withUser);
  } catch (err) {
    console.error('createLostFound error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLostFoundList = async (req, res) => {
  try {
    const { q, type, category } = req.query;
    const where = {};
    if (type) where.type = type;                   // 'lost' | 'found'
    if (category) where.category = category;

    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { location: { [Op.like]: `%${q}%` } },
      ];
    }

    const rows = await LostFound.findAll({
      where,
      include: [{ model: User, as: 'poster', attributes: ['id','name','email','profile_image'] }],
      order: [['updated_at', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('getLostFoundList error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLostFoundById = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await LostFound.findByPk(id, {
      include: [{ model: User, as: 'poster', attributes: ['id','name','email','profile_image'] }],
    });
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error('getLostFoundById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLostFound = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await LostFound.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    if (row.posted_by !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const { title, description, category, type, location, image_urls, contact_info } = req.body;
    await row.update({ title, description, category, type, location, image_urls, contact_info });
    res.json(row);
  } catch (err) {
    console.error('updateLostFound error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteLostFound = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await LostFound.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    if (row.posted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await row.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('deleteLostFound error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
