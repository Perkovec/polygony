import type { PropType} from 'vue';
import { defineComponent } from 'vue';
import style from './style.module.css';
import { Tab } from './tab';

interface Props {
  tabs?: string[];
  activeTab?: string;
  whenClick?: (item: string) => void;
  whenClose?: (item: string) => void;
}

export const TabBar = defineComponent({
  name: 'TabBar',
  props: {
    tabs: {
      type: Array as PropType<NonNullable<Props['tabs']>>,
      default: () => [],
    },
    activeTab: {
      type: String,
      default: undefined,
    },
    whenClose: {
      type: Function as PropType<NonNullable<Props['whenClose']>>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    },
    whenClick: {
      type: Function as PropType<NonNullable<Props['whenClick']>>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    },
  },
  setup(props) {
    return () => (
      <div class={style.wrapper}>
        {props.tabs.map((tab) => <Tab
          item={tab}
          isActive={tab === props.activeTab}
          whenClick={props.whenClick}
          whenClose={props.whenClose}
        />)}
      </div>
    );
  },
});
