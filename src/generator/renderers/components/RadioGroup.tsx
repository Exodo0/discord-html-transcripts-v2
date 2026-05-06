import React from 'react';

interface RadioOption {
  label: string;
  value: string;
  description?: string;
}

interface DiscordRadioGroupProps {
  options: RadioOption[];
  defaultValues?: readonly string[];
}

function DiscordRadioGroup({ options, defaultValues }: DiscordRadioGroupProps) {
  const selectedValues = new Set(defaultValues ?? []);

  return (
    <div
      className="discord-radio-group"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px 0',
        fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: '14px',
        color: '#dbdee1',
      }}
    >
      {options.map((option, idx) => {
        const isSelected = selectedValues.has(option.value);
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: '4px',
              cursor: 'default',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: isSelected ? 'none' : '2px solid #72767d',
                backgroundColor: isSelected ? '#5865f2' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
              }}
            >
              {isSelected && (
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                  }}
                />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ lineHeight: '1.25', color: '#dbdee1' }}>{option.label}</span>
              {option.description && (
                <span
                  style={{
                    fontSize: '12px',
                    color: '#949ba4',
                    lineHeight: '1.25',
                  }}
                >
                  {option.description}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DiscordRadioGroup;
