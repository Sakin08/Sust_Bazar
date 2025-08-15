import { Op } from 'sequelize';
import { BookLend, User } from '../models/index.js';

export const createBook = async (req, res) => {
  try {
    const lender_id = req.user.id;
    const { title, author, description, cover_image } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const book = await BookLend.create({ title, author, description, cover_image, lender_id });
    const withUsers = await BookLend.findByPk(book.id, {
      include: [
        { model: User, as: 'lender', attributes: ['id','name','email','profile_image'] },
        { model: User, as: 'borrower', attributes: ['id','name','email','profile_image'] },
      ],
    });
    res.json(withUsers);
  } catch (err) {
    console.error('createBook error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listBooks = async (req, res) => {
  try {
    const { q, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { author: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }
    const rows = await BookLend.findAll({
      where,
      include: [
        { model: User, as: 'lender', attributes: ['id','name','email','profile_image'] },
        { model: User, as: 'borrower', attributes: ['id','name','email','profile_image'] },
      ],
      order: [['updated_at', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('listBooks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await BookLend.findByPk(id, {
      include: [
        { model: User, as: 'lender', attributes: ['id','name','email','profile_image'] },
        { model: User, as: 'borrower', attributes: ['id','name','email','profile_image'] },
      ],
    });
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error('getBookById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await BookLend.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    if (row.lender_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const { title, author, description, cover_image } = req.body;
    await row.update({ title, author, description, cover_image });
    res.json(row);
  } catch (err) {
    console.error('updateBook error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const borrowBook = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await BookLend.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    if (row.status === 'borrowed') return res.status(400).json({ message: 'Already borrowed' });
    if (row.lender_id === req.user.id) return res.status(400).json({ message: 'You are the lender' });

    await row.update({ status: 'borrowed', borrower_id: req.user.id });
    res.json(row);
  } catch (err) {
    console.error('borrowBook error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await BookLend.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });

    // Only lender or current borrower can mark returned
    if (row.lender_id !== req.user.id && row.borrower_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await row.update({ status: 'available', borrower_id: null });
    res.json(row);
  } catch (err) {
    console.error('returnBook error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await BookLend.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    if (row.lender_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await row.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('deleteBook error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
