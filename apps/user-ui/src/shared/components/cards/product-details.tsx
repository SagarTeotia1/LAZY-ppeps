import React, { useState } from 'react';
import Image from 'next/image';
import { X, Heart, ShoppingCart, Star, Truck, Shield, Clock } from 'lucide-react';

const ProductDetailsCard = ({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(data?.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(data?.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);

  // Function to strip HTML tags from detailed description
  const stripHtmlTags = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-6xl max-h-[90vh] overflow-auto bg-white shadow-xl rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{data?.title}</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={data?.images?.[activeImage]?.url || 'https://picsum.photos/500/500'}
                  alt={data?.title || 'Product image'}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://picsum.photos/500/500';
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              {data?.images && data.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {data.images.map((img: any, index: number) => (
                    <div
                      key={index}
                      className={`
                        flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden
                        ${activeImage === index ? 'border-blue-500' : 'border-gray-200'}
                      `}
                      onClick={() => setActiveImage(index)}
                    >
                      <Image
                        src={img?.url || 'https://picsum.photos/80/80'}
                        alt={`Thumbnail ${index}`}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="space-y-6">
              {/* Shop Info */}
              <div className="border-b pb-4 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {data?.Shop?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{data?.Shop?.name}</h3>
                    <p className="text-sm text-gray-600">{data?.Shop?.bio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{data?.Shop?.ratings || 0} shop rating</span>
                </div>
              </div>

              {/* Product Basic Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 mb-2">{data?.short_description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Category: {data?.category}</span>
                    {data?.subCategory && (
                      <>
                        <span>•</span>
                        <span>{data?.subCategory}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-green-600">
                    ${data?.sale_price || 0}
                  </span>
                  {data?.regular_price && data?.regular_price > data?.sale_price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ${data?.regular_price}
                      </span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                        {Math.round(((data?.regular_price - data?.sale_price) / data?.regular_price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < (data?.ratings || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {data?.ratings || 0} out of 5
                  </span>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    data?.stock > 10 
                      ? 'bg-green-100 text-green-800' 
                      : data?.stock > 0 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {data?.stock > 0 ? `${data?.stock} in stock` : 'Out of stock'}
                  </span>
                  {data?.stock <= 5 && data?.stock > 0 && (
                    <span className="text-sm text-red-600 font-medium">
                      Limited Stock!
                    </span>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              {data?.sizes && data.sizes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Size</h4>
                  <div className="flex gap-2">
                    {data.sizes.map((size: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                          selectedSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {data?.colors && data.colors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Color</h4>
                  <div className="flex gap-2">
                    {data.colors.map((color: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-gray-800 scale-110'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Quantity</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border border-gray-300 rounded-md min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(data?.stock || 999, quantity + 1))}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <Heart size={20} />
                </button>
              </div>

              {/* Additional Info */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={16} />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield size={16} />
                  <span>Warranty: {data?.warranty || 'No warranty'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>Cash on Delivery: {data?.cashOnDelivery === 'yes' ? 'Available' : 'Not Available'}</span>
                </div>
              </div>

              {/* Tags */}
              {data?.tags && data.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Specifications */}
              {data?.custom_specifications && data.custom_specifications.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Specifications</h4>
                  <div className="space-y-1">
                    {data.custom_specifications.map((spec: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{spec.name}:</span>
                        <span className="text-gray-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;