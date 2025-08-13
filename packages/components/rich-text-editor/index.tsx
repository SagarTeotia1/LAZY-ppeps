'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import ReactQuill from 'react-quill-new';

type RichTextEditorProps = {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
  style = {},
}) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const quillRef = useRef(false);

  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = true;

      // 🧹 Remove extra toolbars
      setTimeout(() => {
        document.querySelectorAll('.ql-toolbar').forEach((toolbar, index) => {
          if (index > 0) toolbar.remove();
        });
      }, 100);
    }
  }, []);

  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  return (
    <>
      <ReactQuill
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={modules}
        placeholder={placeholder}
        className={`bg-transparent border border-gray-700 text-white rounded-md ${className}`}
        style={{ minHeight: '250px', ...style }}
      />

      {/* 🧑‍🎨 Custom Dark Theme Styles */}
      <style jsx global>{`
        .ql-toolbar {
          background: transparent;
          border-color: #444 !important;
        }
        .ql-container {
          background: transparent !important;
          border-color: #444 !important;
          color: white;
        }
        .ql-editor.ql-blank::before {
          color: #aaa !important;
        }
        .ql-picker-options {
          background: #333 !important;
          color: white !important;
        }
        .ql-picker-item {
          color: white !important;
        }
        .ql-stroke {
          stroke: white !important;
        }
      `}</style>
    </>
  );
};

export default RichTextEditor;
