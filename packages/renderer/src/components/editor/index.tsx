import { defineComponent, onMounted, ref, watch } from 'vue';
import { editor as MonacoEditor, KeyMod, KeyCode } from 'monaco-editor';
import '/@/lib/editor-themes/one-dark-pro';

import style from './style.module.css';
import { useEditorStore } from '/@/store/editor';
import { TabBar } from '../tabbar';

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

      editor?.onDidChangeModelContent(() => editorStore.setIsChanged(true));

      editor.addAction({
        id: 'save_file',
        label: 'Save',
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
        run: (ed) => editorStore.saveFile(ed.getValue()),
      });
    });

    watch(() => editorStore.currentFileContent, (newValue) => {
      if (editor?.getValue() !== newValue) {
        editor?.setValue(newValue || '');
        editorStore.setIsChanged(false);
      }
    });

    function handleTabClick(item: string) {
      editorStore.openFile(item);
    }

    function handleTabClose(item: string) {
      editorStore.closeFile(item);
    }

    return () => (
      <div class={style.wrapper}>
        {/*<div class={style.statusBar}>{editorStore.fileName} {editorStore.isChanged ? <b>*</b> : null}</div>*/}
        <TabBar
          tabs={editorStore.tabs}
          activeTab={editorStore.currentFile}
          whenClick={handleTabClick}
          whenClose={handleTabClose}
        />
        <div class={style.editorContrainer} ref={containerRef}></div>
      </div>
    );
  },
});
