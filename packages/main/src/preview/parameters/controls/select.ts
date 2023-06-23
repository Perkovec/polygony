import { createElement } from 'preact';
import type { SelectControl } from '../types';

interface Props {
  control: SelectControl;
  value: string;
  whenChange: (value: string) => void
}

export const SelectParameterControl = ({ control, value, whenChange }: Props) => {
  return createElement(
    'select',
    {
      value: String(value || 0),
      onChange: (e: InputEvent) => whenChange((e.target as HTMLInputElement).value),
    },
    ...(control.options?.items.map((item) => createElement(
      'option',
      { value: item.value },
      item.label,
    )) || []),
  );
};
