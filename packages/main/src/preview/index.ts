import entry from './model.js';
import { debounce } from './utils/debounce.js';

const {prepareRender, drawCommands, cameras, controls, entitiesFromSolids} = jscadReglRenderer;
const width = window.innerWidth;
const height = window.innerHeight;

const perspectiveCamera = cameras.perspective;
const orbitControls = controls.orbit;

// process entities and inject extras
const entities = entitiesFromSolids({}, entry());

// prepare the camera
const camera = Object.assign({}, perspectiveCamera.defaults);
perspectiveCamera.setProjection(camera, camera, {width, height});
perspectiveCamera.update(camera, camera);

let glControls = orbitControls.defaults;

const queryParams = new URLSearchParams(window.location.search);

if (queryParams.has('state')) {
  const state: any = JSON.parse(queryParams.get('state')!);
  glControls = { ...glControls, ...state.controls };
  camera.view = Object.values(state.camera.view);
  camera.position = Object.values(state.camera.position);
}

const options = {
  glOptions: {container: document.body},
  camera,
  drawCommands: {
    // draw commands bootstrap themselves the first time they are run
    drawAxis: drawCommands.drawAxis,
    drawGrid: drawCommands.drawGrid,
    drawLines: drawCommands.drawLines,
    drawMesh: drawCommands.drawMesh,
  },
  // data
  entities: [
    {
      // grid data
      // the choice of what draw command to use is also data based
      visuals: {
        drawCmd: 'drawGrid',
        show: true,
      },
      size: [500, 500],
      ticks: [25, 5],
      // color: [0, 0, 1, 1],
      // subColor: [0, 0, 1, 0.5]
    },
    {
      visuals: {
        drawCmd: 'drawAxis',
        show: true,
      },
      size: 300,
      // alwaysVisible: false,
      // xColor: [0, 0, 1, 1],
      // yColor: [1, 0, 1, 1],
      // zColor: [0, 0, 0, 1]
    },
    ...entities,
  ],
};
// prepare
const renderer = prepareRender(options);

// the heart of rendering, as themes, controls, etc change
let updateView = true;

function emitCameraPosition(updates: any) {
  window.postMessage(JSON.stringify(updates));
}

const debouncedEmitCameraPosition = debounce(emitCameraPosition, 100);

const doRotatePanZoom = () => {
  if (rotateDelta[0] || rotateDelta[1]) {
    const updated = orbitControls.rotate(
      {controls: glControls, camera, speed: rotateSpeed},
      rotateDelta,
    );
    glControls = {...glControls, ...updated.controls};
    updateView = true;
    rotateDelta = [0, 0];
  }

  if (panDelta[0] || panDelta[1]) {
    const updated = orbitControls.pan({controls: glControls, camera, speed: panSpeed}, panDelta);
    glControls = {...glControls, ...updated.controls};
    panDelta = [0, 0];
    camera.position = updated.camera.position;
    camera.target = updated.camera.target;
    updateView = true;
  }

  if (zoomDelta) {
    const updated = orbitControls.zoom({controls: glControls, camera, speed: zoomSpeed}, zoomDelta);
    glControls = {...glControls, ...updated.controls};
    zoomDelta = 0;
    updateView = true;
  }
};

const updateAndRender = timestamp => {
  doRotatePanZoom();

  if (updateView) {
    const updates = orbitControls.update({controls: glControls, camera});
    glControls = {...glControls, ...updates.controls};
    updateView = glControls.changed; // for elasticity in rotate / zoom
    debouncedEmitCameraPosition(updates);
    camera.position = updates.camera.position;
    perspectiveCamera.update(camera);

    renderer(options);
  }
  window.requestAnimationFrame(updateAndRender);
};
window.requestAnimationFrame(updateAndRender);

// convert HTML events (mouse movement) to viewer changes
let lastX = 0;
let lastY = 0;

const rotateSpeed = 0.002;
const panSpeed = 1;
const zoomSpeed = 0.08;
let rotateDelta = [0, 0];
let panDelta = [0, 0];
let zoomDelta = 0;
let pointerDown = false;

const moveHandler = ev => {
  if (!pointerDown) return;
  const dx = lastX - ev.pageX;
  const dy = ev.pageY - lastY;

  const shiftKey = ev.shiftKey === true || (ev.touches && ev.touches.length > 2);
  if (shiftKey) {
    panDelta[0] += dx;
    panDelta[1] += dy;
  } else {
    rotateDelta[0] -= dx;
    rotateDelta[1] -= dy;
  }

  lastX = ev.pageX;
  lastY = ev.pageY;

  ev.preventDefault();
};
const downHandler = ev => {
  pointerDown = true;
  lastX = ev.pageX;
  lastY = ev.pageY;
  document.body.setPointerCapture(ev.pointerId);
};

const upHandler = ev => {
  pointerDown = false;
  document.body.releasePointerCapture(ev.pointerId);
};

const wheelHandler = ev => {
  zoomDelta += ev.deltaY;
  ev.preventDefault();
};

document.body.onpointermove = moveHandler;
document.body.onpointerdown = downHandler;
document.body.onpointerup = upHandler;
document.body.onwheel = wheelHandler;
