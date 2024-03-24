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

//import { mesh } from "./mesh";

class ThreeScene2 extends Component {
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.scene = new THREE.Scene();

    //Add Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // this.renderer.setClearColor("#263238");
    // this.renderer.setClearColor( 0xffffff, 0)
    this.renderer.setClearColor ( 0x000000, 0);
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    //add Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 20;
    this.camera.position.y = 20;

    //Camera Controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enablePan = false;
    // controls.maxDistance = controls.minDistance = yourfixeddistnace;  
    // controls.noKeys = true;
    // controls.noRotate = true;
    controls.enableZoom = false;
    

    //LIGHTS
    var lights = [];
    lights[0] = new THREE.PointLight(0x304ffe, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);
    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);
    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);

 
    //Simple Box with WireFrame
    this.addModels(this.scene);

    this.renderScene();
    //start animation

    
    this.start()

  }

  addModels(scene, renderer) {
    const color = new THREE.Color("rgb(252, 252, 252)");
    const color1 = new THREE.Color("rgb(248, 185, 216)");
    const color2 = new THREE.Color("rgb(255, 0, 0)");
    const emissive = new THREE.Color("rgb(48, 48, 48)");
   
    let startObject2 = false
    let startObject3 = false
    const loader2 = new STLLoader()
        loader2.load(Teeth, function (geometry) {
            let group = new THREE.Group()
            scene.add(group)
    
            const material = new THREE.MeshPhongMaterial({ color: color, emissive:emissive, specular: 0x111111, shininess: 200 }) 
            let mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(0, 10, 0)
            mesh.scale.set(.3, .3, .3)
            mesh.rotateX(Math.PI/2 -.6)
            mesh.rotateZ(Math.PI)
            mesh.castShadow = true
            mesh.receiveShadow = true
            
            
            function animate() {
              			requestAnimationFrame( animate );

              			mesh.rotation.z += 0.014
                    
                    if (mesh.rotation.z > 3.5 && mesh.position.z > -4)
                    mesh.translateZ(-.015)

                    
                    
                    
                   
                    
            
              		
            };
            
            animate();
    

            group.add(mesh)
        })

        const loader3 = new STLLoader()
        loader3.load(Base, function (geometry) {
            let group = new THREE.Group()
            scene.add(group)
    
            const material = new THREE.MeshPhongMaterial({ color:0xffc7fa, emissive:emissive, specular: 0x111111, shininess: 200 })            
            let mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(0, 10, 0)
            mesh.scale.set(.3, .3, .3)
            mesh.rotateX(Math.PI/2 -.6)
            mesh.rotateZ(Math.PI)
            mesh.castShadow = true
            mesh.receiveShadow = true
            
            function animate() {
              			requestAnimationFrame( animate );
                    mesh.rotation.z += 0.014
              			
                    if (mesh.rotation.z > 4.5 && mesh.position.z > -2)
                    mesh.translateZ(-.009)

                    
                   
              			
              		};
            
            animate();
    
          
            group.add(mesh)
        })

        const loader5 = new STLLoader()
        loader5.load(STLModel, function (geometry) {
            let group = new THREE.Group()
            scene.add(group)
    
            const material = new THREE.MeshPhongMaterial({ color: 0xe5c699, specular: 0x111111, shininess: 200 })
            let mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(0, 10, 0)
            mesh.scale.set(.3, .3, .3)
            mesh.rotateX(Math.PI/2 -.6)
            mesh.rotateZ(Math.PI)
            mesh.castShadow = true
            mesh.receiveShadow = true
            
            function animate() {
              			requestAnimationFrame( animate );
                    mesh.rotation.z += 0.014
              			
                    
                    
                   
              		
              		};
            
            animate();
    
            
            group.add(mesh)
        })
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
    // -----Step 3--------
    //Rotate Models
    // if (this.cube) this.cube.rotation.y += 0.01;
    // if (this.freedomMesh) this.freedomMesh.rotation.y += 0.01;

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