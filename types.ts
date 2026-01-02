export interface ProcessedImage {
  src: string;
  width: number;
  height: number;
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface LabelConfig {
  text: string;
  align: 'left' | 'right';
  imageX: number;
  imageW: number;
}

export interface LabelPreset {
  id: string;
  leftLabel: string;
  rightLabel: string;
  displayName: string;
}

export type LayoutOrientation = 'horizontal' | 'vertical';

export type SocialFormat = 'original' | 'instagram-square' | 'instagram-story' | 'facebook-post' | 'twitter-post';

export interface OutputSettings {
  format: SocialFormat;
  orientation: LayoutOrientation;
  quality: number;
}

export interface ImageProcessingOptions {
  beforeLabel: string;
  afterLabel: string;
  orientation: LayoutOrientation;
  targetFormat?: SocialFormat;
}
