import type { PropType} from 'vue';
import { defineComponent } from 'vue';
import style from './style.module.css';
import VueFeather from 'vue-feather';
import type { ModalAPI } from '.';

export interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  modalApi: ModalAPI;
}

export const ConfirmModal = defineComponent({
  name: 'ConfirmModal',
  props: {
    title: {
      type: String as PropType<ConfirmModalProps['title']>,
      default: '',
    },
    message: {
      type: String as PropType<ConfirmModalProps['message']>,
      required: true,
    },
    confirmText: {
      type: String as PropType<ConfirmModalProps['confirmText']>,
      default: 'OK',
    },
    cancelText: {
      type: String as PropType<ConfirmModalProps['cancelText']>,
      default: 'Cancel',
    },
    onConfirm: {
      type: Function as PropType<ConfirmModalProps['onConfirm']>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    },
    modalApi: {
      type: Object as PropType<ModalAPI>,
      required: true,
    }
  },
  setup(props) {
    return () => (
      <div class={style.backdrop}>
        <div class={style.modal}>
          <div class={style.modalHeader}>
            <span class={style.modalHeaderTitle}>{props.title}</span>
            <button type="button" class={style.modalCloseButton} onClick={props.modalApi.close}>
              <VueFeather class={style.closeIcon} type="x" />
            </button>
          </div>
          <div class={style.modalBody}>{props.message}</div>
          <div class={style.modalFooter}>
            <button type="button" class={style.modalButton} onClick={props.modalApi.close}>{props.cancelText}</button>
            <button type="button" class={style.modalButton} onClick={props.onConfirm}>{props.confirmText}</button>
          </div>
        </div>
      </div>
    );
  },
});
