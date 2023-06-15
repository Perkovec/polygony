import {createApp} from 'vue';
import { App } from './App';
import './lib/monaco-worker';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import './global.css';

createApp(App).mount('#app');
