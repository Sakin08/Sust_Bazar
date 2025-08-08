import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, User, Calendar } from 'lucide-react';

const ProductCard = ({ product }) => {
  console.log('=== PRODUCT CARD DEBUG ===');
  console.log('Full product object:', product);
  console.log('Product ID:', product.id);
  console.log('Product title:', product.title);
  console.log('Raw image_urls:', product.image_urls);
  console.log('Type of image_urls:', typeof product.image_urls);
  console.log('Array check:', Array.isArray(product.image_urls));

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-BD');
  };

  const getImageUrl = (imageUrls) => {
    console.log('--- getImageUrl function ---');
    console.log('Input imageUrls:', imageUrls);
    console.log('Input type:', typeof imageUrls);
    console.log('Is array:', Array.isArray(imageUrls));
    console.log('Is null/undefined:', imageUrls == null);
    
    // Handle different data structures for images
    let imageUrl = null;
    
    if (!imageUrls) {
      console.log('No image URLs provided, using fallback');
      return `https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400`;
    }
    
    if (typeof imageUrls === 'string') {
      console.log('imageUrls is string, attempting to parse...');
      // If it's a string, it might be a JSON string or single URL
      try {
        const parsed = JSON.parse(imageUrls);
        console.log('Successfully parsed JSON:', parsed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          imageUrl = parsed[0];
          console.log('Using first URL from parsed array:', imageUrl);
        } else {
          console.log('Parsed result is not a valid array');
        }
      } catch (error) {
        // If parsing fails, treat it as a single URL
        console.log('JSON parsing failed, treating as single URL:', imageUrls);
        console.log('Parse error:', error.message);
        imageUrl = imageUrls;
      }
    } else if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      // If it's already an array
      console.log('imageUrls is already an array with', imageUrls.length, 'items');
      imageUrl = imageUrls[0];
      console.log('Using first URL from array:', imageUrl);
    } else {
      console.log('imageUrls format not recognized:', typeof imageUrls, imageUrls);
    }
    
    // If we have an imageUrl, check if it's a valid URL
    if (imageUrl) {
      console.log('Final imageUrl before return:', imageUrl);
      
      // Check if it's already a complete URL (Cloudinary, etc.)
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('URL is complete, returning as-is');
        return imageUrl;
      }
      
      // If it's a relative path, construct full URL
      const fullUrl = imageUrl.startsWith('/') 
        ? `http://localhost:3001${imageUrl}` 
        : `http://localhost:3001/${imageUrl}`;
      console.log('Constructed full URL:', fullUrl);
      return fullUrl;
    }
    
    // Fallback image
    console.log('No valid imageUrl found, using fallback');
    return `https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400`;
  };

  const handleImageError = (e) => {
    console.log('=== IMAGE ERROR ===');
    console.log('Failed to load image:', e.target.src);
    console.log('Error event:', e);
    
    // Set fallback image
    e.target.src = `https://images.pexels.com/photos/3740393/pexels-photo-3740393.jpeg?auto=compress&cs=tinysrgb&w=400`;
  };

  const handleImageLoad = (e) => {
    console.log('=== IMAGE SUCCESS ===');
    console.log('Successfully loaded image:', e.target.src);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product.id}`}>
        <div className="relative">
          <img
            src={getImageUrl(product.image_urls)}
            alt={product.title}
            className="w-full h-48 object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
          {product.is_sold && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              SOLD
            </div>
          )}
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            {product.category}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>{product.seller?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(product.created_at)}</span>
          </div>
        </div>
        
        <Link
          to={`/product/${product.id}`}
          className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block text-sm font-medium"
        >
          <MessageCircle className="inline h-4 w-4 mr-2" />
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;