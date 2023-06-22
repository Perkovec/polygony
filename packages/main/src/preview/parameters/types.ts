export interface BaseControl {
  id: string
}

export interface RangeControl extends BaseControl {
  control: 'range',
  options?: {
    min?: number,
    max?: number,
    step?: number
  }
}

export interface InputControl extends BaseControl {
  control: 'input',
  options?: {
    type?: 'number' | 'text',
  }
}

export type Control = RangeControl | InputControl;
