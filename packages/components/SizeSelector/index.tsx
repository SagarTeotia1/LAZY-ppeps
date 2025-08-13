'use client';

import React from 'react';
import { Controller } from 'react-hook-form';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

type SizeSelectorProps = {
  control: any;
  name: string;
  label?: string;
  errors?: any;
};

const SizeSelector: React.FC<SizeSelectorProps> = ({ control, name, label = 'Sizes', errors }) => {
  return (
    <div className="mt-2">
      <label className="block font-semibold text-gray-300 mb-1">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => {
              const isSelected = (field.value || []).includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((s: string) => s !== size)
                        : [...(field.value || []), size]
                    )
                  }
                  className={`px-3 py-1 rounded-lg font-Poppins transition-colors ${
                    isSelected
                      ? 'bg-gray-700 text-white border border-white/40'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      />
      {errors?.[name] && (
        <p className="text-sm text-red-500 mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

export default SizeSelector;
