import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface Tabs {
  path: string;
  content: string;
  isChanged: boolean;
}

export const useEditorStore = defineStore('editor', () => {
  /*--------------------*/
  /*--------STATE-------*/
  /*--------------------*/

  const currentFile = ref<string>();
  const currentFileContent = ref<string>();
  const tabs = ref<Tabs[]>([]);

  /*--------------------*/
  /*-------GETTERS------*/
  /*--------------------*/

  const fileName = computed(() => currentFile.value?.split('/').pop() || '');

  /*--------------------*/
  /*------MUTATIONS-----*/
  /*--------------------*/

  function setCurrentFile(file: string) {
    currentFile.value = file;
  }

  function setCurrentFileContent(content: string) {
    currentFileContent.value = content;
  }

  function setIsChanged(path: string, value: boolean) {
    const foundTab = tabs.value.findIndex(tab => tab.path === path);
    if (foundTab > -1) {
      tabs.value[foundTab] = { ...tabs.value[foundTab], isChanged: value };
    }
    tabs.value = [...tabs.value];
  }

  function addTab(item: string, content: string) {
    tabs.value.push({
      path: item,
      content,
      isChanged: false,
    });
  }

  function updateTabContent(path: string, content: string) {
    const foundTab = tabs.value.find(tab => tab.path === path);
    if (foundTab) {
      foundTab.content = content;
    }
  }

  /*--------------------*/
  /*-------ACTIONS------*/
  /*--------------------*/

  async function openFile(path: string) {
    const foundTab = tabs.value.find(tab => tab.path === path);
    let content = '';
    if (foundTab) {
      content = foundTab.content;
    } else {
      content = await window.fileExplorer.readFileContent(path);
    }
    await window.devServer.serveFile(path);

    if (!foundTab) {
      addTab(path, content);
    }
    setCurrentFile(path);
    setCurrentFileContent(content);
  }

  async function closeFile(path: string) {
    const pathIndex = tabs.value.findIndex(tab => tab.path === path);
    if (pathIndex === -1) {
      return;
    }

    if (path === currentFile.value) {
      let newPath = '';
      if (tabs.value.length > 1) {
        const delta = pathIndex > 0 ? -1 : 1;
        newPath = tabs.value[pathIndex + delta].path || '';
      }

      if (newPath) {
        await openFile(newPath);
      } else {
        setCurrentFile('');
        setCurrentFileContent('');
      }
    }

    tabs.value.splice(pathIndex, 1);
    tabs.value = [...tabs.value];
  }

  async function saveFile(newContent: string) {
    if (!currentFile.value) {
      return;
    }
    const result = await window.fileExplorer.saveFile(currentFile.value, newContent);
    if (result) {
      updateTabContent(currentFile.value, newContent);
      setIsChanged(currentFile.value, false);
    }
    return result;
  }

  async function updateTabPath(oldPath: string, newPath: string) {
    const foundTab = tabs.value.findIndex(tab => tab.path === oldPath);

    if (foundTab > -1) {
      tabs.value[foundTab] = {
        ...tabs.value[foundTab],
        path: newPath,
      };
      tabs.value = [...tabs.value];
    }

    if (oldPath === currentFile.value) {
      setCurrentFile(newPath);
      await window.devServer.serveFile(newPath);
    }
  }

  return {
    // STATE
    currentFile,
    currentFileContent,
    tabs,

    // GETTERS
    fileName,

    // MUTATIONS
    setCurrentFile,
    setCurrentFileContent,
    setIsChanged,

    // ACTIONS
    openFile,
    saveFile,
    closeFile,
    updateTabPath,
  };
});
