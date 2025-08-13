'use client';
import axiosInstance from 'apps/seller-ui/src/utils/axiosinstance';
import { ChevronRight, Plus, Trash, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Controller, useForm } from 'react-hook-form';
import Input from 'packages/components/input';
import { AxiosError } from 'axios';
import DeleteDiscountCodeModal from 'apps/seller-ui/src/shared/components/modals/delete.discount-code';


const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectDiscount, setSelectDiscount] = useState<any>();

  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ['shop-discounts'],

    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-discount-code');
      return res.data?.discount_codes || [];
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: '',
      discountType: 'percentage',
      discountValue: '',
      discountCode: '',
    },
  });

  const handleDeleteClick = async (discount: any) => {
    setSelectDiscount(discount);
    setShowDeleteModal(true);
    
  };

  

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.post('/product/api/create-discount-code', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-discounts'] });
      reset();
      setShowModal(false);
    },
  });


    const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId) => {
      
      await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`);
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['shop-discounts'] });
      setShowDeleteModal(false);
    },
    onError: (error) => {
      console.error("Error deleting discount code:", error);
    },
  });


  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error('You can only Create up to 8 discount codes.');
    }
    createDiscountCodeMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} />
          Create Discount
        </button>
      </div>
      <div className="flex items-center text-white gap-1 text-sm mb-2">
        <Link href={'/dashboard'} className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Discount Code</span>
      </div>
      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>
        {isLoading ? (
          <p className="text-gray-400 text-center">Loading discounts ...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-2 text-left">Tittle</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Value</th>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.map((discount: any) => (
                <tr key={discount?.id} className="border-b border-gray-800">
                  <td className="px-4 py-2">{discount?.public_name}</td>

                  <td className="p-3 capitalize">
                    {discount.discountType === 'percentage'
                      ? 'Percentage (%)'
                      : 'Flat ($)'}
                  </td>
                  <td className="p-3 capitalize">
                    {discount.discountType === 'percentage'
                      ? `${discount.discountValue}%`
                      : `$${discount.discountValue}`}
                  </td>
                  <td className="px-4 py-2">{discount.discountCode}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteClick(discount)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash size={18} />
                    </button>
                  </td>

                  {/* Add more columns here if needed */}
                </tr>
              ))}
            </tbody>
            {!isLoading && discountCodes?.length === 0 && (
              <p className="text-gray-400 w-full pt-4 block text-center">
                No Discount Codes Available!
              </p>
            )}
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-xl text-white">Create Discount Code</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              {/* Title / Public Name */}
              <Input
                label="Title (Public Name)"
                {...register('public_name', { required: 'Title is required' })}
                placeholder="Eg. Summer Sale"
              />
              {errors.public_name && (
                <p className="text-red-500 text-xs -mt-3">
                  {errors.public_name.message}
                </p>
              )}

              {/* Discount Type */}
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Discount Type *
              </label>
              <Controller
                name="discountType"
                control={control}
                rules={{ required: 'Discount type is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                )}
              />
              {errors.discountType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.discountType.message}
                </p>
              )}
              {/* Discount Value */}
              <Input
                label="Discount Value"
                type="number"
                placeholder="Eg. 10"
                {...register('discountValue', {
                  required: 'Discount value is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Minimum value is 1' },
                })}
              />
              {errors.discountValue && (
                <p className="text-red-500 text-xs -mt-3">
                  {errors.discountValue.message}
                </p>
              )}

              {/* Discount Code */}
              <Input
                label="Discount Code"
                placeholder="Eg. SUMMER10"
                {...register('discountCode', {
                  required: 'Discount code is required',
                })}
              />
              {errors.discountCode && (
                <p className="text-red-500 text-xs -mt-3">
                  {errors.discountCode.message}
                </p>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={createDiscountCodeMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center space-x-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  <Plus />
                  <span>
                    {createDiscountCodeMutation?.isPending
                      ? 'Creating ...'
                      : 'Create'}
                  </span>
                </button>

                <p className="text-red-500 text-sm mt-2">
                  {
                    (
                      createDiscountCodeMutation.error as AxiosError<{
                        message: string;
                      }>
                    )?.response?.data?.message
                  }
                </p>
              </div>
            </form>
          </div>
        </div>
      )}{showDeleteModal && selectDiscount &&(

        <DeleteDiscountCodeModal
        discount={selectDiscount}
        onClose={()=>setShowDeleteModal(false)}
        onConfirm={()=>deleteDiscountCodeMutation.mutate(selectDiscount?.id)}
    />  
    )}
    </div>
  );
};

export default Page;
