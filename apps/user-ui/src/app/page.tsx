'use client'
import React from 'react';
import Hero from '../shared/modules/hero';
import SectionTitle from '../shared/components/sections/secetion-title';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosinstance';
import ProductCard from '../shared/components/cards/product-card';

const page = () => {
  
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/product/api/get-all-products?page=1&limit=10' // Fixed: changed 'p' to 'page'
      );
      console.log('API Response:', res.data); // Add logging
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: latestProducts, isLoading: isLatestLoading } = useQuery({
    queryKey: ['latest-products'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/product/api/get-all-products?page=1&limit=10&type=latest'
      );
      console.log('Latest Products Response:', res.data); // Add logging
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  // Add error logging
  if (isError) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Suggest Product" />
        </div>

        {/* Error handling */}
        {isError && (
          <div className="text-red-500 text-center p-4">
            Error loading products. Please try again later.
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-6 gap-6 p-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-200 animate-pulse rounded-2xl shadow-md transition-transform transform hover:scale-105"
              />
            ))}
          </div>
        )}

        {/* Products grid */}
        {!isLoading && !isError && products && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.length > 0 ? (
              products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center p-8 text-gray-500">
                No products found.
              </div>
            )}
          </div>
        )}

        {/* Latest Products Section */}
        {latestProducts && latestProducts.length > 0 && (
          <div className="mt-16">
            <div className="mb-8">
              <SectionTitle title="Latest Products" />
            </div>
            <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {latestProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;