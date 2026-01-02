import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, file, onFileSelect, onClear }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Update preview when file changes
  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (f: File) => {
    if (f.type.startsWith('image/')) {
      onFileSelect(f);
    } else {
      alert('Please upload an image file');
    }
  };

  if (preview) {
    return (
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-soft border border-light-border group">
        <img src={preview} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out flex flex-col items-center justify-center gap-3">
            <span className="text-white font-bold text-lg tracking-tight">{label}</span>
            <button
              onClick={onClear}
              className="px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 font-semibold text-sm transition-all duration-200"
            >
              Change
            </button>
        </div>
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
            {label}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ease-out
        ${isDragging
          ? 'border-brand-500 bg-brand-50 shadow-soft scale-[0.98]'
          : 'border-light-border hover:border-brand-400 hover:bg-brand-50/30 bg-white shadow-sm-soft hover:shadow-soft'
        }
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />
      <div className="w-14 h-14 rounded-xl bg-brand-100 text-brand-500 flex items-center justify-center mb-4 shadow-sm-soft">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      <p className="text-dark font-bold text-lg">{label}</p>
      <p className="text-dark-muted font-medium text-sm mt-1.5">Tap to select image</p>
    </div>
  );
};
