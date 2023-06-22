import * as entry from './model.js';
import { debounce } from './utils/debounce.js';
import { Renderer } from './renderer';
import { mountParameters } from './parameters/index.js';

const renderer = new Renderer();

const queryParams = new URLSearchParams(window.location.search);
if (queryParams.has('state')) {
  const state: any = JSON.parse(queryParams.get('state')!);
  renderer.updateControlsState(state.controls);
  renderer.updateCameraState({
    view: Object.values(state.camera.view),
    position: Object.values(state.camera.position),
  });
}

renderer.setEntities(entry.default({}));

renderer.run();

const emitCameraPosition = debounce((updates: any) => {
  window.postMessage(JSON.stringify(updates));
}, 100);

renderer.on('cameraState', emitCameraPosition);

if (entry.parameters) {
  mountParameters({ controls: entry.parameters, whenChange: (form) => renderer.setEntities(entry.default(form)) });
}
