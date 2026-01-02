// Google Analytics 4 Event Tracking Utility

// Extend the Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

// Define event names as constants for type safety
export const AnalyticsEvents = {
  // Image Upload Events
  BEFORE_IMAGE_UPLOAD: 'before_image_upload',
  AFTER_IMAGE_UPLOAD: 'after_image_upload',

  // Label & Settings Events
  LABEL_PRESET_SELECTED: 'label_preset_selected',
  SETTINGS_CHANGED: 'settings_changed',

  // Processing Events
  GENERATE_COMPARISON: 'generate_comparison',
  PROCESSING_ERROR: 'processing_error',

  // Result Events
  IMAGE_DOWNLOAD: 'image_download',
  SHARE_METHOD_USED: 'share_method_used',
  CREATE_NEW: 'create_new',
} as const;

// Event parameter types for type safety
export interface ImageUploadParams {
  file_size_kb: number;
  file_type: string;
}

export interface LabelPresetParams {
  preset_name: string;
  before_label: string;
  after_label: string;
}

export interface SettingsChangedParams {
  setting_type: 'format' | 'orientation' | 'quality';
  new_value: string | number;
}

export interface GenerateComparisonParams {
  orientation: 'horizontal' | 'vertical';
  target_format: string;
  before_label: string;
  after_label: string;
}

export interface ProcessingErrorParams {
  error_message: string;
  error_stage: 'upload' | 'processing' | 'download';
}

export interface ImageDownloadParams {
  download_method: 'share_api' | 'download_link' | 'new_tab_fallback';
  processing_time_ms?: number;
}

export interface ShareMethodParams {
  method: 'native_share' | 'download' | 'fallback';
}

// Main analytics tracking function
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);

    // Optional: Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventName, eventParams);
    }
  }
};

// Convenience functions for specific events
export const analytics = {
  // Image Upload Tracking
  trackBeforeImageUpload: (params: ImageUploadParams) => {
    trackEvent(AnalyticsEvents.BEFORE_IMAGE_UPLOAD, params);
  },

  trackAfterImageUpload: (params: ImageUploadParams) => {
    trackEvent(AnalyticsEvents.AFTER_IMAGE_UPLOAD, params);
  },

  // Label & Settings Tracking
  trackLabelPresetSelected: (params: LabelPresetParams) => {
    trackEvent(AnalyticsEvents.LABEL_PRESET_SELECTED, params);
  },

  trackSettingsChanged: (params: SettingsChangedParams) => {
    trackEvent(AnalyticsEvents.SETTINGS_CHANGED, params);
  },

  // Processing Tracking
  trackGenerateComparison: (params: GenerateComparisonParams) => {
    trackEvent(AnalyticsEvents.GENERATE_COMPARISON, params);
  },

  trackProcessingError: (params: ProcessingErrorParams) => {
    trackEvent(AnalyticsEvents.PROCESSING_ERROR, params);
  },

  // Result Tracking
  trackImageDownload: (params: ImageDownloadParams) => {
    trackEvent(AnalyticsEvents.IMAGE_DOWNLOAD, params);
  },

  trackShareMethod: (params: ShareMethodParams) => {
    trackEvent(AnalyticsEvents.SHARE_METHOD_USED, params);
  },

  trackCreateNew: () => {
    trackEvent(AnalyticsEvents.CREATE_NEW);
  },
};
