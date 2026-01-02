import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { LabelChipSelector, LABEL_PRESETS } from './components/LabelChipSelector';
import { SettingsModal } from './components/SettingsModal';
import { stitchImages } from './services/imageProcessor';
import { ProcessingStatus, OutputSettings, LabelPreset } from './types';

const App = () => {
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [labelPreset, setLabelPreset] = useState<LabelPreset>(LABEL_PRESETS[0]);
  const [settings, setSettings] = useState<OutputSettings>({
    format: 'original',
    orientation: 'horizontal',
    quality: 95,
  });
  const [showSettings, setShowSettings] = useState(false);

  const handleGenerate = async () => {
    if (!beforeFile || !afterFile) return;

    setStatus('processing');
    try {
      // Small timeout to let React render the loading state before blocking main thread with canvas ops
      setTimeout(async () => {
        try {
          const url = await stitchImages(beforeFile, afterFile, {
            beforeLabel: labelPreset.leftLabel,
            afterLabel: labelPreset.rightLabel,
            orientation: settings.orientation,
            targetFormat: settings.format,
          });
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
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-dark mb-3 tracking-tight" style={{ lineHeight: '1.2' }}>
          Before<span className="text-brand-500">After</span>
        </h1>
        <p className="text-dark-muted font-medium text-base md:text-lg">Create professional comparisons in seconds.</p>
      </header>

      {/* Main Workflow */}
      {!resultUrl ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Label Chip Selector */}
          <LabelChipSelector
            selectedPreset={labelPreset}
            onPresetChange={setLabelPreset}
          />

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
            <div className="max-w-4xl mx-auto flex gap-3">
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center justify-center px-4 py-3 border border-light-border text-dark bg-white hover:bg-light-gray font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-soft hover:shadow-md-soft relative"
                title="Output Settings"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {(settings.format !== 'original' || settings.orientation !== 'horizontal') && (
                  <span className="absolute -top-1.5 -right-1.5 flex">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-500 border-2 border-white shadow-md"></span>
                  </span>
                )}
              </button>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!beforeFile || !afterFile || status === 'processing'}
                fullWidth
                className="shadow-md-soft md:shadow-soft hover:shadow-lg-soft"
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
          <div className="bg-white p-3 rounded-2xl shadow-lg-soft border border-light-border">
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
      <div className="mt-12 text-center text-dark-muted text-sm font-medium">
        <p>Images are processed locally in your browser.</p>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

    </div>
  );
};

export default App;
