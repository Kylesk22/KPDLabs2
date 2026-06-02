// import React, { Component } from "react";
// import * as THREE from "three";
// // import Lower from '../../../../public/Lower.stl'
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
// import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// // import { STLLoader } from "../component/Scan";
// import {STLLoader} from "../../../../node_modules/three/examples/jsm/loaders/STLLoader"
// import Teeth from "../../img/Teeth.stl"
// import Base from "../../img/Base.stl"
// import STLModel from "../../img/Model.stl"






// ///THISONE
// // class ThreeScene2 extends Component {
// //   componentDidMount() {
// //     const width = this.mount.clientWidth;
// //     const height = this.mount.clientHeight;
// //     this.scene = new THREE.Scene();

// //     // Add Renderer
// //     this.renderer = new THREE.WebGLRenderer({ antialias: true });
// //     this.renderer.setClearColor(0x000000, 0);
// //     this.renderer.setSize(width, height);
// //     this.mount.appendChild(this.renderer.domElement);

// //     // Add Camera
// //     this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
// //     this.camera.position.z = 20;
// //     this.camera.position.y = 20;

// //     // Camera Controls
// //     const controls = new OrbitControls(this.camera, this.renderer.domElement);
// //     controls.enablePan = false;
// //     controls.enableZoom = false;

// //     // Lights
// //     const lights = [
// //       new THREE.PointLight(0x304ffe, 1, 0),
// //       new THREE.PointLight(0xffffff, 1, 0),
// //       new THREE.PointLight(0xffffff, 1, 0)
// //     ];
// //     lights[0].position.set(0, 200, 0);
// //     lights[1].position.set(100, 200, 100);
// //     lights[2].position.set(-100, -200, -100);
// //     lights.forEach(light => this.scene.add(light));

// //     // Add Models
// //     this.addModels();

// //     // Start animation loop
// //     this.start();
// //   }

// //   addModels() {
// //     const scene = this.scene;

// //     const loadModel = (modelPath, materialColor) => {
// //       const loader = new STLLoader();
// //       loader.load(modelPath, function(geometry) {
// //         const material = new THREE.MeshPhongMaterial({
// //           color: materialColor,
// //           specular: 0x111111,
// //           shininess: 200
// //         });
// //         const mesh = new THREE.Mesh(geometry, material);
// //         mesh.position.set(0, 10, 0);
// //         mesh.scale.set(0.3, 0.3, 0.3);
// //         mesh.rotateX(Math.PI / 2 - 0.6);
// //         mesh.rotateZ(Math.PI);
// //         mesh.castShadow = true;
// //         mesh.receiveShadow = true;
// //         scene.add(mesh);

// //         // Start rotation immediately
// //         startRotation(mesh);
// //       });
// //     };

// //     const startRotation = mesh => {
// //       const animateRotation = () => {
// //         requestAnimationFrame(animateRotation);
// //         mesh.rotation.z += 0.014; // Rotate the model
// //       };
// //       animateRotation();
// //     };

// //     const startTranslation = (mesh, delay) => {
// //       setTimeout(() => {
// //         const animateTranslation = () => {
// //           requestAnimationFrame(animateTranslation);
// //           mesh.translateZ(-0.015); // Translate the model
// //         };
// //         animateTranslation();
// //       }, delay);
// //     };

// //     // Load all models simultaneously
// //     loadModel(Teeth, new THREE.Color("rgb(252, 252, 252)"));
// //     loadModel(Base, new THREE.Color("rgb(255, 199, 250)"));
// //     loadModel(STLModel, new THREE.Color("rgb(229, 198, 153)"));

// //     // Start translating each model with delays
// //     setTimeout(() => startTranslation(scene.children[0], 1000), 2000); // Start translating Teeth after 2 seconds
// //     setTimeout(() => startTranslation(scene.children[1], 2000), 3000); // Start translating Base after 3 seconds
// //     setTimeout(() => startTranslation(scene.children[2], 3000), 4000); // Start translating STLModel after 4 seconds
// //   }

// //   componentWillUnmount() {
// //     this.stop();
// //     this.mount.removeChild(this.renderer.domElement);
// //   }

// //   start = () => {
// //     if (!this.frameId) {
// //       this.frameId = requestAnimationFrame(this.animate);
// //     }
// //   };

// //   stop = () => {
// //     cancelAnimationFrame(this.frameId);
// //   };

// //   animate = () => {
// //     this.renderScene();
// //     this.frameId = window.requestAnimationFrame(this.animate);
// //   };

// //   renderScene = () => {
// //     if (this.renderer) this.renderer.render(this.scene, this.camera);
// //   };

// //   render() {
// //     return (
// //       <div
// //         style={{ width: "100%", height: "800px" }}
// //         ref={mount => {
// //           this.mount = mount;
// //         }}
// //       />
// //     );
// //   }
// // }

// // export default ThreeScene2;

// // class ThreeScene2 extends Component {
// //   componentDidMount() {
// //     const width = this.mount.clientWidth;
// //     const height = this.mount.clientHeight;
// //     this.scene = new THREE.Scene();

// //     // Add Renderer
// //     this.renderer = new THREE.WebGLRenderer({ antialias: true });
// //     this.renderer.setClearColor(0x000000, 0);
// //     this.renderer.setSize(width, height);
// //     this.mount.appendChild(this.renderer.domElement);

// //     // Add Camera
// //     this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
// //     this.camera.position.z = 20;
// //     this.camera.position.y = 20;

// //     // Camera Controls
// //     const controls = new OrbitControls(this.camera, this.renderer.domElement);
// //     controls.enablePan = false;
// //     controls.enableZoom = false;

// //     // Lights
// //     const lights = [
// //       new THREE.PointLight(0x304ffe, 1, 0),
// //       new THREE.PointLight(0xffffff, 1, 0),
// //       new THREE.PointLight(0xffffff, 1, 0)
// //     ];
// //     lights[0].position.set(0, 200, 0);
// //     lights[1].position.set(100, 200, 100);
// //     lights[2].position.set(-100, -200, -100);
// //     lights.forEach(light => this.scene.add(light));

// //     // Add Models
// //     this.addModels();

// //     // Start animation loop
// //     this.start();
// //   }

// //   addModels() {
// //     const scene = this.scene;

// //     const loadModel = (modelPath, materialColor) => {
// //       const loader = new STLLoader();
// //       loader.load(modelPath, function(geometry) {
// //         const material = new THREE.MeshPhongMaterial({
// //           color: materialColor,
// //           specular: 0x111111,
// //           shininess: 200
// //         });
// //         const mesh = new THREE.Mesh(geometry, material);
// //         mesh.position.set(0, 10, 0);
// //         mesh.scale.set(0.3, 0.3, 0.3);
// //         mesh.rotateX(Math.PI / 2 - 0.6);
// //         mesh.rotateZ(Math.PI);
// //         mesh.castShadow = true;
// //         mesh.receiveShadow = true;
// //         scene.add(mesh);

// //         // Start rotation immediately
// //         startRotation(mesh);
// //       });
// //     };

// //     const startRotation = mesh => {
// //       const animateRotation = () => {
// //         requestAnimationFrame(animateRotation);
// //         mesh.rotation.z += 0.014; // Rotate the model
// //       };
// //       animateRotation();
// //     };

// //     const startTranslation = (mesh, delay) => {
// //       setTimeout(() => {
// //         const animateTranslation = () => {
// //           requestAnimationFrame(animateTranslation);
// //           mesh.position.z -= 0.015; // Translate the model along z-axis
// //         };
// //         animateTranslation();
// //       }, delay);
// //     };

// //     // Load all models simultaneously
// //     loadModel(Teeth, new THREE.Color("rgb(252, 252, 252)"));
// //     loadModel(Base, new THREE.Color("rgb(255, 199, 250)"));
// //     loadModel(STLModel, new THREE.Color("rgb(229, 198, 153)"));

// //     // Start translating each model with delays
// //     setTimeout(() => startTranslation(scene.children[1], 1000), 2000); // Start translating Teeth after 2 seconds
// //     setTimeout(() => startTranslation(scene.children[2], 2000), 3000); // Start translating Base after 3 seconds
// //     setTimeout(() => startTranslation(scene.children[3], 3000), 4000); // Start translating STLModel after 4 seconds
// //   }

// //   componentWillUnmount() {
// //     this.stop();
// //     this.mount.removeChild(this.renderer.domElement);
// //   }

// //   start = () => {
// //     if (!this.frameId) {
// //       this.frameId = requestAnimationFrame(this.animate);
// //     }
// //   };

// //   stop = () => {
// //     cancelAnimationFrame(this.frameId);
// //   };

// //   animate = () => {
// //     this.renderScene();
// //     this.frameId = window.requestAnimationFrame(this.animate);
// //   };

// //   renderScene = () => {
// //     if (this.renderer) this.renderer.render(this.scene, this.camera);
// //   };

// //   render() {
// //     return (
// //       <div
// //         style={{ width: "100%", height: "800px" }}
// //         ref={mount => {
// //           this.mount = mount;
// //         }}
// //       />
// //     );
// //   }
// // }

// // export default ThreeScene2;


// // NEAR PERFECT!!!!!!!!!!!!!
// class ThreeScene2 extends Component {
//   componentDidMount() {
//     const width = this.mount.clientWidth;
//     const height = this.mount.clientHeight;
//     this.scene = new THREE.Scene();

//     // Add Renderer
//     this.renderer = new THREE.WebGLRenderer({ antialias: true });
//     this.renderer.setClearColor(0x000000, 0);
//     this.renderer.setSize(width, height);
//     this.mount.appendChild(this.renderer.domElement);

//     // Add Camera
//     this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//     this.camera.position.z = 20;
//     this.camera.position.y = 20;

//     // Camera Controls
//     const controls = new OrbitControls(this.camera, this.renderer.domElement);
//     controls.enablePan = false;
//     controls.enableZoom = false;

//     // Lights
//     const lights = [
//       new THREE.PointLight(0x304ffe, 1, 0),
//       new THREE.PointLight(0xffffff, 1, 0),
//       new THREE.PointLight(0xffffff, 1, 0)
//     ];
//     lights[0].position.set(0, 200, 0);
//     lights[1].position.set(100, 200, 100);
//     lights[2].position.set(-100, -200, -100);
//     lights.forEach(light => this.scene.add(light));

//     // Add Models
//     this.addModels();

//     // Start animation loop
//     this.start();
//   }

//   addModels() {
//     const scene = this.scene;

//     const loadModel = (modelPath, materialColor, modelName) => {
//       return new Promise((resolve, reject) => {
//         const loader = new STLLoader();
//         loader.load(modelPath, function(geometry) {
//           const material = new THREE.MeshPhongMaterial({
//             color: materialColor,
//             specular: 0x111111,
//             shininess: 200
//           });
//           const mesh = new THREE.Mesh(geometry, material);
//           mesh.name = modelName
//           mesh.position.set(0, 10, 0);
//           mesh.scale.set(0.3, 0.3, 0.3);
//           mesh.rotateX(Math.PI / 2 - 0.6);
//           mesh.rotateZ(Math.PI);
//           mesh.castShadow = true;
//           mesh.receiveShadow = true;
//           scene.add(mesh);
//           resolve(mesh);
//         });
//       });
//     };

//     const startRotation = mesh => {
//       const animateRotation = () => {
//         requestAnimationFrame(animateRotation);
//         mesh.rotation.z += 0.014; // Rotate the model
//       };
//       animateRotation();
//     };

//     const startTranslation = (mesh, delay, distance) => {
//       setTimeout(() => {
//         const animateTranslation = () => {
//           let initialPosition = mesh.position.z
//           let dist= 0
//           requestAnimationFrame(animateTranslation);
//           // mesh.position.z -= distance; // Translate the model
//           if (mesh.name === "Teeth"){
//             if (dist - initialPosition < 3.5) {
//               mesh.translateZ(-0.015); // Translate the model
              
              
//             }}
//           else if (mesh.name === "Base"){
//             if (dist - initialPosition < 1.5) {
//               mesh.translateZ(-0.015); // Translate the model
              
//           }}
//         };
//         animateTranslation();
//       }, delay);
//     };

//     Promise.all([
//       loadModel(Teeth, new THREE.Color("rgb(252, 252, 252)"), "Teeth"),
//       loadModel(Base, new THREE.Color("rgb(255, 199, 250)"), "Base"),
//       loadModel(STLModel, new THREE.Color("rgb(229, 198, 153)"),"Model")
//     ]).then(models => {
//       // Start rotation immediately for all models
//       models.forEach(model => startRotation(model));

//       // Start translating each model with delays
//       setTimeout(() => startTranslation(models[0], 2000, 0.01), 4000); // Start translating Teeth after 4 seconds
//       setTimeout(() => startTranslation(models[1], 3000, 0.01), 5000); // Start translating Base after 5 seconds
//       // setTimeout(() => startTranslation(models[2], 4000, 0.01), 6000); // Start translating STLModel after 6 seconds
//     });
//   }

//   componentWillUnmount() {
//     this.stop();
//     this.mount.removeChild(this.renderer.domElement);
//   }

//   start = () => {
//     if (!this.frameId) {
//       this.frameId = requestAnimationFrame(this.animate);
//     }
//   };

//   stop = () => {
//     cancelAnimationFrame(this.frameId);
//   };

//   animate = () => {
//     this.renderScene();
//     this.frameId = window.requestAnimationFrame(this.animate);
//   };

//   renderScene = () => {
//     if (this.renderer) this.renderer.render(this.scene, this.camera);
//   };

//   render() {
//     return (
//       <div
//         style={{ width: "100%", height: "100vh" }}
//         ref={mount => {
//           this.mount = mount;
//         }}
//       />
//     );
//   }
// }

// export default ThreeScene2;


import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from "../../../../node_modules/three/examples/jsm/loaders/STLLoader";
import Teeth from "../../img/Teeth.stl";
import Base from "../../img/Base.stl";
import STLModel from "../../img/Model.stl";

// Speed constants — all in units per second, frame-rate independent
const ROTATION_SPEED_Z = 0.5;        // main spin speed (rad/s)
const WOBBLE_SPEED = 0.4;            // Y-axis oscillation speed (rad/s)
const WOBBLE_AMPLITUDE = 0.18;       // how much Y wobbles (radians)
const TRANSLATION_SPEED = 1.2;       // units per second for separation

// Easing function — ease in/out cubic
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

class ThreeScene2 extends Component {
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.totalTime = 0;
    this.models = null;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.mount.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 22, 24);
    this.camera.lookAt(0, 10, 0);

    // Controls — allow manual rotation but keep zoom/pan off
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.enableRotate = true;
    this.controls.autoRotate = false;
    this.controls.target.set(0, 10, 0);
    this.controls.update();

    // Lighting — premium clinical feel with warm key + cool rim
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Warm key light from top-front
    const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.4);
    keyLight.position.set(10, 30, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    // Cool rim light from behind — gives depth
    const rimLight = new THREE.PointLight(0x6090ff, 1.2, 200);
    rimLight.position.set(-20, 10, -20);
    this.scene.add(rimLight);

    // Subtle fill from below
    const fillLight = new THREE.PointLight(0xffffff, 0.5, 200);
    fillLight.position.set(0, -10, 10);
    this.scene.add(fillLight);

    // Gold accent light — matches site palette
    const accentLight = new THREE.PointLight(0xffaa17, 0.6, 150);
    accentLight.position.set(15, 5, 5);
    this.scene.add(accentLight);

    // Translation state for each model
    // Each entry: { active, progress (0-1), limit (total distance), direction (THREE.Vector3) }
    this.separations = {
      Teeth:    { active: false, progress: 0, limit: 3.5, direction: new THREE.Vector3(0, 0, -1) },
      Base:     { active: false, progress: 0, limit: 1.5, direction: new THREE.Vector3(0, 0, -1) },
      Model:    { active: false, progress: 0, limit: 0.8, direction: new THREE.Vector3(0, 0, 1) },
    };

    this.addModels();
    this.start();

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.mount) return;
      const w = this.mount.clientWidth;
      const h = this.mount.clientHeight;
      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    });
    this.resizeObserver.observe(this.mount);
  }

  addModels() {
    const scene = this.scene;

    const loadModel = (modelPath, materialColor, modelName, emissiveColor) => {
      return new Promise((resolve) => {
        const loader = new STLLoader();
        loader.load(modelPath, (geometry) => {
          geometry.computeVertexNormals();
          const material = new THREE.MeshPhongMaterial({
            color: materialColor,
            emissive: emissiveColor || new THREE.Color(0x000000),
            emissiveIntensity: 0.05,
            specular: new THREE.Color(0x444444),
            shininess: 120,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.name = modelName;
          mesh.position.set(0, 10, 0);
          mesh.scale.set(0.3, 0.3, 0.3);
          mesh.rotateX(Math.PI / 2 - 0.6);
          mesh.rotateZ(Math.PI);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add(mesh);
          resolve(mesh);
        });
      });
    };

    Promise.all([
      loadModel(Teeth,    new THREE.Color("rgb(252, 252, 252)"), "Teeth",  new THREE.Color(0x111111)),
      loadModel(Base,     new THREE.Color("rgb(255, 199, 250)"), "Base",   new THREE.Color(0x220011)),
      loadModel(STLModel, new THREE.Color("rgb(229, 198, 153)"), "Model",  new THREE.Color(0x110800)),
    ]).then(models => {
      this.models = models;

      // Staggered separation sequence
      // Teeth separate first at 5s, Base at 7.5s, Model base at 10s
      setTimeout(() => {
        this.separations["Teeth"].active = true;
      }, 5000);
      setTimeout(() => {
        this.separations["Base"].active = true;
      }, 7500);
      setTimeout(() => {
        this.separations["Model"].active = true;
      }, 10000);
    });
  }

  componentWillUnmount() {
    this.stop();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.mount && this.renderer) {
      this.mount.removeChild(this.renderer.domElement);
    }
    if (this.renderer) this.renderer.dispose();
  }

  start = () => {
    if (!this.frameId) {
      this.clock.start();
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
    this.frameId = null;
  };

  animate = () => {
    const delta = Math.min(this.clock.getDelta(), 0.05); // cap delta to avoid huge jumps after tab switch
    this.totalTime += delta;

    if (this.models) {
      this.models.forEach(mesh => {
        // Compound rotation: continuous Z spin + slow Y wobble
        // This gives a 3D tumbling feel rather than flat spin
        mesh.rotation.z += ROTATION_SPEED_Z * delta;
        
        // Y wobble — sinusoidal oscillation so it rocks back and forth
        // Each model gets a slightly different phase so they don't all move identically
        const phase = mesh.name === "Teeth" ? 0 : mesh.name === "Base" ? 0.8 : 1.6;
        mesh.rotation.y = Math.sin(this.totalTime * WOBBLE_SPEED + phase) * WOBBLE_AMPLITUDE;

        // Separation with easing
        const sep = this.separations[mesh.name];
        if (sep && sep.active && sep.progress < 1) {
          const prevProgress = sep.progress;
          sep.progress = Math.min(sep.progress + (TRANSLATION_SPEED * delta) / sep.limit, 1);

          // Apply eased step
          const prevEased = easeInOut(prevProgress) * sep.limit;
          const currEased = easeInOut(sep.progress) * sep.limit;
          const step = currEased - prevEased;

          mesh.position.addScaledVector(sep.direction, step);
        }
      });
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  };

  render() {
    return (
      <div
        style={{ width: "100%", height: "100vh" }}
        ref={mount => { this.mount = mount; }}
      />
    );
  }
}

export default ThreeScene2;