'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import ImagePlaceHolder from 'apps/user-ui/src/shared/components/components/image-placeholder';
import Input from 'packages/components/input/index';
import axiosInstance from 'apps/user-ui/src/utils/axiosinstance';
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
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setselectedImage] = useState('');
  const [pictureUploadingLoder, setPictureUploadingLoder] = useState(false);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        '/community/api/upload-post-image',
        { fileName }
      );
      const uploadedImages: UploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      };
      const updatedImages = [...images];
      updatedImages[index] = uploadedImages;
      if (index === images.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to upload images');
      } else if (error.response?.status === 403) {
        toast.error('Only users can upload post images');
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload image');
      }
    } finally {
      setPictureUploadingLoder(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];
      if (imageToDelete && typeof imageToDelete === 'object') {
        await axiosInstance.delete('/community/api/delete-post-image', {
          data: { fileId: imageToDelete.fileId },
        });
      }
      updatedImages.splice(index, 1);
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error: any) {
      console.error('Remove image error:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to remove images');
      } else if (error.response?.status === 403) {
        toast.error('Permission denied');
      } else if (error.response?.status === 404) {
        toast.error('Image not found or permission denied');
      } else {
        toast.error(error.response?.data?.message || 'Failed to remove image');
      }
    }
  };

  const onSubmit = async (data: any) => {
    const validImages = images.filter((img) => img !== null);
    if (validImages.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setLoading(true);
      const transformedImages = validImages.map((img: any) => ({
        file_id: img.fileId,
        url: img.file_url,
      }));
      const payload = {
        title: data.title,
        content: data.content,
        images: transformedImages,
      };
      await axiosInstance.post('/community/api/create-post', payload);
      toast.success('Post created successfully');
      router.push('/community/posts');
    } catch (error: any) {
      console.error('Create post error:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to create a post');
      } else if (error.response?.status === 403) {
        toast.error('Only users can create posts');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Validation error');
      } else {
        toast.error(error.response?.data?.message || 'Post creation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="w-full max-w-6xl mx-auto p-6 md:p-10 bg-white shadow-lg rounded-xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-3xl md:text-4xl font-bold text-black font-Poppins mb-6">
        📢 Create a New Post
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Upload Section */}
        <div className="md:w-1/2 space-y-4">
          {images.length > 0 && (
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
          <div className="grid grid-cols-2 gap-3">
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

        {/* Form Fields */}
        <div className="md:w-1/2 space-y-6">
          <div>
            <div className="text-black">
              <Input
                label="Post Title"
                placeholder="Enter a catchy title..."
                {...register('title', { required: 'Title is required' })}
              />
            </div>

            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              placeholder="Write your thoughts here..."
              className="w-full min-h-[140px] rounded-md border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">
                {errors.content.message?.toString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </div>

      {/* Image Preview Modal */}
      {openImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-md w-full relative">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Image Preview
              </h2>
              <X
                className="cursor-pointer text-gray-500"
                onClick={() => setOpenImageModal(false)}
              />
            </div>
            <div className="relative w-full h-[300px] bg-gray-100">
              <Image
                src={selectedImage}
                alt="Selected"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default Page;
