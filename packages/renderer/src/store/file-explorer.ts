import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TreeItem } from '../components/tree-view';
import { dirTreeToExplorerTree } from '../lib/dir-tree';
import type dirTree from 'directory-tree';

export const useFileExplorer = defineStore('fileExplorer', () => {
  /*--------------------*/
  /*--------STATE-------*/
  /*--------------------*/

  const projectPath = ref<string>();
  const fileTree = ref<TreeItem[]>([]);

  /*--------------------*/
  /*------MUTATIONS-----*/
  /*--------------------*/

  function setProjectPath(path: string) {
    projectPath.value = path;
  }

  function setFileTree(tree: TreeItem[]) {
    fileTree.value = tree;
  }

  function setDirTree(tree: dirTree.DirectoryTree) {
    setFileTree(dirTreeToExplorerTree(tree).children || []);
  }

  /*--------------------*/
  /*-------ACTIONS------*/
  /*--------------------*/

  async function updateFileTree() {
    const files = await (window as any).fileExplorer.getFiles();
    setDirTree(files);
  }

  return {
    // STATE
    projectPath,
    fileTree,

    // MUTATIONS
    setProjectPath,
    setDirTree,

    // ACTIONS
    updateFileTree,
  };
});
