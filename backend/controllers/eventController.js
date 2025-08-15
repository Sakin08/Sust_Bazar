import Event from '../models/Event.js';
import User from '../models/User.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js'; // your upload function
import fs from 'fs';

// GET all events
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll({
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'profile_image'], // profile_image already stored as Cloudinary URL
      }],
      order: [['event_date', 'ASC']],
    });

    // Ensure event media is full Cloudinary URL
    const eventsWithMedia = events.map(ev => ({
      ...ev.toJSON(),
      media_url: ev.media_url ? ev.media_url : null
    }));

    res.json(eventsWithMedia);
  } catch (err) {
    console.error('getEvents error:', err);
    next(err);
  }
};

// CREATE event
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, event_date, created_by } = req.body;

    let media_url = null;
    if (req.file) {
      // Read file buffer and upload to Cloudinary
      const buffer = fs.readFileSync(req.file.path);
      const result = await uploadBufferToCloudinary(buffer, 'events'); // folder: 'events'
      media_url = result.secure_url; // full Cloudinary URL
      fs.unlinkSync(req.file.path); // delete local file
    }

    const newEvent = await Event.create({ title, description, event_date, created_by, media_url });

    const eventWithCreator = await Event.findByPk(newEvent.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'profile_image'], // Cloudinary URL for profile
      }],
    });

    res.status(201).json(eventWithCreator);
  } catch (err) {
    console.error('createEvent error:', err);
    next(err);
  }
};
