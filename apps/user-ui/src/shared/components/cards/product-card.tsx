import Link from 'next/link';
import React, { useState } from 'react';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import ProductDetailsCard from './product-details';
import useStore from '../../../store'; 

const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  // All Zustand store functions
  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  // Check if product is in wishlist or cart
  const isWishlisted = wishlist.some((item: any) => item.id === product.id);
  const isInCart = cart.some((item: any) => item.id === product.id);

  
  const handleAddToWishlist = () => {
    const user = null; // Replace with actual user data
    const location = 'current-location'; // Replace with actual location
    const deviceInfo = 'device-info'; // Replace with actual device info
    
    if (isWishlisted) {
      removeFromWishlist(product.id, user, location, deviceInfo);
    } else {
      addToWishlist(product, user, location, deviceInfo);
    }
  };

  const handleAddToCart = () => {
    const user = null; 
    const location = 'current-location'; 
    const deviceInfo = 'device-info'; 
    
    addToCart(product, user, location, deviceInfo);
  };

  return (
    <div className="w-full min-h-[350px] h-max bg-white rounded-lg relative shadow-sm hover:shadow-md transition-shadow">
      {isEvent && (
        <div className="absolute top-2 left-2 bg-red-600 text-white p-1 rounded text-[10px] font-semibold px-2 shadow-md z-10">
          OFFER
        </div>
      )}
      {product?.stock <= 5 && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-sm font-bold py-1 px-3 rounded-full shadow-lg z-10">
          Limited Stock
        </div>
      )}

      {/* Wishlist, View & Cart Icons */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
        <button 
          className={`p-2 rounded-full shadow-md hover:bg-gray-100 focus:outline-none transition-colors ${
            isWishlisted ? 'bg-red-50' : 'bg-white'
          }`}
          onClick={handleAddToWishlist}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart 
            className="text-red-600" 
            size={20} 
            fill={isWishlisted ? "red" : "none"}
           // onClick={isWishlisted ? removeFromWishlist (product.id,user,location,deviceInfo): addToWishlist({...product,quantity: 1}, user ,location, deviceInfo)} 
            stroke="red" 
          />
        </button>
        <button 
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none"
          onClick={() => setOpen(!open)}
          title="Quick view"
        >
          <Eye className="text-gray-800" size={20} />
        </button>
        <button 
          className={`p-2 rounded-full shadow-md hover:bg-gray-100 focus:outline-none transition-colors ${
            isInCart ? 'bg-green-50' : 'bg-white'
          }`}
          onClick={handleAddToCart}
          title={isInCart ? 'Already in cart - Add more' : 'Add to cart'}
        >
          <ShoppingCart 
            className={isInCart ? 'text-green-600' : 'text-gray-800'} 
            size={20} 
            fill={isInCart ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      <Link href={`/product/${product?.slug}`}>
        <div className="cursor-pointer">
          <img
            src={product?.images?.[0]?.url || 'https://picsum.photos/300/300'}
            alt={product?.title || 'Product image'}
            width={300}
            height={300}
            className="w-full h-[200px] object-cover mx-auto rounded-t-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://picsum.photos/300/300';
            }}
          />

          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
              {product?.title || 'Untitled Product'}
            </h3>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product?.short_description || 'No description available'}
            </p>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">
                  ${product?.sale_price || 0}
                </span>
                {product?.regular_price &&
                  product?.regular_price > product?.sale_price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product?.regular_price}
                    </span>
                  )}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm text-gray-600">
                  {product?.ratings || 5}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Stock: {product?.stock || 0}</span>
              <span>{product?.category || 'Uncategorized'}</span>
            </div>
            
            {/* Cart status indicator */}
            {isInCart && (
              <div className="mt-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                ✓ In Cart
              </div>
            )}
          </div>
        </div>
      </Link>

      {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
    </div>
  );
};

export default ProductCard;