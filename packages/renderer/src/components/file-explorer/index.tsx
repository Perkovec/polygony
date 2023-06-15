import type { PropType} from 'vue';
import { defineComponent } from 'vue';
import { ref } from 'vue';
import type dirTree from 'directory-tree';
import style from './style.module.css';
import type { TreeItem } from '../tree-view';
import { TreeView } from '../tree-view';

function dirTreeToExplorerTree(treeItem: dirTree.DirectoryTree): TreeItem {
  return {
    id: treeItem.path,
    name: treeItem.name,
    type: treeItem.type,
    children: treeItem.children?.map(item => dirTreeToExplorerTree(item)),
  };
}

export interface FileExplorerProps {
  whenClick: (item: TreeItem) => void;
}

export const FileExplorer = defineComponent({
  name: 'FileExplorer',
  props: {
    whenClick: {
      type: Function as PropType<FileExplorerProps['whenClick']>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    },
  },
  setup(props) {
    const items = ref<TreeItem[]>([]);

    (window as any).fileExplorer.onFolderOpened((event: any, files: dirTree.DirectoryTree) => {
      items.value = dirTreeToExplorerTree(files).children || [];
      console.log(items.value, files);
    });

    return () => {
      return (
        <div class={style.fileExplorer}>
          <TreeView data={items.value} whenClick={props.whenClick}/>
        </div>
      );
    };
  },
});
