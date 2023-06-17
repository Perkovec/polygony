import { defineComponent, onMounted, ref, watch } from 'vue';
import { editor as MonacoEditor } from 'monaco-editor';
import '/@/lib/editor-themes/one-dark-pro';

import style from './style.module.css';
import { useEditorStore } from '/@/store/editor';

export interface EditorPublicInstance {
  setContent: (value: string) => void;
}

export const Editor = defineComponent({
  name: 'Editor',
  setup() {
    const editorStore = useEditorStore();
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

    watch(() => editorStore.currentFileContent, (newValue) => {
      editor?.setValue(newValue || '');
    });

    return () => <div class={style.wrapper} ref={containerRef}></div>;
  },
});
