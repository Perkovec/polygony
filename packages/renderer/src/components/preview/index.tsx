import { defineComponent } from 'vue';
import style from './style.module.css';

export interface PreviewProps {
  url: string;
}

export const Preview = defineComponent({
  name: 'Preview',
  props: {
    url: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return () => (
      <div class={style.wrapper}>
        <iframe class={style.iframe} src={props.url}></iframe>
      </div>
    );
  },
});
