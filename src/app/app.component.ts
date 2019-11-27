import { Component, OnInit, AfterViewInit } from "@angular/core";
import * as fromFabric from "fabric";
import { TEST_PLAN } from "./plan";

const IMAGE_SMOOTHING = true;
const CACHING = true;

fromFabric.fabric.Object.prototype.noScaleCache = false;

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit, AfterViewInit {
  caching = CACHING;
  imageSmoothing = IMAGE_SMOOTHING;
  shadow =
    null &&
    new fromFabric.fabric.Shadow({
      color: "#B7BABC",
      blur: 4,
      offsetX: 2,
      offsetY: 2,
      affectStroke: true,
      includeDefaultValues: true,
      nonScaling: true
    });

  canvas: fromFabric.fabric.Canvas;
  stacking = true;
  baseSvgPath = TEST_SVG; //"/assets/sofa.svg";
  dims = {
    height: 800,
    width: 400
  };

  dcanvas: HTMLCanvasElement;

  ngOnInit() {
    this.init();
  }

  ngAfterViewInit() {
    this.dcanvas = document.querySelector("#d");
  }

  activateListener() {
    this.canvas.on({
      "mouse:down": e => {
        console.log(e.target);
        // console.error(e.target.saveState()); // same same
        // fromFabric.fabric.Object.prototype.objectCaching = true;
      },
      "mouse:up": e => {
        // fromFabric.fabric.Object.prototype.objectCaching = false;
      }
    });

    this.canvas.on("mouse:wheel", opt => {
      const me = <MouseEvent>opt.e;

      //@ts-ignore
      const delta = me.deltaY;
      let zoom = this.canvas.getZoom();
      zoom = zoom + delta / 200;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      //@ts-ignore
      this.canvas.zoomToPoint({ x: me.offsetX, y: me.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  clear2() {
    const destCtx = this.dcanvas.getContext("2d");
    destCtx.clearRect(0, 0, this.dcanvas.width, this.dcanvas.height);
  }

  random() {
    //@ts-ignore
    const canvas = this.canvas.toCanvasElement();
    const destCtx = this.dcanvas.getContext("2d");
    destCtx.drawImage(canvas, 0, 0);
  }

  init() {
    // fromFabric.fabric.Object.prototype.objectCaching = false;

    let { height, width } = this.dims;

    this.canvas = new fromFabric.fabric.Canvas("c", {
      imageSmoothingEnabled: this.imageSmoothing,
      enableRetinaScaling: true,
      preserveObjectStacking: this.stacking,
      backgroundColor: "transparent",
      perPixelTargetFind: false
    });

    this.canvas.setHeight(height);
    this.canvas.setWidth(width);
    this.activateListener();
  }

  clearcanvas() {
    this.canvas.clear().renderAll();
    this.canvas.backgroundColor = "transparent";
  }

  i = 0;

  randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min; //50 * this.i;
  }

  addCustom(customSVG: string) {
    this.fetchUsingFabric(customSVG).then(
      asset => {
        const pt = this.randomPoint();

        asset.set({
          left: pt.x,
          top: pt.y
        });

        asset.setShadow(this.shadow);
        this.setCaching(asset);
        this.canvas.add(asset);
      },
      rej => {}
    );
  }

  setCaching(asset: fromFabric.fabric.Object) {
    if (this.caching) {
      return;
    }

    asset.objectCaching = this.caching;

    //@ts-ignore
    asset["getObjects"] &&
      asset["getObjects"].forEach(obj => {
        obj.objectCaching = this.caching;
      });
  }

  randomPoint() {
    const x = this.randomInt(0, this.dims.width);
    const y = this.randomInt(0, this.dims.height);

    return new fromFabric.fabric.Point(x, y);
  }

  addSvg(load: number) {
    let loading = load;
    this.i++; // batches of 100 at 100 * batch no for location

    this.canvas.renderOnAddRemove = false;
    for (let i = 0; i < load; i++) {
      this.fetchUsingFabric(this.baseSvgPath).then(
        asset => {
          const pt = this.randomPoint();

          asset.set({
            left: pt.x,
            top: pt.y
          });
          this.setCaching(asset);
          asset.setShadow(this.shadow);

          this.canvas.add(asset);
          --loading;
        },
        rej => {
          --loading;
        }
      );
    }
    this.canvas.renderOnAddRemove = true;
  }

  fetchUsingFabric(path: string): Promise<any> {
    return new Promise((res, rej) => {
      fromFabric.fabric.loadSVGFromString(path, (objects, options) => {
        if (!objects) {
          rej("empty svg !");
        } else {
          res(fromFabric.fabric.util.groupSVGElements(objects, options));
        }
      });
    });
  }

  loadPlan() {
    this.canvas.loadFromJSON(TEST_PLAN, () => {
      this.canvas.requestRenderAll();
    });

    this.translate();
  }

  translate() {
    this.canvas.viewportTransform[4] =
      this.canvas.viewportTransform[4] + 1000 / 2;
    this.canvas.viewportTransform[5] =
      this.canvas.viewportTransform[5] + 800 / 2;
  }
}

const TEST_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" viewBox="-1.52588015965e-05 -0.00285339353319 100.000030518 100.092971802" preserveAspectRatio="none">
  <defs>
    <g id="c1">
      <path fill="#ffffff" stroke="none" d="M-29.6 -54.85 L-46.15 -53.0 -46.2 -53.0 Q-48.4 -52.75 -49.1 -51.05 L-49.4 -49.8 Q-49.4 -48.65 -48.65 -47.6 L-41.5 -37.0 Q-40.25 -35.0 -37.45 -33.95 L-37.2 -33.9 -33.0 -27.8 -33.1 -27.5 -42.9 10.7 Q-43.35 12.55 -44.2 13.1 L-44.35 13.25 -44.55 13.25 Q-46.9 13.6 -47.95 16.9 L-48.1 18.1 Q-48.1 21.35 -45.1 23.0 L-44.75 23.2 Q-42.4 24.5 -39.45 24.35 L-38.8 24.3 -38.7 24.95 Q-38.55 26.15 -37.9 27.05 -36.7 28.6 -34.7 28.85 L-28.5 29.5 -27.0 32.5 -27.0 32.7 Q-28.95 47.45 -29.0 49.85 L-28.95 49.9 -29.0 50.2 -28.85 51.2 -29.05 51.3 Q-28.6 54.05 -27.2 56.0 L-26.45 56.5 -26.1 56.6 -25.95 56.6 -24.95 56.3 Q-21.6 53.75 -20.45 51.65 L-20.25 51.15 Q-19.6 49.25 -17.55 31.2 L-17.45 30.55 -16.75 30.6 -0.4 31.5 14.9 30.65 15.6 30.6 15.65 31.3 Q17.7 48.25 18.3 50.5 L18.35 50.5 18.35 50.65 18.65 51.55 Q19.25 52.75 21.0 54.45 L23.25 56.3 24.2 56.6 Q25.0 56.6 25.45 56.0 L26.5 53.9 Q27.3 51.95 27.3 50.7 L27.3 50.65 27.25 50.65 27.3 50.45 27.15 49.9 27.25 49.85 25.15 32.95 26.85 29.55 33.65 28.85 Q35.7 28.6 36.85 27.05 37.5 26.15 37.65 24.95 L37.75 24.35 38.35 24.35 Q40.85 24.25 42.85 23.2 L43.2 23.0 Q46.25 21.3 46.25 18.1 L46.05 16.9 Q45.0 13.6 42.65 13.25 L42.45 13.25 42.3 13.1 Q41.45 12.5 41.05 10.7 L31.45 -26.7 36.25 -33.65 36.5 -33.7 Q39.9 -34.6 41.45 -36.95 L48.7 -47.6 Q49.45 -48.65 49.45 -49.85 L49.2 -51.05 Q48.5 -52.7 46.25 -53.0 L41.15 -53.6 28.95 -54.8 -1.1 -56.6 -29.6 -54.85 M-2.8 -34.0 L-2.7 -21.2 -5.55 -20.95 -8.3 -34.05 -2.8 -34.0 M-13.5 -34.1 L-10.35 -21.15 -13.0 -21.05 -18.75 -34.15 -13.5 -34.1 M-23.95 -34.1 L-17.9 -21.1 -20.4 -21.2 -28.5 -34.1 -23.95 -34.1 M27.8 -33.9 L24.75 -27.5 23.3 -26.3 20.0 -21.05 17.2 -21.1 23.2 -34.1 27.8 -33.9 M17.9 -33.8 L12.4 -21.15 9.7 -21.1 12.75 -34.1 17.9 -33.8 M7.5 -33.85 L4.75 -21.15 1.9 -21.2 2.2 -33.85 7.5 -33.85" />
    </g>
    <g id="c2">
      <g>
        <use transform="matrix(1.0,0.0,0.0,1.0,0.0,0.0)" xlink:href="#c1" />
      </g>
    </g>
    <g id="c3">
      <path fill="#000000" stroke="none" d="M46.85 -49.85 Q47.0 -49.45 46.6 -48.8 L39.35 -38.2 37.9 -36.85 36.5 -36.15 35.4 -35.8 35.35 -35.8 34.75 -35.75 -34.9 -35.75 -35.35 -35.8 -36.4 -36.05 -37.8 -36.7 Q-38.85 -37.35 -39.4 -38.15 L-39.45 -38.2 -46.6 -48.8 Q-47.0 -49.45 -46.85 -49.85 -46.7 -50.2 -45.9 -50.3 L-41.2 -50.9 -29.9 -52.1 -1.15 -53.9 28.75 -52.1 45.95 -50.3 46.85 -49.85 M41.2 -54.3 L29.0 -55.5 -1.15 -57.3 -30.15 -55.55 -46.3 -53.75 Q-48.85 -53.35 -49.8 -51.35 -50.15 -50.65 -50.15 -49.8 -50.15 -48.5 -49.25 -47.2 L-42.15 -36.55 Q-40.7 -34.45 -37.7 -33.3 L-33.85 -27.7 -33.85 -27.65 -43.65 10.5 Q-44.0 11.9 -44.65 12.55 -47.5 12.9 -48.65 16.7 L-48.85 18.1 Q-48.85 21.8 -45.45 23.65 L-45.1 23.85 Q-42.65 25.2 -39.45 25.05 -39.3 26.4 -38.5 27.5 -37.2 29.3 -34.8 29.6 L-29.0 30.2 -27.75 32.65 Q-29.75 47.85 -29.75 50.0 L-29.75 50.1 -29.65 49.6 -29.75 50.15 -29.6 51.4 -29.65 51.3 -29.8 50.6 -29.85 50.7 Q-29.85 52.1 -28.95 54.25 L-27.8 56.5 -26.7 57.2 -26.45 57.25 -26.0 57.35 -24.6 56.9 Q-21.05 54.25 -19.85 51.95 L-19.85 51.9 -19.6 51.35 -19.4 50.7 -19.4 50.6 Q-18.6 47.1 -16.85 31.3 L-0.45 32.25 14.9 31.4 Q16.9 48.5 17.6 50.9 L17.6 50.65 17.75 51.3 17.95 51.85 17.8 51.55 Q18.75 53.95 22.8 56.9 23.55 57.4 24.2 57.3 L24.3 57.3 Q25.25 57.4 26.0 56.45 L27.1 54.25 Q28.0 52.1 28.0 50.7 L28.0 50.55 27.95 50.75 27.95 50.5 27.8 49.55 27.95 50.4 28.0 50.25 25.85 33.1 27.3 30.25 33.65 29.6 Q36.0 29.3 37.4 27.45 38.1 26.6 38.35 25.05 41.15 24.95 43.15 23.85 L43.5 23.65 Q46.9 21.8 46.9 18.1 L46.7 16.7 Q45.55 12.9 42.7 12.55 42.05 11.9 41.7 10.55 L32.15 -26.55 36.65 -33.0 Q40.25 -33.9 42.0 -36.55 L49.3 -47.2 Q50.15 -48.5 50.15 -49.85 L49.85 -51.35 Q48.9 -53.4 46.3 -53.7 L41.2 -54.3 M22.45 -25.45 L19.65 -21.05 17.45 -21.05 23.15 -33.25 27.25 -33.25 23.7 -27.5 23.2 -27.45 Q22.7 -27.35 22.5 -27.05 22.25 -26.7 22.3 -26.25 L22.45 -25.45 M29.25 -25.65 L29.5 -24.7 38.8 11.45 Q39.2 13.15 40.15 14.35 41.15 15.7 42.3 15.65 L43.0 16.2 Q43.6 16.85 43.85 17.75 44.1 18.6 43.55 19.65 43.05 20.65 42.05 21.2 L41.7 21.4 Q39.7 22.55 37.1 22.2 L36.35 22.05 36.05 21.9 35.1 21.25 34.9 21.05 Q33.6 19.85 33.3 18.25 L25.8 -18.9 25.75 -19.25 25.6 -20.0 25.55 -20.3 25.4 -21.0 25.35 -21.3 24.5 -25.55 29.2 -25.9 29.25 -25.65 M29.85 -28.0 L28.05 -27.85 25.9 -27.65 25.55 -27.65 29.0 -33.25 33.6 -33.25 29.95 -27.95 29.85 -28.0 M17.55 -33.25 L12.1 -21.05 9.8 -21.05 12.7 -33.25 17.55 -33.25 M11.15 -33.25 L8.25 -21.05 6.1 -21.05 8.75 -33.25 11.15 -33.25 M7.2 -33.25 L4.55 -21.05 2.2 -21.05 2.3 -33.25 7.2 -33.25 M13.75 -21.05 L19.2 -33.25 21.5 -33.25 15.8 -21.05 13.75 -21.05 M17.4 -15.0 L22.4 -15.0 Q22.8 -15.0 23.05 -15.35 L24.15 -17.0 28.85 6.25 24.65 15.15 Q24.5 15.45 24.65 15.8 24.8 16.1 25.2 16.2 L29.3 16.8 Q29.8 16.8 30.05 16.4 L30.65 15.3 31.35 18.65 Q31.9 21.45 34.3 23.2 L35.35 23.8 35.4 24.0 Q35.65 25.05 35.0 25.85 34.45 26.65 33.35 26.8 L27.15 27.45 24.1 27.75 23.8 27.75 23.5 27.8 18.85 28.25 18.4 28.25 15.8 28.5 -0.45 29.4 -17.8 28.4 -20.4 28.2 -20.55 28.15 -23.95 27.85 -24.3 27.8 -34.45 26.8 Q-35.6 26.65 -36.1 25.85 -36.7 25.1 -36.55 24.0 L-36.4 23.3 -35.35 22.4 Q-33.65 20.65 -33.3 18.65 L-32.45 14.45 -31.35 16.4 -30.6 16.8 -26.5 16.2 -25.95 15.8 Q-25.8 15.45 -25.95 15.15 L-30.55 5.45 -30.6 5.35 -25.9 -18.2 -23.9 -15.35 Q-23.65 -15.0 -23.3 -15.0 L-18.25 -15.0 Q-17.85 -15.0 -17.6 -15.4 -17.4 -15.75 -17.6 -16.15 L-19.4 -19.05 18.5 -19.05 16.75 -16.15 Q16.5 -15.85 16.7 -15.4 16.95 -15.0 17.4 -15.0 M23.75 -19.05 L22.0 -16.5 18.7 -16.5 22.9 -23.3 22.9 -23.25 23.75 -19.05 M0.7 -21.05 L-1.55 -21.05 -1.65 -33.25 0.8 -33.25 0.7 -21.05 M-3.15 -33.25 L-3.05 -21.05 -5.4 -21.05 -8.1 -33.25 -3.15 -33.25 M-9.6 -33.25 L-6.95 -21.05 -9.15 -21.05 -12.0 -33.25 -9.6 -33.25 M-13.55 -33.25 L-10.65 -21.05 -12.95 -21.05 -18.4 -33.25 -13.55 -33.25 M-34.5 -33.25 L-29.9 -33.25 -26.35 -27.55 -26.7 -27.55 -28.85 -27.75 -29.15 -27.75 -30.75 -27.9 -34.5 -33.25 M-31.15 -25.9 L-29.5 -25.8 -29.3 -25.75 -26.45 -25.55 -27.4 -20.85 -27.45 -20.45 -33.95 11.75 -35.25 18.25 -35.75 19.55 -36.55 20.75 -37.05 21.25 -38.2 22.0 -38.3 22.05 -40.95 22.2 Q-42.55 22.0 -43.65 21.4 L-44.0 21.2 Q-45.0 20.65 -45.5 19.65 -46.05 18.6 -45.8 17.75 -45.55 16.85 -44.95 16.2 L-44.25 15.65 Q-43.1 15.7 -42.1 14.35 -41.15 13.15 -40.75 11.45 L-31.15 -25.85 -31.15 -25.9 M-24.0 -33.25 L-18.35 -21.05 -20.5 -21.05 -28.15 -33.25 -24.0 -33.25 M-24.6 -24.6 L-19.6 -16.5 -22.9 -16.5 -25.35 -20.05 -25.45 -20.25 -24.6 -24.5 -24.6 -24.6 M-16.7 -21.05 L-22.35 -33.25 -20.05 -33.25 -14.6 -21.05 -16.7 -21.05 M-31.1 7.75 L-27.75 14.85 -30.3 15.2 -32.0 12.2 -31.1 7.75 M-21.6 30.1 L-20.8 33.45 -24.4 33.35 -26.3 29.65 -26.05 29.65 -24.6 29.8 -21.6 30.1 M-24.9 34.8 L-20.05 35.0 Q-21.85 49.65 -22.15 50.65 L-22.15 50.75 -23.7 52.6 -25.85 54.6 Q-27.1 52.1 -27.1 50.9 L-27.1 50.85 -27.15 51.0 -25.25 34.7 -24.9 34.8 M-19.65 31.75 L-20.05 30.2 -19.5 30.25 -19.65 31.75 M26.4 14.85 L29.35 8.7 30.2 13.0 29.0 15.2 26.4 14.85 M18.35 30.3 L17.8 32.6 17.55 30.35 18.35 30.3 M19.95 30.15 L22.6 29.9 23.0 29.85 23.35 29.85 24.6 29.7 22.75 33.35 19.15 33.45 19.2 33.3 19.95 30.15 M23.3 34.8 L25.3 51.0 25.25 50.85 Q25.25 52.25 24.0 54.6 L21.85 52.6 20.3 50.75 20.3 50.65 Q20.0 49.7 18.1 35.0 L23.3 34.8" />
    </g>
    <g id="c4">
      <g>
        <use transform="matrix(1.0,0.0,0.0,1.0,0.0,0.0)" xlink:href="#c3" />
      </g>
    </g>
  </defs>
  <g>
    <g>
      <use transform="matrix(0.997009277344,0.0,0.0,0.872650146484,49.95,50.3)" xlink:href="#c2" />
    </g>
    <g>
      <use transform="matrix(0.997009277344,0.0,0.0,0.872650146484,50.0,50.0)" xlink:href="#c4" />
    </g>
  </g>
</svg>
            `;
