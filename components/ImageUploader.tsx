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
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-slate-200 group">
        <img src={preview} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <span className="text-white font-bold text-lg">{label}</span>
            <button 
              onClick={onClear}
              className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 font-semibold text-sm transition-colors"
            >
              Change
            </button>
        </div>
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
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
        w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200
        ${isDragging 
          ? 'border-brand-500 bg-brand-50' 
          : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50 bg-white'
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
      <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      <p className="text-slate-600 font-bold text-lg">{label}</p>
      <p className="text-slate-400 text-sm mt-1">Tap to select image</p>
    </div>
  );
};
