import { defineComponent } from 'vue';
import { FileExplorer } from './components/file-explorer';
import style from './style.module.css';
import { Editor } from './components/editor';
import { Preview } from './components/preview';

export const App = defineComponent({
  name: 'App',
  setup() {
    return () => (
      <div class={style.wrapper}>
        <div class={style.fileExplorer}>
          <FileExplorer />
        </div>

        <div class={style.editorContainer}>
          <div class={style.editor}>
            <Editor />
          </div>

          <div class={style.preview}>
            <Preview />
          </div>
        </div>
      </div>
    );
  },
});
