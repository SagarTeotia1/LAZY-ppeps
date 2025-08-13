import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Controller } from 'react-hook-form';

const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = useState<
    { label: string; values: string[]; inputValue: string }[]
  >([]);
  const [newLabel, setNewLabel] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <Controller
        name="custom_properties"
        control={control}
        render={({ field }) => {
          useEffect(() => {
            // Clean inputValue before pushing to form
            const cleanProps = properties.map(({ label, values }) => ({ label, values }));
            field.onChange(cleanProps);
          }, [properties]);

          const addProperty = () => {
            if (!newLabel.trim()) return;
            setProperties([
              ...properties,
              { label: newLabel.trim(), values: [], inputValue: '' },
            ]);
            setNewLabel('');
          };

          const updateInput = (index: number, value: string) => {
            const updated = [...properties];
            updated[index].inputValue = value;
            setProperties(updated);
          };

          const addValue = (index: number) => {
            const trimmed = properties[index].inputValue.trim();
            if (!trimmed) return;

            const updated = [...properties];
            if (!updated[index].values.includes(trimmed)) {
              updated[index].values.push(trimmed);
            }
            updated[index].inputValue = '';
            setProperties(updated);
          };

          const deleteValue = (propIndex: number, valIndex: number) => {
            const updated = [...properties];
            updated[propIndex].values.splice(valIndex, 1);
            setProperties(updated);
          };

          const removeProperty = (index: number) => {
            setProperties(properties.filter((_, i) => i !== index));
          };

          return (
            <div>
              <label className="block font-semibold text-gray-300 mb-2">
                Custom Properties
              </label>

              <div className="flex flex-col gap-4">
                {properties.map((property, index) => (
                  <div
                    key={index}
                    className="border border-gray-700 rounded-lg bg-gray-900 p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white font-medium">{property.label}</h4>
                      <button
                        type="button"
                        onClick={() => removeProperty(index)}
                        className="p-1 hover:bg-red-700 bg-red-600 rounded"
                      >
                        <X size={18} className="text-white" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add value"
                        value={property.inputValue}
                        onChange={(e) => updateInput(index, e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-600 text-white px-3 py-1 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => addValue(index)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                      >
                        Add
                      </button>
                    </div>

                    {property.values.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {property.values.map((val, valIndex) => (
                          <div
                            key={valIndex}
                            className="flex items-center gap-1 bg-gray-700 text-white px-3 py-1 rounded-full"
                          >
                            <span>{val}</span>
                            <button
                              type="button"
                              onClick={() => deleteValue(index, valIndex)}
                              className="hover:text-red-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new property input */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="New Property Label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-600 text-white px-3 py-1 rounded"
                />
                <button
                  type="button"
                  onClick={addProperty}
                  className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default CustomProperties;
