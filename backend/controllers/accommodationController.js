import Accommodation from '../models/Accommodation.js';
import AccommodationBooking from '../models/AccommodationBooking.js';
import cloudinary from '../config/cloudinary.js';

// Helper to upload a file buffer to Cloudinary
function uploadFileToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}

// Create accommodation listing with image upload to Cloudinary
export const createAccommodation = async (req, res) => {
  try {
    const { type, title, description, location, price, gender_preference, facilities } = req.body;

    let facilitiesArray = [];
    if (facilities) {
      try {
        facilitiesArray = typeof facilities === 'string' ? JSON.parse(facilities) : facilities;
      } catch {
        facilitiesArray = typeof facilities === 'string' ? facilities.split(',').map(f => f.trim()) : facilities;
      }
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(req.files.map(file => uploadFileToCloudinary(file)));
    }

    const listing = await Accommodation.create({
      owner_id: req.user.id,
      type,
      title,
      description,
      location,
      price,
      gender_preference,
      facilities: facilitiesArray.length ? facilitiesArray.join(',') : null,
      images: imageUrls.length ? JSON.stringify(imageUrls) : null,
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error('Create Accommodation error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
};

// Add these missing exports:

// Get all available listings
export const getAccommodations = async (req, res) => {
  try {
    const listings = await Accommodation.findAll({
      where: { is_available: true },
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

// Get single listing by ID
export const getAccommodationById = async (req, res) => {
  try {
    const listing = await Accommodation.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
};

// Book accommodation
export const bookAccommodation = async (req, res) => {
  try {
    const { message } = req.body;
    const booking = await AccommodationBooking.create({
      accommodation_id: req.params.id,
      renter_id: req.user.id,
      message,
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to book accommodation' });
  }
};

// Update booking status (approve/reject)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await AccommodationBooking.findByPk(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    await booking.update({ status });

    if (status === 'approved') {
      await Accommodation.update({ is_available: false }, { where: { id: booking.accommodation_id } });
    }

    res.json({ message: `Booking ${status} successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
};
export const getMyAccommodations = async (req, res) => {
  try {
    if (!req.user) {
      console.error('No user in request!');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    console.log('Fetching accommodations for user:', userId);

    const accommodations = await Accommodation.findAll({
      where: { owner_id: userId },
      order: [['createdAt', 'DESC']],
    });

    res.json(accommodations);
  } catch (error) {
    console.error('Error fetching my accommodations:', error);
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
};