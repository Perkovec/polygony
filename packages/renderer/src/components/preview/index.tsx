import { defineComponent, onMounted, ref, watch } from 'vue';
import style from './style.module.css';
import { usePreviewStore } from '/@/store/preview';
import { useEditorStore } from '/@/store/editor';

export const Preview = defineComponent({
  name: 'Preview',
  setup() {
    const previewStore = usePreviewStore();
    const editorStore = useEditorStore();

    const url = ref();

    onMounted(() => {
      window.devServer.onUpdateServer((_: unknown, address: string) => {
        previewStore.setPreviewUrl(address);
        url.value = address + '?v=' + new Date().getTime();
      });
    });

    watch(
      () => previewStore.previewUrl,
      () => {
        url.value = previewStore.previewUrl + '?v=' + new Date().getTime();
      },
    );

    return () => (
      <div class={style.wrapper}>
        {Boolean(editorStore.currentFile) && <iframe class={style.iframe} src={url.value} />}
      </div>
    );
  },
});
