export interface BaseControl {
  id: string
}

export interface RangeControl extends BaseControl {
  control: 'range',
  defaultValue?: number,
  options?: {
    min?: number,
    max?: number,
    step?: number
  }
}

export interface InputControl extends BaseControl {
  control: 'input',
  defaultValue?: string | number,
  options?: {
    type?: 'number' | 'text',
  }
}

export interface SelectControl extends BaseControl {
  control: 'select',
  defaultValue?: string,
  options?: {
    items: { value: string, label: string }[]
  }
}

export type Control = RangeControl | InputControl | SelectControl;
