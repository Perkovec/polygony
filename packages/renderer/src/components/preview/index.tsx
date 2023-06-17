import { defineComponent } from 'vue';
import style from './style.module.css';
import { usePreviewStore } from '/@/store/preview';

export const Preview = defineComponent({
  name: 'Preview',
  setup() {
    const previewStore = usePreviewStore();

    return () => (
      <div class={style.wrapper}>
        <iframe class={style.iframe} src={previewStore.previewUrl}></iframe>
      </div>
    );
  },
});
