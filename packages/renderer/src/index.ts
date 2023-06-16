import {createApp} from 'vue';
import { App } from './App';
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import './lib/monaco-worker';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import './global.css';
import ContextMenu from '@imengyu/vue3-context-menu';
import { ModalInstaller } from './components/modals';

const app = createApp(App);

app.use(ModalInstaller);
app.use(ContextMenu);

app.mount('#app');
