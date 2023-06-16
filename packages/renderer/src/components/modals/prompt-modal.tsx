import type { PropType} from 'vue';
import { defineComponent, ref } from 'vue';
import type { ModalAPI } from '.';
import style from './style.module.css';
import VueFeather from 'vue-feather';

export interface PromptModalProps {
  title?: string;
  message: string;
  onConfirm?: (text: string) => void;
  modalApi: ModalAPI;
}

export const PromptModal = defineComponent({
  name: 'PromptModal',
  props: {
    title: {
      type: String as PropType<PromptModalProps['title']>,
      default: '',
    },
    message: {
      type: String as PropType<PromptModalProps['message']>,
      required: true,
    },
    onConfirm: {
      type: Function as PropType<PromptModalProps['onConfirm']>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    },
    modalApi: {
      type: Object as PropType<ModalAPI>,
      required: true,
    },
  },
  setup(props) {
    const text = ref('');

    function handleConfirm() {
      props.modalApi.close();
      props.onConfirm?.(text.value);
    }

    function handleChange(e: Event) {
      text.value = (e.target as HTMLInputElement).value;
    }

    return () => (
      <div class={style.backdrop}>
        <div class={style.modal}>
          <div class={style.modalHeader}>
            <span class={style.modalHeaderTitle}>{props.title}</span>
            <button type="button" class={style.modalCloseButton} onClick={props.modalApi.close}>
              <VueFeather class={style.closeIcon} type="x" />
            </button>
          </div>
          <div class={style.modalBody}>
            {props.message}
            <input type="text" class={style.modalInput} value={text.value} onInput={handleChange} />
          </div>
          <div class={style.modalFooter}>
            <button type="button" class={style.modalButton} onClick={props.modalApi.close}>Cancel</button>
            <button type="button" class={style.modalButton} onClick={handleConfirm}>OK</button>
          </div>
        </div>
      </div>
    );
  },
});
