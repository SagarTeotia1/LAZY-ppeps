import { Trash2 } from 'lucide-react';
import React from 'react';
import { useFieldArray, Controller } from 'react-hook-form';

const CustomSpecifications = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'custom_specifications',
  });

  return (
    <div className="mt-4">
      <label className="block font-semibold text-gray-300 mb-1">
        Custom Specifications
      </label>

      <div className="flex flex-col gap-3">
        {fields?.map((item, index) => (
          <div key={item.id} className="flex gap-2 items-center">
            {/* Specification Name */}
            <Controller
              name={`custom_specifications.${index}.name`}
              control={control}
              rules={{ required: 'Specification name is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Specification Name"
                  className="bg-gray-800 border border-gray-600 text-white px-3 py-1 rounded w-full"
                />
              )}
            />

            {/* Specification Value */}
            <Controller
              name={`custom_specifications.${index}.value`}
              control={control}
              rules={{ required: 'Specification value is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Specification Value"
                  className="bg-gray-800 border border-gray-600 text-white px-3 py-1 rounded w-full"
                />
              )}
            />

            <button
              type="button"
              onClick={() => remove(index)}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
             <Trash2 size={20}/>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => append({ name: '', value: '' })}
        className="mt-3 px-4 py-1 bg-blue-600 text-white rounded"
      >
        Add Specification
      </button>

      {/* Error summary (optional) */}
      {errors?.custom_specifications && (
        <p className="text-red-500 text-xs mt-1">
          {errors.custom_specifications.message}
        </p>
      )}
    </div>
  );
};

export default CustomSpecifications;
