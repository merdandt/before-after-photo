import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { stitchImages } from './services/imageProcessor';
import { ProcessingStatus } from './types';

const App = () => {
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!beforeFile || !afterFile) return;

    setStatus('processing');
    try {
      // Small timeout to let React render the loading state before blocking main thread with canvas ops
      setTimeout(async () => {
        try {
          const url = await stitchImages(beforeFile, afterFile);
          setResultUrl(url);
          setStatus('success');
        } catch (error) {
          console.error(error);
          setStatus('error');
        }
      }, 100);
    } catch (e) {
      setStatus('error');
    }
  };

  const handleReset = () => {
    setBeforeFile(null);
    setAfterFile(null);
    setResultUrl(null);
    setStatus('idle');
  };

  const downloadImage = async () => {
    if (!resultUrl) return;

    try {
      // Convert data URL to blob for better mobile support
      const response = await fetch(resultUrl);
      const blob = await response.blob();

      // Try native share API first (works great on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'image.jpg')] })) {
        const file = new File([blob], `before-after-${Date.now()}.jpg`, { type: 'image/jpeg' });
        await navigator.share({
          files: [file],
          title: 'Before/After Comparison',
        });
        return;
      }

      // Fallback to download link (desktop and some mobile browsers)
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `before-after-${Date.now()}.jpg`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      // Last resort: open in new tab (user can long-press to save on mobile)
      window.open(resultUrl, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
      
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
          Before<span className="text-brand-600">After</span>
        </h1>
        <p className="text-slate-500 font-medium">Create professional comparisons in seconds.</p>
      </header>

      {/* Main Workflow */}
      {!resultUrl ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <ImageUploader 
              label="Before" 
              file={beforeFile} 
              onFileSelect={setBeforeFile} 
              onClear={() => setBeforeFile(null)} 
            />
            <ImageUploader 
              label="After" 
              file={afterFile} 
              onFileSelect={setAfterFile} 
              onClear={() => setAfterFile(null)} 
            />
          </div>

          <div className="fixed bottom-6 left-0 right-0 px-4 md:relative md:bottom-auto md:px-0 md:mt-8 z-10">
            <div className="max-w-4xl mx-auto">
               <Button 
                onClick={handleGenerate} 
                disabled={!beforeFile || !afterFile || status === 'processing'}
                fullWidth
                className="shadow-xl md:shadow-lg shadow-brand-500/20"
              >
                {status === 'processing' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Generate Comparison"
                )}
              </Button>
            </div>
          </div>
          
        </div>
      ) : (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100">
            <img src={resultUrl} alt="Result" className="w-full h-auto rounded-xl" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
             <Button onClick={downloadImage} fullWidth>
                Download Image
             </Button>
             <Button onClick={handleReset} variant="secondary" fullWidth>
                Create New
             </Button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 text-center text-slate-400 text-xs">
        <p>Images are processed locally in your browser.</p>
      </div>

    </div>
  );
};

export default App;
