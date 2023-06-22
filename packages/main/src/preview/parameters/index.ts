import type { ComponentType} from 'preact';
import { createElement, render } from 'preact';
import { useState } from 'preact/compat';
import type { Control } from './types';
import { InputParameterControl } from './controls/input';
import { RangeParameterControl } from './controls/range';

interface Props {
  controls: Control[]
  form: any
  whenChange: (form: any) => void
}

const controlsComponents = {
  input: InputParameterControl,
  range: RangeParameterControl,
};

const Parameters = ({ controls = [], form, whenChange }: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return createElement('div', { class: `parametersWrapper ${!isExpanded ? 'noPadding' : ''}` },
    createElement(
      'div',
      { class: 'parametersHeader' },
      isExpanded ? createElement('b', {}, 'Parameters') : null,
      createElement('button', {
        onClick: () => setIsExpanded(!isExpanded),
        class: 'parametersButton',
        dangerouslySetInnerHTML: { __html: isExpanded ? '&LowerLeftArrow;' : '&UpperRightArrow;' },
      }),
    ),
    isExpanded
      ? createElement(
        'div',
        { class: 'parametersControls' },
        ...controls.map((control) => {
          const parameterControl = controlsComponents[control.control];
          return createElement(
            'div',
            { class: 'parameterField' },
            createElement(
              'label',
              {},
              `${control.id}:`,
            ),
            createElement(
              parameterControl as ComponentType<any>,
              {
                control,
                value: form[control.id],
                whenChange: (value: any) => whenChange({ ...form, [control.id]: value }),
              },
              null,
            ),
          );
        }),
      )
      : null,
  );
};

export const mountParameters = (props: Omit<Props, 'form'>) => {
  const container = document.getElementById('parameters');

  let form: any = {};

  function handleChange(newForm: any) {
    form = newForm;
    props.whenChange(newForm);
  }

  if (container) {
    render(createElement(Parameters, { ...props, form, whenChange: handleChange }), container);
  }
};