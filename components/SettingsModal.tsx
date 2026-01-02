import React, { useState } from 'react';
import { OutputSettings, SocialFormat, LayoutOrientation } from '../types';
import { analytics, trackEvent } from '../utils/analytics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: OutputSettings;
  onSettingsChange: (settings: OutputSettings) => void;
}

const SOCIAL_FORMATS: Array<{ id: SocialFormat; name: string; ratio: string }> = [
  { id: 'original', name: 'Original Size', ratio: 'Keep original' },
  { id: 'instagram-square', name: 'Instagram Square', ratio: '1:1 (1080×1080)' },
  { id: 'instagram-story', name: 'Instagram Story', ratio: '9:16 (1080×1920)' },
  { id: 'facebook-post', name: 'Facebook Post', ratio: '1.91:1 (1200×630)' },
  { id: 'twitter-post', name: 'Twitter Post', ratio: '16:9 (1200×675)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleFormatChange = (format: SocialFormat) => {
    onSettingsChange({ ...settings, format });

    // Track format change
    analytics.trackSettingsChanged({
      setting_type: 'format',
      new_value: format,
    });
  };

  const handleOrientationChange = (orientation: LayoutOrientation) => {
    onSettingsChange({ ...settings, orientation });

    // Track orientation change
    analytics.trackSettingsChanged({
      setting_type: 'orientation',
      new_value: orientation,
    });
  };

  const handleReset = () => {
    onSettingsChange({
      format: 'original',
      orientation: 'horizontal',
      quality: 95,
    });
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formData = new FormData();
      const accessKey = import.meta.env.VITE_WEB3FORM;

      console.log('Access Key:', accessKey); // Debug

      // Include email in the message body
      const messageWithEmail = feedbackEmail
        ? `${feedbackMessage}\n\n---\nReply to: ${feedbackEmail}`
        : feedbackMessage;

      formData.append('access_key', accessKey || '');
      formData.append('message', messageWithEmail);
      formData.append('from_name', feedbackEmail || 'Anonymous User');
      formData.append('subject', 'BeforeAfter - Feedback/Feature Request');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Web3Forms response:', data); // Debug

      if (data.success) {
        setSubmitStatus('success');
        setFeedbackMessage('');
        setFeedbackEmail('');

        // Track feedback submission
        trackEvent('feedback_submitted', {
          has_email: !!feedbackEmail,
        });

        // Reset success message after 3 seconds
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        console.error('Web3Forms error:', data.message);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasNonDefaultSettings =
    settings.format !== 'original' ||
    settings.orientation !== 'horizontal';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 overflow-y-auto">
        <div
          className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-w-md w-full md:my-8 animate-in slide-in-from-bottom md:zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-light-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-dark" style={{ lineHeight: '1.2' }}>Output Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-light-gray flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[65vh] md:max-h-[60vh]">

            {/* Layout Orientation */}
            <div>
              <label className="block text-sm font-bold text-dark mb-3">
                Layout
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOrientationChange('horizontal')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ease-out ${
                    settings.orientation === 'horizontal'
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-400/30 shadow-soft'
                      : 'border-light-border hover:border-brand-300 hover:bg-brand-50/50 shadow-sm-soft'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
                    </svg>
                    <span className="text-sm font-bold text-dark">Horizontal</span>
                    <span className="text-xs text-dark-muted font-medium">Side-by-side</span>
                  </div>
                </button>
                <button
                  onClick={() => handleOrientationChange('vertical')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ease-out ${
                    settings.orientation === 'vertical'
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-400/30 shadow-soft'
                      : 'border-light-border hover:border-brand-300 hover:bg-brand-50/50 shadow-sm-soft'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-1 1H6a1 1 0 01-1-1V4zM5 14a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-1 1H6a1 1 0 01-1-1v-4z" />
                    </svg>
                    <span className="text-sm font-bold text-dark">Vertical</span>
                    <span className="text-xs text-dark-muted font-medium">Stacked</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Social Media Format */}
            <div>
              <label className="block text-sm font-bold text-dark mb-3">
                Format
              </label>
              <div className="space-y-2">
                {SOCIAL_FORMATS.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => handleFormatChange(format.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ease-out ${
                      settings.format === format.id
                        ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-400/30 shadow-soft'
                        : 'border-light-border hover:border-brand-300 hover:bg-brand-50/50 shadow-sm-soft'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-dark">{format.name}</div>
                        <div className="text-sm text-dark-muted font-medium mt-0.5">{format.ratio}</div>
                      </div>
                      {settings.format === format.id && (
                        <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Form */}
            <div className="pt-6 border-t border-light-border">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-dark mb-1">Need something else?</h3>
                <p className="text-xs text-dark-muted font-medium">Share your feedback or request a feature</p>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Your email (optional)"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-light-border focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30 outline-none transition-all duration-200 text-sm font-medium placeholder:text-dark-muted/50"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Tell us what you think or what features you'd like..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-light-border focus:border-brand-500 focus:ring-2 focus:ring-brand-400/30 outline-none transition-all duration-200 text-sm font-medium placeholder:text-dark-muted/50 resize-none"
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Thanks! We received your feedback.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Something went wrong. Please try again.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackMessage.trim()}
                  className="w-full px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-dark-muted/20 disabled:text-dark-muted disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-soft hover:shadow-md-soft"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Feedback'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-light-border bg-light flex gap-3">
            {hasNonDefaultSettings && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-semibold text-dark-muted hover:text-dark transition-colors"
              >
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-xl transition-all duration-200 ease-out shadow-soft hover:shadow-md-soft"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
