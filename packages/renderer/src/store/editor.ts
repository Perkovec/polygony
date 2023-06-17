import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePreviewStore } from './preview';

export const useEditorStore = defineStore('editor', () => {
  const previewStore = usePreviewStore();

  /*--------------------*/
  /*--------STATE-------*/
  /*--------------------*/

  const currentFile = ref<string>();
  const currentFileContent = ref<string>();

  /*--------------------*/
  /*------MUTATIONS-----*/
  /*--------------------*/

  function setCurrentFile(file: string) {
    currentFile.value = file;
  }

  function setCurrentFileContent(content: string) {
    currentFileContent.value = content;
  }

  /*--------------------*/
  /*-------ACTIONS------*/
  /*--------------------*/

  async function openFile(path: string) {
    const content = await window.fileExplorer.readFileContent(path);
    const url = await window.devServer.serveFile(path);

    setCurrentFile(path);
    setCurrentFileContent(content);
    previewStore.setPreviewUrl(url);
  }

  return {
    // STATE
    currentFile,
    currentFileContent,

    // MUTATIONS
    setCurrentFile,
    setCurrentFileContent,

    // ACTIONS
    openFile,
  };
});
