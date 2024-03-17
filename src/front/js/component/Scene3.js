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
import { Camera } from "three";

export const Scene3 = () => {

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera( 75, 100/100 , 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#bg')})
   
    renderer.setSize(100,100)
    camera.position.setZ(30);

    renderer.render(scene, camera)

    




    return(
        <Canvas id="bg" style={{width: "100%"}}>
            <Camera/>
        </Canvas>
    )
}