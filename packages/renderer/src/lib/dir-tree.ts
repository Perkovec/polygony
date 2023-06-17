import type dirTree from 'directory-tree';
import type { TreeItem } from '../components/tree-view';

export function dirTreeToExplorerTree(treeItem: dirTree.DirectoryTree): TreeItem {
  return {
    id: treeItem.path,
    name: treeItem.name,
    type: treeItem.type,
    children: treeItem.children?.map(item => dirTreeToExplorerTree(item)),
  };
}
