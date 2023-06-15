import { defineComponent, onMounted, ref } from 'vue';
import { editor as MonacoEditor } from 'monaco-editor';
import '/@/lib/editor-themes/one-dark-pro';

import style from './style.module.css';

export interface EditorPublicInstance {
  setContent: (value: string) => void;
}

export const Editor = defineComponent({
  name: 'Editor',
  setup(props, { expose }) {
    const containerRef = ref<HTMLElement>();

    let editor: ReturnType<typeof MonacoEditor.create> | undefined;

    onMounted(() => {
      if (!containerRef.value) {
        return;
      }

      editor = MonacoEditor.create(containerRef.value, {
        value: '',
        language: 'javascript',
        revealHorizontalRightPadding: 0,
        automaticLayout: true,
        theme: 'OneDark-Pro',
        wordWrap: 'on',
        minimap: {
          enabled: false,
        },
      });
    });

    function setContent(value: string) {
      // const model = MonacoEditor.createModel(value);
      editor?.setValue(value);
    }

    const instance: EditorPublicInstance = {
      setContent,
    };
    expose(instance);

    return () => <div class={style.wrapper} ref={containerRef}></div>;
  },
});
