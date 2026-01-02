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
