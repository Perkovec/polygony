import type { PropType} from 'vue';
import { computed, defineComponent } from 'vue';

import style from './style.module.css';
import VueFeather from 'vue-feather';

interface Props {
  item: string;
  isActive?: boolean;
  whenClick?: (item: string) => void;
  whenClose?: (item: string) => void;
}

export const Tab = defineComponent({
  name: 'Tab',
  props: {
    item: {
      type: String as PropType<NonNullable<Props['item']>>,
      required: true,
    },
    isActive: {
      type: Boolean as PropType<NonNullable<Props['isActive']>>,
      default: false,
    },
    whenClick: {
      type: Function as PropType<NonNullable<Props['whenClick']>>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    },
    whenClose: {
      type: Function as PropType<NonNullable<Props['whenClose']>>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    }
  },
  setup(props) {
    const fileName = computed(() => props.item.split('/').pop() || '');

    function handleClick() {
      props.whenClick?.(props.item);
    }

    function handleClose(event: MouseEvent) {
      event.stopPropagation();
      props.whenClose?.(props.item);
    }

    return () => (
      <div
        class={[
          style.tab,
          {
            [style.active]: props.isActive,
          },
        ]}
        onClick={handleClick}
      >
        <span class={style.fileName}>{fileName.value}</span>
        <button type="button" class={style.closeButton} onClick={handleClose}>
          <VueFeather class={style.closeIcon} type="x" />
        </button>
      </div>
    );
  },
});
