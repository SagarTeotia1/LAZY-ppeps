'use client';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, X } from 'lucide-react';
import ImagePlaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder';
import Input from 'packages/components/input';
import ColorSelector from 'packages/components/color-selector';
import CustomSpecifications from 'packages/components/custom-specification';
import CustomProperties from 'packages/components/coustom-properties';
import axiosInstance from 'apps/seller-ui/src/utils/axiosinstance';
import RichTextEditor from 'packages/components/rich-text-editor';
import SizeSelector from 'packages/components/SizeSelector';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setselectedImage] = useState('');
  const [isChanged, setIsChanged] = useState(true);
  const [pictureUploadingLoder, setPictureUploadingLoder] = useState(false);
  const router = useRouter();
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/product/api/get-categories');
        return res.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ['shop-discounts'],

    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-discount-code');
      return res.data?.discount_codes || [];
    },
  });

  const categories = data?.categories || [];
  const subcategoriesData = data?.subcategories || {};

  const selectedCategory = watch('category');
  const regularPrice = watch('regular_price');

  const subcategories = useMemo(() => {
    return selectedCategory ? subcategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subcategoriesData]);

  console.log(categories, subcategoriesData);

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setPictureUploadingLoder(true);
    try {
      const fileName = await convertFileToBase64(file);

      const response = await axiosInstance.post(
        '/product/api/upload-product-image',
        { fileName }
      );

      const uploadedImages: UploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      };
      const updatedImages = [...images];
      updatedImages[index] = uploadedImages;
      if (index == images.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureUploadingLoder(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];
      if (imageToDelete && typeof imageToDelete === 'object') {
        await axiosInstance.delete('/product/api/delete-product-image', {
          data: {
            fileId: imageToDelete.fileId,
          },
        });
      }

      updatedImages.splice(index, 1);

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveDraft = () => {};

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.post('/product/api/create-product', data);
      router.push('/dashboard/all-products');
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
    {
      setLoading(false);
    }
  };

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center gap-1 text-sm mb-2">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>

      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Left side - Image upload section */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              size="765 * 850"
              setOpenImageModal={setOpenImageModal}
              small={false}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
              index={0}
              images={images}
              pictureUploadingLoder={pictureUploadingLoder}
              setselectedImage={setselectedImage}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                key={index + 1}
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"
                small
                setselectedImage={setselectedImage}
                index={index + 1}
                images={images}
                pictureUploadingLoder={pictureUploadingLoder}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>

        {/* Right side form inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* Product Title Input */}
            <div className="w-2/4">
              <Input
                label="Product Tittle"
                placeholder="Enter Product title"
                {...register('title', { required: 'Title is required' })}
              />{' '}
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}
              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words)"
                  placeholder="Enter product description for quick view"
                  {...register('short_description', {
                    required: 'Description is required',
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="apple, flagship"
                  {...register('tags', {
                    required: 'Separate related product tags with a comma',
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Warranty *"
                  placeholder="1 Year / No Warranty"
                  {...register('warranty', {
                    required: 'Warranty is required!',
                  })}
                />
                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product_slug"
                  {...register('slug', {
                    required: 'Slug is required!',
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        'Invalid slug format! Use only lowercase letters, numbers, and hyphens.',
                    },
                    minLength: {
                      value: 3,
                      message: 'Slug must be at least 3 characters long.',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Slug cannot be longer than 50 characters.',
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Brand"
                  placeholder="Apple"
                  {...register('brand')}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <ColorSelector control={control} error={errors} />
              </div>
              <div className="mt-2">
                <CustomSpecifications control={control} error={errors} />
              </div>
              <div className="mt-2">
                <CustomProperties control={control} error={errors} />
              </div>
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery *
                </label>
                <select
                  {...register('cash_on_delivery', {
                    required: 'Cash on Delivery is required',
                  })}
                  defaultValue="yes"
                  className="w-full border border-gray-700 bg-transparent text-white px-3 py-2 rounded outline-none"
                >
                  <option value="yes" className="bg-black text-white">
                    Yes
                  </option>
                  <option value="no" className="bg-black text-white">
                    No
                  </option>
                </select>
              </div>
            </div>
            <div className="w-2/4">
              <label className="block font-semibold text-gray-300 mb-1">
                Category*
              </label>
              {isLoading ? (
                <p className="text-gray-400">Loading categories ...</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border border-gray-700 bg-transparent text-white px-3 py-2 !rounded outline-none"
                    >
                      {''}
                      <option value="" disabled className="bg-black text-white">
                        Select a category
                      </option>
                      {categories?.map((category: string) => (
                        <option
                          key={category}
                          value={category}
                          className="bg-black text-white"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}

              <div className="mt-4">
                <label className="block font-semibold text-gray-300 mb-1">
                  Subcategory*
                </label>

                <Controller
                  name="subCategory"
                  control={control}
                  rules={{ required: 'subCategory is required' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border border-gray-700 bg-transparent text-white px-3 py-2 !rounded outline-none"
                    >
                      <option value="" className="bg-black text-white">
                        Select a subCategory
                      </option>
                      {subcategories.map((subcategories: string) => (
                        <option
                          key={subcategories}
                          value={subcategories}
                          className="bg-black text-white"
                        >
                          {subcategories}
                        </option>
                      ))}
                    </select>
                  )}
                />

                {errors.subCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subCategory.message as string}
                  </p>
                )}
              </div>
              <div className="mt-6">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description (Min 100 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: 'Detailed description is required!',
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount >= 100 ||
                        `Description must be at least 100 words (Currently: ${wordCount})`
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write a detailed product description here..."
                    />
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>
              {/* youtube video */}
              <div className="mt-4">
                <Input
                  label="Product Video (YouTube Embed URL)"
                  placeholder="https://www.youtube.com/embed/xyz123"
                  {...register('video_url', {
                    pattern: {
                      value:
                        /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                      message:
                        'Invalid YouTube embed URL! Use format: https://www.youtube.com/embed/xyz123',
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Regular Price"
                  placeholder="20"
                  type="number"
                  {...register('regular_price', {
                    valueAsNumber: true,
                    required: 'Price is required!',
                    min: { value: 1, message: 'Price must be at least 1' },
                    validate: (value) =>
                      !isNaN(value) || 'Only numeric values are allowed',
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Sale Price *"
                  placeholder="15"
                  type="number"
                  {...register('sale_price', {
                    required: 'Sale Price is required',
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: 'Sale Price must be at least 1',
                    },
                    validate: (value) => {
                      if (isNaN(value)) return 'Only numbers are allowed';
                      if (regularPrice && value > regularPrice) {
                        return 'Sale Price must be less than or equal to Regular Price';
                      }
                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  type="number"
                  {...register('stock', {
                    required: 'Stock is required!',
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: 'Stock must be at least 1',
                    },
                    max: {
                      value: 1000,
                      message: 'Stock cannot exceed 1,000',
                    },
                    validate: (value) => {
                      if (isNaN(value)) return 'Only numbers are allowed!';
                      if (!Number.isInteger(value))
                        return 'Stock must be a whole number!';
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <SizeSelector control={control} name="sizes" errors={errors} />
              </div>
              <div className="mt-3">
                <label> Discount Coupon Optional *</label>
                {discountLoading ? (
                  <p className="text-gray-400">Loading discount codes ...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((code: any) => (
                      <button
                        key={code.id}
                        type="button"
                        className={`px-3 py-1 rounded-md font-semibold border ${
                          watch('discountCodes')?.includes(code.id)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                        }`}
                        onClick={() => {
                          const currentSelection = watch('discountCodes') || [];
                          const updatedSelection = currentSelection?.includes(
                            code.id
                          )
                            ? currentSelection.filter(
                                (id: string) => id !== code.id
                              )
                            : [...currentSelection, code.id];
                          setValue('discountCodes', updatedSelection);
                        }}
                      >
                        {code.public_name} ({code.discountValue}
                        {code.discountType === 'percentage' ? '%' : '$'})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
            <div className="flex justify-center items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance Product Image</h2>
              <X
                size={20}
                className="cursor-pointer ml-auto"
                onClick={() => setOpenImageModal(!openImageModal)}
              />
            </div>

            <div className="w-full h-[250px] rounded-md overflow-hidden border border-gray-600 relative">
              <Image
                src={selectedImage}
                alt="product-image"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-gray-700 text-white rounded-md"
          >
            Save Draft
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default Page;
