import type { PropType} from 'vue';
import { computed, defineComponent } from 'vue';

import style from './style.module.css';
import VueFeather from 'vue-feather';
import type { Tabs } from '/@/store/editor';

interface Props {
  item: Tabs;
  isActive?: boolean;
  whenClick?: (item: string) => void;
  whenClose?: (item: string) => void;
}

export const Tab = defineComponent({
  name: 'Tab',
  props: {
    item: {
      type: Object as PropType<NonNullable<Props['item']>>,
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
    },
  },
  setup(props) {
    const fileName = computed(() => props.item.path.split('/').pop() || '');

    function handleClick() {
      props.whenClick?.(props.item.path);
    }

    function handleClose(event: MouseEvent) {
      event.stopPropagation();
      props.whenClose?.(props.item.path);
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
        <span class={[
          style.fileName,
          {
            [style.changed]: props.item.isChanged,
          },
        ]}>
          {fileName.value}{props.item.isChanged ? '*' : ''}
          </span>
        <button type="button" class={style.closeButton} onClick={handleClose}>
          <VueFeather class={style.closeIcon} type="x" />
        </button>
      </div>
    );
  },
});
