import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useEditorStore = defineStore('editor', () => {
  /*--------------------*/
  /*--------STATE-------*/
  /*--------------------*/

  const currentFile = ref<string>();
  const currentFileContent = ref<string>();
  const isChanged = ref(false);
  const tabs = ref<string[]>([]);

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

  function setIsChanged(value: boolean) {
    isChanged.value = value;
  }

  function addTab(item: string) {
    if (!tabs.value.includes(item)) {
      tabs.value.push(item);
    }
  }

  /*--------------------*/
  /*-------ACTIONS------*/
  /*--------------------*/

  async function openFile(path: string) {
    const content = await window.fileExplorer.readFileContent(path);
    await window.devServer.serveFile(path);

    addTab(path);
    setCurrentFile(path);
    setCurrentFileContent(content);
  }

  async function closeFile(path: string) {
    const pathIndex = tabs.value.indexOf(path);
    if (pathIndex === -1) {
      return;
    }

    if (path === currentFile.value) {
      let newPath = '';
      if (tabs.value.length > 1) {
        const delta = pathIndex > 0 ? -1 : 1;
        newPath = tabs.value[pathIndex + delta] || '';
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
      setIsChanged(false);
    }
    return result;
  }

  return {
    // STATE
    currentFile,
    currentFileContent,
    isChanged,
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
  };
});
