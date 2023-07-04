import { createElement } from 'preact';
import type { SeparatorControl } from '../types';


interface Props {
  control: SeparatorControl;
}

export const SeparatorParameterControl = ({ control }: Props) => {
  return createElement(
    'div',
    {
      class: 'parametersSeparator',
    },
    control.options?.label && createElement('span', {}, control.options?.label),
  );
};
