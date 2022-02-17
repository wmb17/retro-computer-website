import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import DeltaTime from "../DeltaTime";
import { ExternalsPlugin } from "webpack";
import Screen from "./screen/";
import Stats from "stats.js";
import { loadAssists } from "./loader";

let camera: any;
export default function WebGL() {
  loadAssists((assists) => {
    var stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Canvas
    const canvas: any = document.querySelector("canvas.webgl");
    if (!canvas) console.error("no canvas");

    // Scene
    const scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);
    scene.background = new THREE.Color(0xf6d4b1);

    /**
     * Camera
     */
    // Base camera
    camera = new THREE.PerspectiveCamera(
      50,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(0, 0, -2.5);
    // camera.position.set(0, -1, -5.5);
    camera.rotation.set(-Math.PI, 0, Math.PI);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas);

    const controlProps = {
      minAzimuthAngleOffest: -Math.PI * 0.3,
      maxAzimuthAngleOffest: Math.PI * 0.3,

      minPolarAngleOffest: -Math.PI * 0.3,
      maxPolarAngleOffest: 0,
    };

    controls.enableDamping = true;
    controls.enablePan = false;

    controls.maxDistance = 15;
    controls.minDistance = 2.5;

    // controls.getDistance()

    controls.minAzimuthAngle = Math.PI + controlProps.minAzimuthAngleOffest;
    controls.maxAzimuthAngle = Math.PI + controlProps.maxAzimuthAngleOffest;
    console.log("xoxoxo", controls.maxAzimuthAngle);

    controls.minPolarAngle = Math.PI * 0.5 + controlProps.minPolarAngleOffest;
    controls.maxPolarAngle = Math.PI * 0.5 + controlProps.maxPolarAngleOffest;

    const screenMeshTargetRotation = { x: 0, y: Math.PI * 0.5 };
    document.addEventListener("mousemove", (event) => {
      const mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (event.clientY / window.innerHeight - 0.5) * -2;
      // console.log(mouse)
      // console.log(camera.rotation)
      screenMeshTargetRotation.x = mouseY * (Math.PI / 32);
      screenMeshTargetRotation.y = mouseX * (Math.PI / 32) + Math.PI * 0.5;
    });

    /**
     * Renderer
     */

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.render(sceneRTT, cameraRTT);

    window.addEventListener("resize", () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    const screen = Screen(assists, renderer);

    const planelikeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const plane = new THREE.Mesh(
      planelikeGeometry,
      // texture
      new THREE.MeshBasicMaterial({ color: "blue" })
    );
    plane.scale.x = 1.33;
    // scene.add(plane);

    // Materials
    // const computerMaterial = new THREE.MeshStandardMaterial({ map: assists.bakeTexture});
    // computerMaterial.envMap = assists.environmentMapTexture
    // computerMaterial.roughnessMap = assists.glossMap
    const computerMaterial = new THREE.MeshBasicMaterial({
      map: assists.bakeTexture,
    });

    /**
     * Models
     */
    const computerGroup = new THREE.Group();

    assists.screenMesh.material = screen.screenRenderEngine.material;
    computerGroup.add(assists.screenMesh);

    assists.computerMesh.material = computerMaterial;
    computerGroup.add(assists.computerMesh);

    assists.crtMesh.material = computerMaterial;
    computerGroup.add(assists.crtMesh);

    assists.keyboardMesh.material = computerMaterial;
    computerGroup.add(assists.keyboardMesh);

    // assists.shadowPlaneMesh.material = new THREE.MeshBasicMaterial({ map: assists.bakeFloorTexture, blending: THREE.MultiplyBlending, transparent: true });
    assists.shadowPlaneMesh.material = new THREE.MeshBasicMaterial({
      map: assists.bakeFloorTexture,
    });
    computerGroup.add(assists.shadowPlaneMesh);

    computerGroup.position.y = 1.5;
    scene.add(computerGroup);

    /**
     * Animate
     */

    const clock = new THREE.Clock();
    const tick = () => {
      stats.begin();

      const deltaTime = DeltaTime();
      const elapsedTime = clock.getElapsedTime();

      // Update controls

      const zoomFac =
        (controls.getDistance() - controls.minDistance) /
        (controls.minDistance + controls.maxDistance);

      computerGroup.position.y = 1.5 * zoomFac;

      controls.minAzimuthAngle =
        Math.PI + controlProps.minAzimuthAngleOffest * zoomFac;
      controls.maxAzimuthAngle =
        Math.PI + controlProps.maxAzimuthAngleOffest * zoomFac;

      controls.minPolarAngle =
        Math.PI * 0.5 + controlProps.minPolarAngleOffest * zoomFac;
      controls.maxPolarAngle =
        Math.PI * 0.5 + controlProps.maxPolarAngleOffest * zoomFac;

      controls.update();
      // if (assists.screenMesh) {
      //   assists.screenMesh.rotation.x =
      //     screenMeshTargetRotation.x * 0.05 +
      //     assists.screenMesh.rotation.x * 0.95;
      //   assists.screenMesh.rotation.y =
      //     screenMeshTargetRotation.y * 0.05 +
      //     assists.screenMesh.rotation.y * 0.95;
      // }

      screen.tick(deltaTime, elapsedTime);

      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      stats.end();
      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  });
}
