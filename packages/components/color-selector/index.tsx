import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

const defaultColors = [
  '#000000', // Black
  '#ffffff', // White
  '#ff0000', // Red
  '#00ff00', // Green (fixed typo)
  '#0000ff', // Blue
  '#ffff00', // Yellow (fixed typo)
  '#ff00ff', // Magenta (fixed typo)
  '#00ffff', // Cyan
];

const ColorSelector = ({ control, errors }: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState('#ffffff');

  return (
    <div className="mt-2">
      <label className="block font-semibold text-gray-300 mb-1">Colors</label>

      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex gap-3 flex-wrap">
            {[...defaultColors, ...customColors].map((color) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ['#ffffff', '#ffff00'].includes(color);

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !== color)
                        : [...(field.value || []), color]
                    )
                  }
                  className={`
                    w-7 h-7 rounded-md border-2 my-1 flex items-center justify-center transition
                    ${
                      isSelected
                        ? 'scale-110 border-white'
                        : 'border-transparent'
                    }
                     ${isLightColor ? 'border-gray-600r' : ''}`}
                  style={{ backgroundColor: color }}
                />
              );
            })}

            <button
              type="button"
              className="w-8 h-6 flex items-center justify-center rounded-full border-2 border-gray-500 bg-gray-800 hover: bg-gray-700 transition "
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Plus size={16} color="white" />
            </button>

            {showColorPicker && (
              <div className="relative flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 p-0 border-none cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => {
                    setCustomColors([...customColors, newColor]);
                    setShowColorPicker(false);
                  }}
                  className="px-3 py-1 bg-gray-700 text-white rounded-md text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default ColorSelector;
