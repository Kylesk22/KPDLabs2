import React, { Component } from "react";
import * as THREE from "three";
// import Lower from '../../../../public/Lower.stl'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { STLLoader } from "../component/Scan";
import {STLLoader} from "../../../../node_modules/three/examples/jsm/loaders/STLLoader"
import Teeth from "../../img/Teeth.stl"
import Base from "../../img/Base.stl"
import STLModel from "../../img/Model.stl"






///THISONE
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

//     const loadModel = (modelPath, materialColor) => {
//       const loader = new STLLoader();
//       loader.load(modelPath, function(geometry) {
//         const material = new THREE.MeshPhongMaterial({
//           color: materialColor,
//           specular: 0x111111,
//           shininess: 200
//         });
//         const mesh = new THREE.Mesh(geometry, material);
//         mesh.position.set(0, 10, 0);
//         mesh.scale.set(0.3, 0.3, 0.3);
//         mesh.rotateX(Math.PI / 2 - 0.6);
//         mesh.rotateZ(Math.PI);
//         mesh.castShadow = true;
//         mesh.receiveShadow = true;
//         scene.add(mesh);

//         // Start rotation immediately
//         startRotation(mesh);
//       });
//     };

//     const startRotation = mesh => {
//       const animateRotation = () => {
//         requestAnimationFrame(animateRotation);
//         mesh.rotation.z += 0.014; // Rotate the model
//       };
//       animateRotation();
//     };

//     const startTranslation = (mesh, delay) => {
//       setTimeout(() => {
//         const animateTranslation = () => {
//           requestAnimationFrame(animateTranslation);
//           mesh.translateZ(-0.015); // Translate the model
//         };
//         animateTranslation();
//       }, delay);
//     };

//     // Load all models simultaneously
//     loadModel(Teeth, new THREE.Color("rgb(252, 252, 252)"));
//     loadModel(Base, new THREE.Color("rgb(255, 199, 250)"));
//     loadModel(STLModel, new THREE.Color("rgb(229, 198, 153)"));

//     // Start translating each model with delays
//     setTimeout(() => startTranslation(scene.children[0], 1000), 2000); // Start translating Teeth after 2 seconds
//     setTimeout(() => startTranslation(scene.children[1], 2000), 3000); // Start translating Base after 3 seconds
//     setTimeout(() => startTranslation(scene.children[2], 3000), 4000); // Start translating STLModel after 4 seconds
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
//         style={{ width: "100%", height: "800px" }}
//         ref={mount => {
//           this.mount = mount;
//         }}
//       />
//     );
//   }
// }

// export default ThreeScene2;

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

//     const loadModel = (modelPath, materialColor) => {
//       const loader = new STLLoader();
//       loader.load(modelPath, function(geometry) {
//         const material = new THREE.MeshPhongMaterial({
//           color: materialColor,
//           specular: 0x111111,
//           shininess: 200
//         });
//         const mesh = new THREE.Mesh(geometry, material);
//         mesh.position.set(0, 10, 0);
//         mesh.scale.set(0.3, 0.3, 0.3);
//         mesh.rotateX(Math.PI / 2 - 0.6);
//         mesh.rotateZ(Math.PI);
//         mesh.castShadow = true;
//         mesh.receiveShadow = true;
//         scene.add(mesh);

//         // Start rotation immediately
//         startRotation(mesh);
//       });
//     };

//     const startRotation = mesh => {
//       const animateRotation = () => {
//         requestAnimationFrame(animateRotation);
//         mesh.rotation.z += 0.014; // Rotate the model
//       };
//       animateRotation();
//     };

//     const startTranslation = (mesh, delay) => {
//       setTimeout(() => {
//         const animateTranslation = () => {
//           requestAnimationFrame(animateTranslation);
//           mesh.position.z -= 0.015; // Translate the model along z-axis
//         };
//         animateTranslation();
//       }, delay);
//     };

//     // Load all models simultaneously
//     loadModel(Teeth, new THREE.Color("rgb(252, 252, 252)"));
//     loadModel(Base, new THREE.Color("rgb(255, 199, 250)"));
//     loadModel(STLModel, new THREE.Color("rgb(229, 198, 153)"));

//     // Start translating each model with delays
//     setTimeout(() => startTranslation(scene.children[1], 1000), 2000); // Start translating Teeth after 2 seconds
//     setTimeout(() => startTranslation(scene.children[2], 2000), 3000); // Start translating Base after 3 seconds
//     setTimeout(() => startTranslation(scene.children[3], 3000), 4000); // Start translating STLModel after 4 seconds
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
//         style={{ width: "100%", height: "800px" }}
//         ref={mount => {
//           this.mount = mount;
//         }}
//       />
//     );
//   }
// }

// export default ThreeScene2;


// NEAR PERFECT!!!!!!!!!!!!!
class ThreeScene2 extends Component {
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.scene = new THREE.Scene();

    // Add Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    // Add Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 20;
    this.camera.position.y = 20;

    // Camera Controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;

    // Lights
    const lights = [
      new THREE.PointLight(0x304ffe, 1, 0),
      new THREE.PointLight(0xffffff, 1, 0),
      new THREE.PointLight(0xffffff, 1, 0)
    ];
    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);
    lights.forEach(light => this.scene.add(light));

    // Add Models
    this.addModels();

    // Start animation loop
    this.start();
  }

  addModels() {
    const scene = this.scene;

    const loadModel = (modelPath, materialColor, modelName) => {
      return new Promise((resolve, reject) => {
        const loader = new STLLoader();
        loader.load(modelPath, function(geometry) {
          const material = new THREE.MeshPhongMaterial({
            color: materialColor,
            specular: 0x111111,
            shininess: 200
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.name = modelName
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

    const startRotation = mesh => {
      const animateRotation = () => {
        requestAnimationFrame(animateRotation);
        mesh.rotation.z += 0.014; // Rotate the model
      };
      animateRotation();
    };

    const startTranslation = (mesh, delay, distance) => {
      setTimeout(() => {
        const animateTranslation = () => {
          let initialPosition = mesh.position.z
          let dist= 0
          requestAnimationFrame(animateTranslation);
          // mesh.position.z -= distance; // Translate the model
          if (mesh.name === "Teeth"){
            if (dist - initialPosition < 3.5) {
              mesh.translateZ(-0.015); // Translate the model
              
              
            }}
          else if (mesh.name === "Base"){
            if (dist - initialPosition < 1.5) {
              mesh.translateZ(-0.015); // Translate the model
              
          }}
        };
        animateTranslation();
      }, delay);
    };

    Promise.all([
      loadModel(Teeth, new THREE.Color("rgb(252, 252, 252)"), "Teeth"),
      loadModel(Base, new THREE.Color("rgb(255, 199, 250)"), "Base"),
      loadModel(STLModel, new THREE.Color("rgb(229, 198, 153)"),"Model")
    ]).then(models => {
      // Start rotation immediately for all models
      models.forEach(model => startRotation(model));

      // Start translating each model with delays
      setTimeout(() => startTranslation(models[0], 2000, 0.01), 4000); // Start translating Teeth after 4 seconds
      setTimeout(() => startTranslation(models[1], 3000, 0.01), 5000); // Start translating Base after 5 seconds
      // setTimeout(() => startTranslation(models[2], 4000, 0.01), 6000); // Start translating STLModel after 6 seconds
    });
  }

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  animate = () => {
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  renderScene = () => {
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  };

  render() {
    return (
      <div
        style={{ width: "100%", height: "800px" }}
        ref={mount => {
          this.mount = mount;
        }}
      />
    );
  }
}

export default ThreeScene2;


