import Event from '../models/Event.js';
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';

export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll({
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }],
      order: [['event_date', 'ASC']],
    });
    res.json(events);
  } catch (err) {
    console.error('getEvents error:', err);
    next(err);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, event_date, created_by } = req.body;

    let media_url = null;
    if (req.file) {
      media_url = `uploads/${req.file.filename}`;
    }

    const newEvent = await Event.create({ title, description, event_date, created_by, media_url });

    const eventWithCreator = await Event.findByPk(newEvent.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }],
    });

    res.status(201).json(eventWithCreator);
  } catch (err) {
    console.error('createEvent error:', err);
    next(err);
  }
};
