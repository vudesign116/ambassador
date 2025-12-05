import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder, height = '200px' }) => {
  // Customize toolbar
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  }), []);

  const formats = [
    'header', 'size',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'align',
    'color', 'background'
  ];

  return (
    <div style={{ 
      border: '1px solid #d9d9d9', 
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'white'
    }}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          height: height,
          marginBottom: '42px' // Space for toolbar
        }}
      />
    </div>
  );
};

export default RichTextEditor;
