import Accommodation from '../models/Accommodation.js';
import AccommodationBooking from '../models/AccommodationBooking.js';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js'; // Added import for User

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
      userId: req.user.id, // Changed from owner_id to userId
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
    res.status(500).json({ error: 'Failed to create listing', details: error.message });
  }
};

// Get all available listings
export const getAccommodations = async (req, res) => {
  try {
    const listings = await Accommodation.findAll({
      where: { is_available: true },
      include: [{ model: User, as: 'owner', attributes: ["id", "name", "phone"] }],
    });
    res.json(listings);
  } catch (error) {
    console.error('Get Accommodations error:', error);
    res.status(500).json({ error: 'Failed to fetch listings', details: error.message });
  }
};

// Get single listing by ID
export const getAccommodationById = async (req, res) => {
  try {
    const listing = await Accommodation.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "department",
            "season",
            "profile_image",
          ],
        },
      ],
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    console.error('Get Accommodation by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch listing', details: error.message });
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
    console.error('Book Accommodation error:', error);
    res.status(500).json({ error: 'Failed to book accommodation', details: error.message });
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
    console.error('Update Booking Status error:', error);
    res.status(500).json({ error: 'Failed to update booking', details: error.message });
  }
};

// Get my accommodations
export const getMyAccommodations = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const userId = req.user.id;

    const accommodations = await Accommodation.findAll({
      where: { userId: userId }, // Changed from owner_id to userId
      include: [{ model: User, as: 'owner', attributes: ["id", "name", "phone"] }],
      logging: console.log, // Log SQL query for debugging
    });

    res.json(accommodations);
  } catch (error) {
    console.error('getMyAccommodations server error:', error);
    res.status(500).json({ message: 'Failed to get accommodations due to a server error.', details: error.message });
  }
};



// Delete accommodation
export const deleteAccommodation = async (req, res) => {
  try {
    const accommodationId = req.params.id;
    const userId = req.user.id;

    // Find the accommodation
    const accommodation = await Accommodation.findByPk(accommodationId);
    if (!accommodation) return res.status(404).json({ message: 'Accommodation not found' });

    // Only owner can delete
    if (accommodation.userId !== userId) {
      return res.status(403).json({ message: 'You are not allowed to delete this accommodation' });
    }

    // Optional: Delete associated images from Cloudinary
    if (accommodation.images) {
      const imageUrls = JSON.parse(accommodation.images);
      for (const url of imageUrls) {
        const publicId = url.split('/').pop().split('.')[0]; // crude extraction
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await accommodation.destroy();
    res.json({ message: 'Accommodation deleted successfully' });
  } catch (error) {
    console.error('Delete Accommodation error:', error);
    res.status(500).json({ message: 'Failed to delete accommodation', details: error.message });
  }
};
