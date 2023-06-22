import { createElement } from 'preact';
import type { InputControl } from '../types';

interface Props {
  control: InputControl;
  value: string | number;
  whenChange: (value: string | number) => void
}

export const InputParameterControl = ({ control, value, whenChange }: Props) => {
  return createElement('input', {
    type: control.options?.type,
    value: String(value || ''),
    onChange: (e: InputEvent) => {
      const value = (e.target as HTMLInputElement).value;
      whenChange(control.options?.type === 'number' ? Number(value) : value);
    },
  });
};
