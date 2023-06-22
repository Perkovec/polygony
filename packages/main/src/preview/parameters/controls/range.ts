import { createElement } from 'preact';
import type { RangeControl } from '../types';

interface Props {
  control: RangeControl;
  value: number;
  whenChange: (value: number) => void
}

export const RangeParameterControl = ({ control, value, whenChange }: Props) => {
  return createElement('input', {
    type: 'range',
    min: control.options?.min ? String(control.options.min) : undefined,
    max: control.options?.max ? String(control.options.max) : undefined,
    step: control.options?.step ? String(control.options.step) : undefined,
    value: String(value || 0),
    onChange: (e: InputEvent) => whenChange(Number((e.target as HTMLInputElement).value)),
  });
};
