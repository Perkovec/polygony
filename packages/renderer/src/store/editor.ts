import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useEditorStore = defineStore('editor', () => {
  /*--------------------*/
  /*--------STATE-------*/
  /*--------------------*/

  const currentFile = ref<string>();
  const currentFileContent = ref<string>();
  const isChanged = ref(false);

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

  /*--------------------*/
  /*-------ACTIONS------*/
  /*--------------------*/

  async function openFile(path: string) {
    const content = await window.fileExplorer.readFileContent(path);
    await window.devServer.serveFile(path);

    setCurrentFile(path);
    setCurrentFileContent(content);
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

    // GETTERS
    fileName,

    // MUTATIONS
    setCurrentFile,
    setCurrentFileContent,
    setIsChanged,

    // ACTIONS
    openFile,
    saveFile,
  };
});
