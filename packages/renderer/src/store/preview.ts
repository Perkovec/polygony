import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePreviewStore = defineStore('preview', () => {
  /*--------------------*/
  /*--------STATE-------*/
  /*--------------------*/

  const previewUrl = ref<string>();

  /*--------------------*/
  /*------MUTATIONS-----*/
  /*--------------------*/

  function setPreviewUrl(url: string) {
    previewUrl.value = url;
  }

  return {
    // STATE
    previewUrl,

    // MUTATIONS
    setPreviewUrl,
  };
});
