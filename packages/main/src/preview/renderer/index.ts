import {prepareRender, drawCommands, cameras, controls, entitiesFromSolids} from '@jscad/regl-renderer';
import type { Handler } from 'mitt';
import mitt from 'mitt';

type Events = {
  cameraState: any
}

export class Renderer {
  private container = document.getElementById('jscad') || document.body;
  private emitter = mitt<Events>();
  private width = this.container?.clientWidth || 0;
  private height = this.container?.clientHeight || 0;

  private perspectiveCamera = cameras.perspective;
  private orbitControls = controls.orbit;

  private camera = Object.assign({}, this.perspectiveCamera.defaults);
  private glControls = this.orbitControls.defaults;

  private entities: any[] = [];

  private renderer = prepareRender(this.options);

  private updateView = true;

  private lastX = 0;
  private lastY = 0;
  private rotateSpeed = 0.002;
  private panSpeed = 1;
  private zoomSpeed = 0.08;
  private rotateDelta = [0, 0];
  private panDelta = [0, 0];
  private zoomDelta = 0;
  private pointerDown = false;


  private get options() {
    return {
      glOptions: { container: this.container },
      camera: this.camera,
      drawCommands: {
        drawAxis: drawCommands.drawAxis,
        drawGrid: drawCommands.drawGrid,
        drawLines: drawCommands.drawLines,
        drawMesh: drawCommands.drawMesh,
      },
      entities: [
        {
          visuals: {
            drawCmd: 'drawGrid',
            show: true,
          },
          size: [500, 500],
          ticks: [25, 5],
        },
        {
          visuals: {
            drawCmd: 'drawAxis',
            show: true,
          },
          size: 300,
        },
        ...this.entities,
      ],
    };
  }

  constructor() {
    this.perspectiveCamera.setProjection(this.camera, this.camera, { width: this.width, height: this.height });
    this.perspectiveCamera.update(this.camera, this.camera);

    this.moveHandler = this.moveHandler.bind(this);
    this.downHandler = this.downHandler.bind(this);
    this.upHandler = this.upHandler.bind(this);
    this.wheelHandler = this.wheelHandler.bind(this);
    this.updateAndRender = this.updateAndRender.bind(this);

    if (this.container) {
      this.container.onpointermove = this.moveHandler;
      this.container.onpointerdown = this.downHandler;
      this.container.onpointerup = this.upHandler;
      this.container.onwheel = this.wheelHandler;
    }
  }

  public on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>) {
    this.emitter.on(type, handler);
  }

  public off<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>) {
    this.emitter.off(type, handler);
  }

  public run() {
    window.requestAnimationFrame(this.updateAndRender);
  }

  public setEntities(entities: any) {
    this.entities = entitiesFromSolids({}, entities);
    this.updateView = true;
  }

  private updateAndRender() {
    this.doRotatePanZoom();

    if (this.updateView) {
      const updates = this.orbitControls.update({controls: this.glControls, camera: this.camera});
      this.updateControlsState(updates.controls);
      this.updateView = this.glControls.changed;
      this.emitter.emit('cameraState', updates);
      this.camera.position = updates.camera.position;
      this.perspectiveCamera.update(this.camera);

      this.renderer(this.options);
    }
    window.requestAnimationFrame(this.updateAndRender);
  }

  private moveHandler(ev: PointerEvent) {
    if (!this.pointerDown) return;
    const dx = this.lastX - ev.pageX;
    const dy = ev.pageY - this.lastY;

    const shiftKey = ev.shiftKey === true || ((ev as any).touches && (ev as any).touches.length > 2);
    if (shiftKey) {
      this.panDelta[0] += dx;
      this.panDelta[1] += dy;
    } else {
      this.rotateDelta[0] -= dx;
      this.rotateDelta[1] -= dy;
    }

    this.lastX = ev.pageX;
    this.lastY = ev.pageY;

    ev.preventDefault();
  }

  private downHandler(ev: PointerEvent) {
    this.pointerDown = true;
    this.lastX = ev.pageX;
    this.lastY = ev.pageY;
    this.container.setPointerCapture(ev.pointerId);
  }

  private upHandler(ev: PointerEvent) {
    this.pointerDown = false;
    this.container.releasePointerCapture(ev.pointerId);
  }

  private wheelHandler(ev: WheelEvent) {
    this.zoomDelta += ev.deltaY;
    ev.preventDefault();
  }

  public updateCameraState(state: any) {
    this.camera = { ...this.camera, ...state };
  }

  public updateControlsState(state: any) {
    this.glControls = { ...this.glControls, ...state };
  }

  private doRotatePanZoom() {
    if (this.rotateDelta[0] || this.rotateDelta[1]) {
      const updated = this.orbitControls.rotate(
        {controls: this.glControls, camera: this.camera, speed: this.rotateSpeed},
        this.rotateDelta,
      );
      this.updateControlsState(updated.controls);
      this.updateView = true;
      this.rotateDelta = [0, 0];
    }

    if (this.panDelta[0] || this.panDelta[1]) {
      const updated = this.orbitControls.pan({controls: this.glControls, camera: this.camera, speed: this.panSpeed}, this.panDelta);
      this.updateControlsState(updated.controls);
      this.panDelta = [0, 0];
      this.camera.position = updated.camera.position;
      this.camera.target = updated.camera.target;
      this.updateView = true;
    }

    if (this.zoomDelta) {
      const updated = this.orbitControls.zoom({controls: this.glControls, camera: this.camera, speed: this.zoomSpeed}, this.zoomDelta);
      this.updateControlsState(updated.controls);
      this.zoomDelta = 0;
      this.updateView = true;
    }
  }
}
