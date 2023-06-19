import { defineComponent, onMounted, ref, watch } from 'vue';
import style from './style.module.css';
import { usePreviewStore } from '/@/store/preview';

export const Preview = defineComponent({
  name: 'Preview',
  setup() {
    const iframeRef = ref<HTMLIFrameElement | null>(null);
    const previewStore = usePreviewStore();

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
        <iframe class={style.iframe} src={url.value}></iframe>
      </div>
    );
  },
});
