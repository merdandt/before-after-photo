import React from 'react';
import { LabelPreset } from '../types';

export const LABEL_PRESETS: LabelPreset[] = [
  { id: 'before-after', leftLabel: 'BEFORE', rightLabel: 'AFTER', displayName: 'Before / After' },
  { id: 'dirty-clean', leftLabel: 'DIRTY', rightLabel: 'CLEAN', displayName: 'Dirty / Clean' },
  { id: 'broken-fixed', leftLabel: 'BROKEN', rightLabel: 'FIXED', displayName: 'Broken / Fixed' },
  { id: 'clogged-clear', leftLabel: 'CLOGGED', rightLabel: 'CLEAR', displayName: 'Clogged / Clear' },
  { id: 'old-new', leftLabel: 'OLD', rightLabel: 'NEW', displayName: 'Old / New' },
];

interface LabelPresetSelectorProps {
  selectedPreset: LabelPreset;
  onPresetChange: (preset: LabelPreset) => void;
}

export const LabelPresetSelector: React.FC<LabelPresetSelectorProps> = ({
  selectedPreset,
  onPresetChange,
}) => {
  return (
    <div className="mb-6">
      <label htmlFor="label-preset" className="block text-sm font-bold text-slate-700 mb-2">
        Label Style
      </label>
      <div className="relative">
        <select
          id="label-preset"
          value={selectedPreset.id}
          onChange={(e) => {
            const preset = LABEL_PRESETS.find((p) => p.id === e.target.value);
            if (preset) onPresetChange(preset);
          }}
          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer appearance-none"
        >
          {LABEL_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.displayName}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-3 flex items-center gap-2 justify-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
          {selectedPreset.leftLabel}
        </span>
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
          {selectedPreset.rightLabel}
        </span>
      </div>
    </div>
  );
};
