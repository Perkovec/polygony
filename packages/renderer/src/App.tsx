import type { ComponentPublicInstance} from 'vue';
import { defineComponent, ref } from 'vue';
import { FileExplorer } from './components/file-explorer';
import style from './style.module.css';
import type { EditorPublicInstance } from './components/editor';
import { Editor } from './components/editor';
import { Preview } from './components/preview';
import type { TreeItem } from './components/tree-view';

export const App = defineComponent({
  name: 'App',
  setup() {
    const editorRef = ref<ComponentPublicInstance<unknown, EditorPublicInstance>>();
    const previewUrl = ref('');

    async function handleFileClick(item: TreeItem) {
      const content = await (window as any).fileExplorer.readFileContent(item.id);

      editorRef.value?.setContent(content);

      const url = await (window as any).devServer.serveFile(item.id);
      previewUrl.value = url;
    }

    return () => (
      <div class={style.wrapper}>
        <div class={style.fileExplorer}>
          <FileExplorer whenClick={handleFileClick}/>
        </div>

        <div class={style.editor}>
          <Editor ref={editorRef} />
        </div>

        <div class={style.preview}>
          <Preview url={previewUrl.value} />
        </div>
      </div>
    );
  },
});
