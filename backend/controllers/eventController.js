import Event from '../models/Event.js';
import User from '../models/User.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// GET all events
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll({
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email', 'profile_image'] }],
      order: [['event_date', 'ASC']],
    });
    const upcoming = events.filter(ev => new Date(ev.event_date) > new Date());
    res.json(upcoming.map(ev => ({ ...ev.toJSON() })));
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// CREATE event
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, event_date, created_by } = req.body;
    let media_url = null;

    if (req.file) {
      const buffer = fs.readFileSync(req.file.path);
      const result = await uploadBufferToCloudinary(buffer, 'events');
      media_url = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const newEvent = await Event.create({ title, description, event_date, created_by, media_url });

    const eventWithCreator = await Event.findByPk(newEvent.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email', 'profile_image'] }],
    });

    res.status(201).json(eventWithCreator);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// DELETE event
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Only creator or admin
    if (req.user.id !== event.created_by && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete Cloudinary media
    if (event.media_url) {
      const publicId = event.media_url.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`events/${publicId}`);
    }

    await event.destroy();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
