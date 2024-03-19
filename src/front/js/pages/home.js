import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import { Login } from "../component/Login";
import Crowns from "../../img/pexels-cottonbro-studio-6502306.jpg"
import { Link, Navigate } from "react-router-dom";



import * as THREE from "three";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ThreeScene2 from "../component/Scene2";
import { Scene3 } from "../component/Scene3";

import Zirc from "../../img/zirconia.png"
import Lith from "../../img/LithiumDisilicateCrown.jpg"
import ZircV from "../../img/ZircVeneer.jpg"
import LithV from "../../img/LithiumDisilicateVeneer.jpg"
import Partial from "../../img/TCS Unbreakable Partial Denture.png"
import Denture from "../../img/Denture.jpg"
import WaxRim from "../../img/WaxRim.jpg"
import TryIn from "../../img/TryIn.jpg"
import Ribbon from "../../img/Ribbon.png"





export const Home = () => {
	const { store, actions } = useContext(Context);
	const [image, setImage] = useState()
	const [scan, setScan] = useState()
	const [loggedIn, setLoggedIn] =useState(false);
	const isLargeScreen = window.innerWidth >= 992
	const[isLoaded, setIsLoaded] = useState(false)
	
	
	

	function submitHandler(e) {
		
		setImage(scan);
		console.log(scan)
	
	}
	
	
	

	return (
		<> 
		<div >
			{(!sessionStorage.getItem("id"))?
			<div>
			
			
			<div className="row text-center">
				<div className="d-none d-md-block col-lg-8 ms-auto me-auto">
					<ThreeScene2 />
					{/* <Scene3/> */}
				</div>
				
				<div className="col-sm-12 col-lg-3 ms-auto me-auto" >
				
									
					<div className="text-center mt-5 ms-auto "  style={{zIndex:"1"}}>
						
						<h3 style={{textShadow: "5px 5px 5px #000000, 5px 5px 5px #000000, 5px 5px 5px #000000, 5px 5px 5px #000000"}}>Our Promise</h3>
						<div style={{color: "white", textShadow: "5px 5px 5px #000000, 5px 5px 5px #000000, 5px 5px 5px #000000, 5px 5px 5px #000000"}}>
							As a family-run Dental Lab, we synergize modern technology with time-tested methods to deliver unparalleled quality and design at affordable price points. Our commitment extends beyond mere production; we aim to streamline the entire process, reducing the hassle of lab-to-doctor communication. Through a blend of cutting-edge technology and personalized service, we guarantee clear communication and swift turnaround times, ensuring seamless integration from receiving the initial scan to the final placement with your patient’s full satisfaction.
						</div>
						
						
						
					</div>
			
			
				</div>
				
				<div className="d-none d-md-block col-lg-1">
					
				</div>
			</div>
			<div className="row ms-auto me-auto mt-5" id="products" >
				<h2 className="text-center" style={{backgroundImage: "linear-gradient(#996515, #FFD700)", color: "black"}}>
					<strong>Products</strong>
				</h2>
				<div className="col-sm-12 col-lg-3 text-center mt-3 ms-auto " 
				// style={{border: "solid", borderColor: "#FFD700"}}
				>
					
					<h4 style={{color: "#FFD700"}}>Crown and Bridge</h4>
					<div className="card mt-3 mb-3" >
						<img className="card-img-top" src={Zirc} height="325px"/>
						<div className="card-body">
							<h5 className="card-title">Zirconia</h5>
							<p className="card-text"></p>
							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
						</div>
					</div>
					{/* <div className="card mt-3 mb-3" >
						<img className="card-img-top" src={Lith} height="325px"/>
						<div className="card-body">
							<h5 className="card-title">Lithium Disilicate</h5>
							<p className="card-text"></p>
							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700"}}>More Info</a>
						</div>
					</div> */}
				</div>
				<div className="col-sm-12 col-lg-3 text-center mt-3 ms-auto " 
				// style={{border: "solid", borderColor: "#FFD700"}}
				>
					
					<h4 style={{color: "#FFD700"}}>Veneer</h4>
					<div className="card mt-3 mb-3" >
						<img className="card-img-top" src={ZircV} height="325px"/>
						<div className="card-body">
							<h5 className="card-title">Zirconia</h5>
							<p className="card-text"></p>
							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
						</div>
					</div>
					{/* <div className="card mt-3 mb-3" >
						<img className="card-img-top" src={LithV} height="325px"/>
						<div className="card-body">
							<h5 className="card-title">Lithium Disilicate</h5>
							<p className="card-text"></p>
							<a href="#" className="btn btn-warning" style={{backgroundColor: "darkgoldenrod"}}>More Info</a>
						</div>
					</div> */}
				</div>
				<div className="col-sm-12 col-lg-3 text-center mt-3 ms-auto " 
				// style={{border: "solid", borderColor: "#FFD700"}}
				>
					
					<h4 style={{color: "#FFD700"}}>Partial</h4>
					<div className="card mt-3 mb-3" >
						<img className="card-img-top" src={Partial} height="325px"/>
						<div className="card-body">
							<h5 className="card-title"> TCS Unbreakable</h5>
							<p className="card-text"></p>
							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
						</div>
					</div>
				</div>
				<div className="col-sm-12 col-lg-3 text-center mt-3 ms-auto " 
				// style={{border: "solid", borderColor: "#FFD700"}}
				>
					<h4 style={{color: "#FFD700"}}>Denture</h4>
					<div className="card mt-3 mb-3" >
						<img className="card-img-top" src={Denture} height="325px"/>
						<div className="card-body">
							<h5 className="card-title"> PMMA base with Multilayer PMMA denture teeth</h5>
							<p className="card-text"></p>
							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
						</div>
					</div>
					<div className="card mt-3 mb-3" >
						<img className="card-img-top" src={WaxRim} height="325px"/>
						<div className="card-body">
							<h5 className="card-title">Wax rim with PMMA base plate</h5>
							<p className="card-text"></p>
							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
						</div>
					</div>
					<h4 style={{color: "#FFD700"}}>Denture</h4>
					<div className="card mt-3 mb-3" >
						<img className="card-img-top" src={TryIn} height="325px"/>
						<div className="card-body">
							<h5 className="card-title"> Wax try in monolithic PMMA denture</h5>
							<p className="card-text"></p>
							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
						</div>
					</div>
				</div>
				
			</div>
			</div>:<Navigate to= {`/account/${sessionStorage.getItem("id")}`}> </Navigate>}
		</div>
:""}</>
	);
};
