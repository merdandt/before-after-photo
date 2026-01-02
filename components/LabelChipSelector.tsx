import React from 'react';
import { LabelPreset } from '../types';
import { analytics } from '../utils/analytics';

export const LABEL_PRESETS: LabelPreset[] = [
  { id: 'before-after', leftLabel: 'BEFORE', rightLabel: 'AFTER', displayName: 'Before / After' },
  { id: 'dirty-clean', leftLabel: 'DIRTY', rightLabel: 'CLEAN', displayName: 'Dirty / Clean' },
  { id: 'broken-fixed', leftLabel: 'BROKEN', rightLabel: 'FIXED', displayName: 'Broken / Fixed' },
  { id: 'clogged-clear', leftLabel: 'CLOGGED', rightLabel: 'CLEAR', displayName: 'Clogged / Clear' },
  { id: 'old-new', leftLabel: 'OLD', rightLabel: 'NEW', displayName: 'Old / New' },
];

interface LabelChipSelectorProps {
  selectedPreset: LabelPreset;
  onPresetChange: (preset: LabelPreset) => void;
}

export const LabelChipSelector: React.FC<LabelChipSelectorProps> = ({
  selectedPreset,
  onPresetChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-center gap-2">
        {LABEL_PRESETS.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                onPresetChange(preset);
                // Track label preset selection
                analytics.trackLabelPresetSelected({
                  preset_name: preset.displayName,
                  before_label: preset.leftLabel,
                  after_label: preset.rightLabel,
                });
              }}
              className={`
                inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                transition-all duration-200 ease-out
                ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md-soft scale-[1.02]'
                    : 'bg-white text-dark border border-light-border hover:border-brand-300 hover:bg-brand-50 shadow-sm-soft'
                }
              `}
            >
              <span className="font-semibold">{preset.displayName}</span>
              {isSelected && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Preview */}
      <div className="flex items-center gap-2 justify-center py-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-light-gray">
          <span className="text-xs font-bold text-dark-muted tracking-wide">
            {selectedPreset.leftLabel}
          </span>
          <svg className="w-3.5 h-3.5 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-xs font-bold text-dark-muted tracking-wide">
            {selectedPreset.rightLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
