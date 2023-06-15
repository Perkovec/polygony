import esbuild from 'esbuild';
import fs from 'fs/promises';
import path from 'path';
import dirTree from 'directory-tree';
import { ipcMain } from 'electron';

export class DevServer {
  private currentFolder?: string;
  private currentFile?: string;
  private esContext?: esbuild.BuildContext;
  private host?: string;
  private port?: number;

  constructor() {
    ipcMain.handle('devServer:serveFile', (event: any, path: string) => this.setCurrentFile(path));
  }

  private plainArrayFromDirTree(tree: dirTree.DirectoryTree) {
    const array: string[] = [];
    tree.children?.forEach((child) => {
      if (child.type === 'directory') {
        array.push(...this.plainArrayFromDirTree(child));
      } else {
        array.push(child.path);
      }
    });
    return array;
  }

  private async writeIndexHtml(entryPoint: string) {
    if (!this.currentFolder) {
      return;
    }

    const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Document</title>
      <style>
        body {
          margin: 0;
          width: 100%;
          height: 100%;
        }
        #jscad {
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="jscad"></div>
      <script src="https://unpkg.com/@jscad/modeling@2.11.1/dist/jscad-modeling.min.js"></script>
      <script src="https://unpkg.com/@jscad/regl-renderer@2.6.6/dist/jscad-regl-renderer.min.js"></script>
      <script type="module">
        import entry from '/${path.relative(this.currentFolder, entryPoint)}';

        const { prepareRender, drawCommands, cameras, controls, entitiesFromSolids } = jscadReglRenderer
        const width = window.innerWidth
        const height = window.innerHeight

        const perspectiveCamera = cameras.perspective
        const orbitControls = controls.orbit

        // process entities and inject extras
        const entities = entitiesFromSolids({}, entry())

        // prepare the camera
        const camera = Object.assign({}, perspectiveCamera.defaults)
        perspectiveCamera.setProjection(camera, camera, { width, height })
        perspectiveCamera.update(camera, camera)

        let glControls = orbitControls.defaults;

        const options = {
          glOptions: { container: document.body },
          camera,
          drawCommands: {
            // draw commands bootstrap themselves the first time they are run
            drawAxis: drawCommands.drawAxis,
            drawGrid: drawCommands.drawGrid,
            drawLines: drawCommands.drawLines,
            drawMesh: drawCommands.drawMesh
          },
          // data
          entities: [
            { // grid data
              // the choice of what draw command to use is also data based
              visuals: {
                drawCmd: 'drawGrid',
                show: true
              },
              size: [500, 500],
              ticks: [25, 5]
              // color: [0, 0, 1, 1],
              // subColor: [0, 0, 1, 0.5]
            },
            {
              visuals: {
                drawCmd: 'drawAxis',
                show: true
              },
              size: 300
              // alwaysVisible: false,
              // xColor: [0, 0, 1, 1],
              // yColor: [1, 0, 1, 1],
              // zColor: [0, 0, 0, 1]
            },
            ...entities
          ]
        }
        // prepare
        const renderer = prepareRender(options)


// the heart of rendering, as themes, controls, etc change
let updateView = true

const doRotatePanZoom = () => {

  if (rotateDelta[0] || rotateDelta[1]) {
    const updated = orbitControls.rotate({ controls: glControls, camera, speed: rotateSpeed }, rotateDelta)
    glControls = { ...glControls, ...updated.controls }
    updateView = true
    rotateDelta = [0, 0]
  }

  if (panDelta[0] || panDelta[1]) {
    const updated = orbitControls.pan({ controls: glControls, camera, speed: panSpeed }, panDelta)
    glControls = { ...glControls, ...updated.controls }
    panDelta = [0, 0]
    camera.position = updated.camera.position
    camera.target = updated.camera.target
    updateView = true
  }

  if (zoomDelta) {
    const updated = orbitControls.zoom({ controls: glControls, camera, speed: zoomSpeed }, zoomDelta)
    glControls = { ...glControls, ...updated.controls }
    zoomDelta = 0
    updateView = true
  }
}

const updateAndRender = (timestamp) => {
  doRotatePanZoom()

  if (updateView) {
    const updates = orbitControls.update({ controls: glControls, camera })
    glControls = { ...glControls, ...updates.controls }
    updateView = glControls.changed // for elasticity in rotate / zoom

    camera.position = updates.camera.position
    perspectiveCamera.update(camera)

    renderer(options)
  }
  window.requestAnimationFrame(updateAndRender)
}
window.requestAnimationFrame(updateAndRender)

// convert HTML events (mouse movement) to viewer changes
let lastX = 0
let lastY = 0

const rotateSpeed = 0.002
const panSpeed = 1
const zoomSpeed = 0.08
let rotateDelta = [0, 0]
let panDelta = [0, 0]
let zoomDelta = 0
let pointerDown = false

const moveHandler = (ev) => {
  if(!pointerDown) return
  const dx = lastX - ev.pageX
  const dy = ev.pageY - lastY

  const shiftKey = (ev.shiftKey === true) || (ev.touches && ev.touches.length > 2)
  if (shiftKey) {
    panDelta[0] += dx
    panDelta[1] += dy
  } else {
    rotateDelta[0] -= dx
    rotateDelta[1] -= dy
  }

  lastX = ev.pageX
  lastY = ev.pageY

  ev.preventDefault()
}
const downHandler = (ev) => {
  pointerDown = true
  lastX = ev.pageX
  lastY = ev.pageY
  document.body.setPointerCapture(ev.pointerId)
}

const upHandler = (ev) => {
  pointerDown = false
  document.body.releasePointerCapture(ev.pointerId)
}

const wheelHandler = (ev) => {
  zoomDelta += ev.deltaY
  ev.preventDefault()
}

document.body.onpointermove = moveHandler
document.body.onpointerdown = downHandler
document.body.onpointerup = upHandler
document.body.onwheel = wheelHandler
      </script>
    </body>
    </html>
    `;

    await fs.writeFile(path.join(this.currentFolder, '.polygony_temp', 'index.html'), content);
  }

  public async setCurrentFile(path: string) {
    this.currentFile = path;
    await this.writeIndexHtml(path);

    return `http://${this.host}:${this.port}`;
  }

  public async setCurrentFolder(folder: string) {
    if (this.esContext) {
      this.esContext.dispose();
      this.esContext = undefined;
    }
    this.currentFolder = folder;
    const tempPath = path.join(folder, '.polygony_temp');
    try {
      await fs.access(tempPath);
    } catch {
      await fs.mkdir(tempPath);
    }

    const tree = await dirTree(folder, {
      exclude: [/node_modules/g, /\..*$/g, /\.polygony_temp/g],
      attributes: ['type'],
      extensions: /\.js$/,
    });

    this.esContext = await esbuild.context({
      entryPoints: this.plainArrayFromDirTree(tree),
      bundle: true,
      outdir: tempPath,
      allowOverwrite: true,
      format: 'esm',
    });

    await this.esContext.watch();

    const { host, port } = await this.esContext.serve({
      servedir: tempPath,
    });

    this.host = host;
    this.port = port;
  }
}
