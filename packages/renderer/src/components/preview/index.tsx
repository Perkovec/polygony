import { defineComponent, onMounted, ref, watch } from 'vue';
import style from './style.module.css';
import { usePreviewStore } from '/@/store/preview';
import { useEditorStore } from '/@/store/editor';

export const Preview = defineComponent({
  name: 'Preview',
  setup() {
    const previewStore = usePreviewStore();
    const editorStore = useEditorStore();

    const iframeRef = ref<HTMLIFrameElement>();

    const url = ref();

    onMounted(() => {
      window.devServer.onUpdateServer((_: unknown, address: string) => {
        previewStore.setPreviewUrl(address);
        handlePreviewUrlUpdate();
      });
    });

    function handlePreviewUrlUpdate() {
      const params = new URLSearchParams();

      params.set('v', new Date().getTime().toString());

      const savedCameraState: any = localStorage.getItem(`cameraState:${editorStore.currentFile}`);

      if (savedCameraState) {
        params.set('state', savedCameraState);
      }

      url.value = previewStore.previewUrl + '?' + params.toString();
    }

    function handlePreviewLoad() {
      iframeRef.value?.contentWindow?.addEventListener('message', (event) => {
        localStorage.setItem(`cameraState:${editorStore.currentFile}`, event.data);
      });
    }

    return () => (
      <div class={style.wrapper}>
        {Boolean(editorStore.currentFile) && <iframe onLoad={handlePreviewLoad} ref={iframeRef} class={style.iframe} src={url.value} />}
      </div>
    );
  },
});
