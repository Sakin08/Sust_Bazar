import React, { useState } from 'react';
import { createAccommodation } from '../services/accommodationService';
import { useNavigate } from 'react-router-dom';

export default function CreateAccommodation() {
  const [form, setForm] = useState({
    type: 'Seat',
    title: '',
    description: '',
    location: '',
    price: '',
    gender_preference: 'Any',
    facilities: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFacilities = (e) => setForm(prev => ({
    ...prev,
    facilities: e.target.value.split(',').map(s => s.trim())
  }));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (const key in form) {
        if (key === 'facilities') {
          formData.append(key, JSON.stringify(form.facilities));
        } else {
          formData.append(key, form[key]);
        }
      }
      imageFiles.forEach(file => formData.append('images', file));

      const res = await createAccommodation(formData, true);
      alert('Listing created');
      navigate(`/my-products`);
    } catch (error) {
      console.error(error);
      alert('Failed to create listing');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Post Accommodation</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow" encType="multipart/form-data">
        <div className="grid grid-cols-1 gap-3">
          <select name="type" value={form.type} onChange={handleChange} className="p-2 border rounded">
            <option value="Flat">Flat</option>
            <option value="Room">Room</option>
            <option value="Seat">Seat</option>
          </select>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title e.g. 1 seat in 2-room flat"
            className="p-2 border rounded"
            required
          />

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location (Sylhet, area)"
            className="p-2 border rounded"
            required
          />

          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price (monthly)"
            className="p-2 border rounded"
            required
            type="number"
            min="0"
          />

          <select
            name="gender_preference"
            value={form.gender_preference}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="Any">Any</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="p-2 border rounded"
          />

          <input
            name="facilities"
            onChange={handleFacilities}
            placeholder="Facilities comma separated e.g. WiFi,Gas"
            className="p-2 border rounded"
          />

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="p-2 border rounded"
          />

          <div className="flex space-x-2 mt-2 overflow-x-auto">
            {imagePreviews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`preview-${i}`}
                className="w-24 h-24 object-cover rounded"
                onLoad={() => URL.revokeObjectURL(src)}
              />
            ))}
          </div>

          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Post Listing</button>
        </div>
      </form>
    </div>
  );
}
