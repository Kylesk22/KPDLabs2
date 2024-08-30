import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import Sparkle from 'react-sparkle'
import "../../styles/home.css";
import "../../styles/slick-theme.css"
import "../../styles/slick.css"
import "../../styles/style.css"
import "../../styles/animate.css"
import { Fade, Slide } from "react-awesome-reveal";

import { Login } from "../component/Login";
import Crowns from "../../img/pexels-cottonbro-studio-6502306.jpg"
import { Link, Navigate } from "react-router-dom";
import { Modal } from 'react-bootstrap';

import ReactPlayer from 'react-player'
import CustomVideoPlayer from "../component/CustomVideoPlayer"

import "../../styles/_about.scss"
import "../../styles/_banner.scss"
import "../../styles/_benefit.scss"
import "../../styles/_button.scss"
import "../../styles/_call-to-action.scss"
import "../../styles/_client.scss"
import "../../styles/_contact.scss"
import "../../styles/_faq.scss"
import "../../styles/_feature.scss"
import "../../styles/_food.scss"
import "../../styles/_footer.scss"
import "../../styles/_funfact.scss"
import "../../styles/_googel-maps.scss"
import "../../styles/_header.scss"
import "../../styles/_main-slider.scss"
import "../../styles/_marquee.scss"
import "../../styles/_mega-menu.scss"
import "../../styles/_menegement.scss"
import "../../styles/_mobile-menu.scss"
import "../../styles/_news.scss"
import "../../styles/_offer.scss"
import "../../styles/_pricing.scss"
import "../../styles/_process.scss"
import "../../styles/_progress.scss"
import "../../styles/_reset.scss"
import "../../styles/_projects.scss"
import "../../styles/_room.scss"
import "../../styles/_search-popup.scss"
import "../../styles/_section-title.scss"
import "../../styles/_services.scss"
import "../../styles/_team.scss"
import "../../styles/_testimonials.scss"
import "../../styles/_what-we-do.scss"
import "../../styles/_why-choose.scss"
import "../../styles/_page-title.scss"



import * as THREE from "three";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ThreeScene2 from "../component/Scene2";
import { Scene3 } from "../component/Scene3";

import Zirc from "../../img/Crown.png"
import Lith from "../../img/LithiumDisilicateCrown.jpg"
import ZircV from "../../img/Veneer.png"
import LithV from "../../img/LithiumDisilicateVeneer.jpg"
import Partial from "../../img/TCS Unbreakable Partial Denture.png"
import Denture from "../../img/Denture.png"
import WaxRim from "../../img/WaxRim.jpg"
import TryIn from "../../img/TryIn.jpg"
import Ribbon from "../../img/Ribbon.png"
import Logo from "../../img/KPD-Transparent.png"
import BKG from "../../img/Background.jpg"
import Lines from "../../img/lines.jpg" 
import Intro from "../../img/footer-flip.jpg"
import AboutBKG from "../../img/testi-bg.jpg"
import Mill from "../../img/mill.jpg"
import Lines21 from "../../img/lines2-1.png"
import FootBKG from "../../img/footer-bg.jpg"
import Layer11 from "../../img/layer1-1.jpg"
import MillingClip from "../../img/MillingClip1080p2.mp4"
import Itero from "../../img/itero-logo-2-300x103.png"
import Cerec from "../../img/CEREC-Logo-removebg-preview-300x94.png"
import Shape from "../../img/3shape-logo-vector-removebg-preview-300x167.png"
import Medit from "../../img/medit-logo-300.png"

// import "../../styles/jquery"
// import "../../styles/jquery.fancybox"
// import "../../styles/jquery-ui"
// import "../../styles/jquery.form.min"
// import "../../styles/jquery.validate.min"
// import "../../styles/script"
// import "../../styles/fontawesome.css"
// import "../../styles/progress-bar"
// import "../../styles/popper.min"
// import "../../styles/mixitup"
// import "../../styles/wow"
// import "../../styles/slick.min"
// import "../../styles/slick-animation.min"
// import "../../styles/appear"




export const Home = (props) => {
	const { store, actions } = useContext(Context);
	const [image, setImage] = useState()
	const [scan, setScan] = useState()
	const isLargeScreen = window.innerWidth >= 992
	const [loggedIn, setLoggedIn] = useState(props.logState);
	const [pressedLogIn, setPressedLogin] = useState(false);
	const [show, setShow] = useState(props.logState);
	const [showModal, setShowModal] = useState(false);
	const [faq1, setFaq1] = useState(false)
	const [faq2, setFaq2] = useState(false)
	const [faq3, setFaq3] = useState(false)
	const [faq4, setFaq4] = useState(false)

	const [iteroShow, setIteroShow] = useState(false)
	const [cerecShow, setCerecShow] = useState(false)
	const [shapeShow, setShapeShow] = useState(false)
	const [meditShow, setMeditShow] = useState(false)

	const handleToggleModal = () => {
	  setShowModal(!showModal);
	};

	const handleClose = () => setShow(false);
	const handleShow = () => {
		setShow(true);
		console.log(loggedIn)
	
	};
	
	
	

	function submitHandler(e) {
		
		setImage(scan);
		console.log(scan)
	
	}
	
	function sendEmail() {
        var recipient = "kpdlabs@kpdlabs.com";
        var subject = "Feedback";
    
        window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
    }
	
	

	return (
		
// 		<> 
// 		<div >
// 			{(!sessionStorage.getItem("id"))?
// 			<div>
			
			
// 			<div className="row text-center ">
// 				<div className="d-none d-md-block col-lg-8 ms-auto me-auto ps-3">
					
// 					<ThreeScene2 />
					
// }
// 					{/* <Scene3/> */}
// 				</div>
				
// 				<div className="col-sm-12 col-lg-3 ms-auto me-auto" >
				
									
// 					<div className="text-center mt-5 ms-auto "  style={{zIndex:"1"}}>
						
// 						<h3 className="montserrat" style={{textShadow: "5px 5px 5px #000000, 5px 5px 5px #000000, 5px 5px 5px #000000, 5px 5px 5px #000000"}}>Our Promise</h3>
// 						<div className="montserrat" style={{color: "white", textShadow: "5px 5px 5px #000000, 5px 5px 5px #000000, 5px 5px 5px #000000, 5px 5px 5px #000000"}}>
// 							As a family-run Dental Lab, we synergize modern technology with time-tested methods to deliver unparalleled quality and design at affordable price points. Our commitment extends beyond mere production; we aim to streamline the entire process, reducing the hassle of lab-to-doctor communication. Through a blend of cutting-edge technology and personalized service, we guarantee clear communication and swift turnaround times, ensuring seamless integration from receiving the initial scan to the final placement with your patient’s full satisfaction.
// 						</div>
						
						
						
// 					</div>
			
			
// 				</div>
				
// 				<div className="d-none d-md-block col-lg-1">
					
// 				</div>
// 			</div>
// 			<div className="row ms-auto me-auto mt-5" id="products" >
// 				<h2 id="products" className="text-center" style={{backgroundImage: "linear-gradient(#996515, #FFD700)", color: "black"}}>
// 					<strong>Products</strong>
// 				</h2>
// 				<div className="col-sm-12 col-lg-3 text-center mt-3 ms-auto " 
// 				// style={{border: "solid", borderColor: "#FFD700"}}
// 				>
					
// 					<h4 style={{color: "#d4af37"}} id="products">Crown and Bridge</h4>
// 					<div className="card mt-3 mb-3" >
// 						<img className="card-img-top" src={Zirc} height="325px"/>
// 						<div className="card-body">
// 							<h5 className="card-title">Zirconia</h5>
// 							<p className="card-text"></p>
// 							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
// 						</div>
// 					</div>
// 					{/* <div className="card mt-3 mb-3" >
// 						<img className="card-img-top" src={Lith} height="325px"/>
// 						<div className="card-body">
// 							<h5 className="card-title">Lithium Disilicate</h5>
// 							<p className="card-text"></p>
// 							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700"}}>More Info</a>
// 						</div>
// 					</div> */}
// 				</div>
// 				<div className="col-sm-12 col-lg-3 text-center mt-3 ms-auto " 
// 				// style={{border: "solid", borderColor: "#FFD700"}}
// 				>
					
// 					<h4 id="products" style={{color: "#d4af37"}}>Veneer</h4>
// 					<div className="card mt-3 mb-3" >
// 						<img className="card-img-top" src={ZircV} height="325px"/>
// 						<div className="card-body">
// 							<h5 className="card-title">Zirconia</h5>
// 							<p className="card-text"></p>
// 							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
// 						</div>
// 					</div>
// 					{/* <div className="card mt-3 mb-3" >
// 						<img className="card-img-top" src={LithV} height="325px"/>
// 						<div className="card-body">
// 							<h5 className="card-title">Lithium Disilicate</h5>
// 							<p className="card-text"></p>
// 							<a href="#" className="btn btn-warning" style={{backgroundColor: "darkgoldenrod"}}>More Info</a>
// 						</div>
// 					</div> */}
// 				</div>
// 				<div className="col-sm-12 col-lg-3 text-center mt-3 ms-auto " 
// 				// style={{border: "solid", borderColor: "#FFD700"}}
// 				>
					
// 					<h4 id="products" style={{color: "#d4af37"}}>Partial</h4>
// 					<div className="card mt-3 mb-3" >
// 						<img className="card-img-top" src={Partial} height="325px"/>
// 						<div className="card-body">
// 							<h5 className="card-title"> TCS Unbreakable</h5>
// 							<p className="card-text"></p>
// 							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
// 						</div>
// 					</div>
// 				</div>
// 				<div className="col-sm-12 col-lg-3 text-center mt-3 ms-auto " 
// 				// style={{border: "solid", borderColor: "#FFD700"}}
// 				>
// 					<h4 id="products" style={{color: "#d4af37"}}>Denture</h4>
// 					<div className="card mt-3 mb-3" >
// 						<img className="card-img-top" src={Denture} height="325px"/>
// 						<div className="card-body">
// 							<h5 className="card-title"> PMMA base with Multilayer PMMA denture teeth</h5>
// 							<p className="card-text"></p>
// 							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
// 						</div>
// 					</div>
// 					<div className="card mt-3 mb-3" >
// 						<img className="card-img-top" src={WaxRim} height="325px"/>
// 						<div className="card-body">
// 							<h5 className="card-title">Wax rim with PMMA base plate</h5>
// 							<p className="card-text"></p>
// 							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
// 						</div>
// 					</div>
// 					<h4 id="products" style={{color: "#d4af37"}}>Denture</h4>
// 					<div className="card mt-3 mb-3" >
// 						<img className="card-img-top" src={TryIn} height="325px"/>
// 						<div className="card-body">
// 							<h5 className="card-title"> Wax try in monolithic PMMA denture</h5>
// 							<p className="card-text"></p>
// 							<a href="#" className="btn btn-warning" style={{backgroundColor: "#FFD700", color:"black"}}><strong>More Info</strong></a>
// 						</div>
// 					</div>
// 				</div>
				
// 			</div>
// 			</div>:<Navigate to= {`/account/${sessionStorage.getItem("id")}`}> </Navigate>}
// 		</div>
	<>
	{(!sessionStorage.getItem("id"))?
		<div className="page-wrapper">





{/* <section className="banner-section">
<div className="banner-slider slick-initialized slick-slider"><button className="slick-prev slick-arrow" aria-label="Previous" type="button" >Previous</button>
	<div className="slick-list draggable"><div className="slick-track" 
	// style={{opacity: 1, transform: `translate3d(-1470px, 0px, 0px)`}}
	><div className="banner-slide slick-slide slick-cloned" data-slick-index="-1" id="" aria-hidden="true" tabIndex="-1" 
	// style={{width: "1470px"}}
	> 
	<img src={BKG} alt=""/>
		<div className="outer-box">
			<div className="auto-container">
				<div className="content-box"> <span className="sub-title">Next level Automation System</span>
				<h1 data-animation-in="fadeInLeft" data-delay-in="0.2" className="fadeInLeft animated" 
// style={{opacity: 1, animationDelay: "0.2s"}}
>Cast Effective Digital Marketing Agency</h1>
					<div className="btn-box"> <a href="page-about.html" data-animation-in="fadeInUp" data-delay-in="0.4" className="theme-btn" tabIndex="-1" >Discover More</a> </div>
				</div>
			</div>
		</div>
	</div>
<div className="banner-slide slick-slide " data-slick-index="0" aria-hidden="false" tabIndex="0" 
// style={{width: "1470px"}}
> <img src={BKG} alt=""/>
<div className="outer-box">
<div className="auto-container">
<div className="content-box"> <span className="sub-title">Next level Automation System</span>
<h1 data-animation-in="fadeInLeft" data-delay-in="0.2" className="fadeInLeft animated" 
// style={{opacity: 1, animationDelay: "0.2s"}}
>Cast Effective Digital Marketing Agency</h1>
<div className="btn-box"> <a href="page-about.html" data-animation-in="fadeInUp" data-delay-in="0.4" className="theme-btn fadeInUp animated" tabIndex="0" 
// style={{opacity: 1, animationDelay: "0.4s"}}
>Discover More</a> </div>
</div>
</div>
</div>
</div><div className="banner-slide slick-slide " data-slick-index="1" aria-hidden="true" tabIndex="-1" 
// style={{width: "1470px"}}
> <img src={BKG} alt=""/>
<div className="outer-box">
<div className="auto-container">
<div className="content-box"> <span className="sub-title" data-animation-in="fadeInUp" data-delay-in="0.2" 
// style={{opacity: 0, animationDelay: "0.2s"}}
>Next level Automation System</span>
<h1 data-animation-in="fadeInLeft" data-delay-in="0.2" 
style={{opacity: 0, animationDelay: "0.2s"}} 
className="">Cast Effective Digital Marketing Agency</h1>
<div className="btn-box"> <a href="page-about.html" data-animation-in="fadeInUp" data-delay-in="0.4" className="theme-btn" tabIndex="-1" 
// style={{opacity: 1, animationDelay: "0.4s"}}
>Discover More</a> </div>
</div>
</div>
</div>
</div><div className="banner-slide slick-slide slick-cloned" data-slick-index="2" aria-hidden="true" tabIndex="-1" 
// style={{width: "1470px"}}
> <img src={BKG} alt=""/>
<div className="outer-box">
<div className="auto-container">
<div className="content-box"> <span className="sub-title">Next level Automation System</span>
<h1 data-animation-in="fadeInLeft" data-delay-in="0.2" 
// style={{opacity: 0, animationDelay: "0.2s"}} 
className="">Cast Effective Digital Marketing Agency</h1>
<div className="btn-box"> <a href="page-about.html" data-animation-in="fadeInUp" data-delay-in="0.4" className="theme-btn" tabIndex="-1" 
// style={{opacity: 1, animationDelay: "0.4s"}}
>Discover More</a> </div>
</div>
</div>
</div>
</div><div className="banner-slide slick-slide slick-cloned" data-slick-index="3" id="" aria-hidden="true" tabIndex="-1" 
// style={{width: "1470px"}}
> <img src={BKG} alt=""/>
<div className="outer-box">
<div className="auto-container">
<div className="content-box"> <span className="sub-title">Next level Automation System</span>
<h1 data-animation-in="fadeInLeft" data-delay-in="0.2" 
// style={{opacity: 0}}
>Cast Effective Digital Marketing Agency</h1>
<div className="btn-box"> <a href="page-about.html" data-animation-in="fadeInUp" data-delay-in="0.4" className="theme-btn" tabIndex="-1"  
// style={{opacity: 1, animationDelay: "0.4s"}}
>Discover More</a> </div>
</div>
</div>
</div>
</div><div className="banner-slide slick-slide slick-cloned" data-slick-index="4" id="" aria-hidden="true" tabIndex="-1" 
// style={{width: "1470px"}}
> <img src={BKG} alt=""/>
<div className="outer-box">
<div className="auto-container">
<div className="content-box"> <span className="sub-title" data-animation-in="fadeInUp" data-delay-in="0.2" 
// style={{opacity: "0"}}
>Next level Automation System</span>
<h1 data-animation-in="fadeInLeft" data-delay-in="0.2" 
// style={{opacity: "0"}}
>Cast Effective Digital Marketing Agency</h1>
<div className="btn-box"> <a href="page-about.html" data-animation-in="fadeInUp" data-delay-in="0.4" className="theme-btn" tabIndex="-1" 
// style={{opacity: "0"}}
>Discover More</a> </div>
</div>
</div>
</div>
</div><div className="banner-slide slick-slide slick-cloned" data-slick-index="5" id="" aria-hidden="true" tabIndex="-1" 
// style={{width: "1470px"}}
> <img src={BKG} alt=""/>
<div className="outer-box">
<div className="auto-container">
<div className="content-box"> <span className="sub-title">Next level Automation System</span>
<h1 data-animation-in="fadeInLeft" data-delay-in="0.2" 
// style={{opacity: 0}}
>Cast Effective Digital Marketing Agency</h1>
<div className="btn-box"> <a href="page-about.html" data-animation-in="fadeInUp" data-delay-in="0.4" className="theme-btn" tabIndex="-1" 
// style={{opacity: "0"}}
>Discover More</a> </div>
</div>
</div>
</div>
</div></div></div>


<button className="slick-next slick-arrow" aria-label="Next" type="button" >Next</button></div>
</section> */}

<section className="banner-section" >
  <div className="banner-slider slick-initialized slick-slider" >
	<div className="banner-slide" ><img src={Intro} style={{position: "absolute"}}/> 
	{/* <img src={BKG} alt=""/> */}
	
	  <div className="outer-box" style={{zIndex: "2"}} >
		<div className="auto-container" style={{zIndex: "2"}}>
		
		  <div className="content-box" style={{zIndex: "2"}}> 
		  <Fade cascade>
		  <ul>
			<li>
				
		  		<span className="sub-title">DENTAL SOLUTIONS</span>
				  
			</li>
		  	<li>
			<h1 data-animation-in="fadeInLeft" data-delay-in="0.2" >Wizards of <br/>Dental Technology
			<Sparkle
				minSize={6}
				maxSize={12}
				count={40}
				fadeOutSpeed={12}
				color={'#ffaa17'}
				flickerSpeed={'slowest'}

			/></h1>
			</li>
			<li>
			<div className="btn-box"> <a href="/signup" data-animation-in="fadeInUp" data-delay-in="0.4" className="theme-btn">Send Us A Case</a></div>
			</li>
			</ul>
			</Fade>
		  </div>
		  
		  
		</div>
	  </div>
	  <div className="d-none d-md-flex outer-box col-lg-8 float-end 3models" 
	  style={{width: "50%", height:"auto", position: "absolute", zIndex:"1", left:"auto", right:"0"}}
	  ><ThreeScene2/></div>
	  
	</div>
	

  </div>
  
</section>
{/* <!-- End banner-section -->




<!-- service section --> */}

<section className="contact-banner" style={{backgroundColor: "#F6F6F6"}}>
  <div className="auto-container">
	<div className="outer-box" style={{backgroundImage: `url(${Lines21})`, backgroundRepeat: "no-repeat"}}>
	  <div className="content-box wow fadeInLeft" data-wow-delay="400ms"> 
		{/* <span>We’re here for your dental needs. </span> */}
		<h3 className="title">Contact us for exclusive rates and bulk discounts!</h3>
	  </div>
	  <div className="btn-box wow fadeInRight" data-wow-delay="400ms"> <a href="mailto:kpdlabs@kpdlabs.com" className="ser-btn theme-btn">Get Rates</a> </div>
	</div>
  </div>
</section>



<section className="service-section pt-0 pb-0" style={{backgroundColor: "#f4f5f8"}}>
  <div className="auto-container" >
	<div className="row g-0"> 
	  {/* <!-- service-block --> */}
	  <div className="service-block col-lg-4 col-md-6 wow fadeInRight" data-wow-delay="400ms">
		<div className="inner-box">
		  <div className="icon-box"> <i className="fa-solid fa-award"></i>
			<h5 className="title"><a href="">Unparalleled Quality</a></h5>
		  </div>
		  <div className="text">Get the right fit, the first time</div>
		</div>
	  </div>
	  {/* <!-- service-block --> */}
	  <div className="service-block col-lg-4 col-md-6 wow fadeInRight" data-wow-delay="600ms">
		<div className="inner-box">
		  <div className="icon-box"> <i className="fa-solid fa-circle-dollar-to-slot"></i>
			<h5 className="title"><a href="">Affordable Price</a></h5>
		  </div>
		  <div className="text">Competitive pricing on all products</div>
		</div>
	  </div>
	  {/* <!-- service-block --> */}
	  <div className="service-block col-lg-4 col-md-6 wow fadeInRight" data-wow-delay="800ms">
		<div className="inner-box">
		  <div className="icon-box"> <i className="fa-solid fa-person-running"></i>
			<h5 className="title"><a href="">Quick Turnaround</a></h5>
		  </div>
		  <div className="text">Standard production 4-6 days</div>
		</div>
	  </div>
	</div>
  </div>
</section>
{/* <!-- End service-section -->

<!-- about-section --> */}
<section className="about-section" style={{backgroundImage: `url(${AboutBKG})`}}>
	
  <div className="auto-container">
	<div className="row"> 
	  {/* <!-- content-column --> */}
	  <div className="content-column col-lg-6 wow fadeInLeft" data-wow-delay="600ms">
		<div className="inner-column">
		  <div className="sec-title"> <span className="sub-title">KPD Labs ::::::</span>
			<h2>Our Promise</h2>
			<div className="text">As a family-run Dental Lab, we synergize modern technology with time-tested methods to deliver unparalleled quality and design at affordable price points. Our commitment extends beyond mere production; we aim to streamline the entire process, reducing the hassle of lab-to-doctor communication. Through a blend of cutting-edge technology and personalized service, we guarantee clear communication and swift turnaround times, ensuring seamless integration from receiving the initial scan to the final placement with your patient’s full satisfaction. </div>
		  </div>
		  <div className="row"> 
			{/* <!-- about-block --> */}
			{/* <div className="about-block col-sm-6">
			  <div className="inner-box">
				<div className="icon-box"> <i className="flaticon-support-2"></i>
				  <h4 className="title">Internal Networking</h4>
				</div>
				<div className="text">Lorem ipsum dolor sited amet consectetur notted </div>
			  </div>
			</div> */}
			{/* <!-- about-block --> */}
			{/* <div className="about-block col-sm-6">
			  <div className="inner-box">
				<div className="icon-box"> <i className="flaticon-typography"></i>
				  <h4 className="title">Manage IT Services</h4>
				</div>
				<div className="text">Lorem ipsum dolor sited amet consectetur notted </div>
			  </div>
			</div> */}
		  </div>
		  <div className="btn-box"> <a href="/aboutus" className="btn theme-btn">Discover More</a> 
		  {/* <img src={BKG} alt=""/>  */}
		  </div>
		</div>
	  </div>
	  {/* <!-- image-column --> */}
	  <div className="image-column col-lg-6 wow fadeInRight millvideo" data-wow-delay="600ms">
		<div className="inner-column">
		  <div className="image-box">
			
				

			{/* <div className="video-container">
			<video id="myVideo" width="320" height="240" controls muted className="play-now" data-fancybox="gallery" data-caption="">
				<source src={MillingClip} type="video/mp4"/>
			</video>
			
			</div> */}
			{/* <video width="320" height="240" controls muted className="play-now" data-fancybox="gallery" data-caption="">
				<source src={MillingClip} type="video/mp4"/>
			</video> */}
			<CustomVideoPlayer/>
			


		  </div>
		</div>
	  </div>
	</div>
	
  </div>
  
</section>

{/* <!-- End about-section -->

<!-- service-section --> */}
<section className="service-section-two" id="products">
  <div className="auto-container">
	<div className="sec-title text-center"> <span className="sub-title">::::::  PRODUCTS WE’RE OFFERING  ::::::</span>
	  <h2>Providing Quality Products<br/> At The Right Price</h2>
	</div>
	<div className="row "> 
	  {/* <!-- service-block-two --> */}
	  <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="400ms">
		<div className="inner-box">
		  <div className="image-box" >
			<figure className="image overlay-animr">
				
					<img src={Zirc} alt="" className="product-pic" />
				
			</figure>
			{/* <i className="flaticon-clock-1"></i> */}
		  </div>
		  <div className="content-box">
			<h4 className="title"><a href="/crownandbridge">Crown and Bridge</a></h4>

			<div className="text">Zirconia/PMMA Temporary</div>
			<a href="/crownandbridge" className="ser-btn">Read More<i className="fa-solid fa-angles-right"></i></a>
		  </div>
		</div>
	  </div>
	  {/* <!-- service-block-two --> */}
	  <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="600ms">
		<div className="inner-box">
		  <div className="image-box">
			<figure className="image overlay-anim"><img src={ZircV} alt="" className="product-pic" /></figure>
			{/* <i className="flaticon-monitor-1"></i> */}
		  </div>
		  <div className="content-box">
			<h4 className="title"><a href="/veneer">Veneer</a></h4>

			<div className="text">Zirconia/PMMA Temporary</div>
			<a href="/veneer" className="ser-btn">Read More<i className="fa-solid fa-angles-right"></i></a>
		  </div>
		</div>
	  </div>
	  {/* <!-- service-block-two --> */}
	  <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="800ms">
		<div className="inner-box">
		  <div className="image-box">
			<figure className="image overlay-anim"><img src={Partial} alt="" className="product-pic" /></figure>
			{/* <i className="flaticon-cog-1"></i> */}
		  </div>
		  <div className="content-box">
			<h4 className="title"><a href="/partial">Partial</a></h4>
	
			<div className="text">Milled TCS Unbreakable</div>
			<a href="/partial" className="ser-btn">Read More<i className="fa-solid fa-angles-right"></i></a>
		  </div>
		</div>
	  </div>
	  <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="800ms">
		<div className="inner-box">
		  <div className="image-box">
			<figure className="image overlay-anim"><img src={Denture} alt="" className="product-pic" /></figure>
			{/* <i className="flaticon-cog-1"></i> */}
		  </div>
		  <div className="content-box">
			<h4 className="title"><a href="/denture">Denture</a></h4>

			<div className="text">Milled Multilayer PMMA</div>
			<a href="/denture" className="ser-btn">Read More<i className="fa-solid fa-angles-right"></i></a>
		  </div>
		</div>
	  </div>
	</div>
  </div>
</section>
{/* <!-- End service-section -->

<!-- service-banner --> */}
{/* <section className="service-banner">
  <div className="auto-container">
	<div className="outer-box wow fadeInUp" data-wow-delay="400ms">
	  <h2>IT Solutions And Services <br/>at Your Fingertips</h2>
	  <a href="page-about.html" className="ser-btn theme-btn">Discover More</a>
	</div>
  </div>
</section> */}
{/* <!-- end service section --> 

<!-- project-section --> */}
<section className="project-section">
  <div className="auto-container">
	<div className="sec-title"> <span className="sub-title">CONNECT  ::::::</span>
	  <h2>Connect with KPD <br/>With Your Digital Provider</h2>
	  
	</div>
	<div style={{marginRight: "0px"}} className="outer-box">
	  <div className="row"> 
		<div className="project-block col-lg-3 col-sm-6 wow fadeInRight">
		<div style={{display: "flex", alignItems: "center", justifyContent: "center"}} onClick={()=>{(iteroShow)? setIteroShow(false): setIteroShow(true)}} 
		// className="project-block col-lg-3 col-sm-6 wow fadeInRight" 
		data-wow-delay="400ms">
		  <div className="inner-box" onClick={()=>{(iteroShow)? setIteroShow(false): setIteroShow(true)}}>
			<div className="image-box" style={{height: "100px", display: "flex", alignItems: "center"}}>
			  <figure className="image overlay-anim"><img src={Itero} alt=""/></figure>
			</div>
			<div className="content-box" > 
				{/* <span>Technology</span>
			  <h4 className="title"><a href="">iTero</a></h4> */}
			  {/* <a href="" className="angel-btn"><i className="fa-solid fa-angle-right"></i></a> */}
			</div>
			<i className={iteroShow ? "fa-solid fa-angle-down" : "fa-solid fa-angle-right"} 
			style={{position: "absolute"}}
			onClick={()=>{(iteroShow)? setIteroShow(false): setIteroShow(true)}}
			></i>
			{/* {(iteroShow)?
			<div style={{paddingTop: "10px"}}>
				<ul style={{listStyle: "initial"}}>
					<li style={{listStyle: "initial"}}> Login to your iTero/Align Tech Doctor’s portal</li>
					<li style={{listStyle: "initial"}}>Navigate to “Add Preferred Lab” and input our lab’s Company ID (420339) to connect your practice with KPD Labs directly.</li>
					<li style={{listStyle: "initial"}}>If any issues appear, please call iTero’s support line directly to set up KPD Labs as your “Preferred Lab” – simply give them our Company ID (420339) and they will connect your practice with our lab directly.</li>
				</ul>
		  </div>
			:""} */}
		  </div>
		  
		</div>
		{(iteroShow)?
			<div style={{paddingTop: "10px"}}>
				<ul style={{listStyle: "initial"}}>
					<li style={{listStyle: "initial"}}> Login to your iTero/Align Tech Doctor’s portal</li>
					<li style={{listStyle: "initial"}}>Navigate to “Add Preferred Lab” and input our lab’s Company ID (420339) to connect your practice with KPD Labs directly.</li>
					<li style={{listStyle: "initial"}}>If any issues appear, please call iTero’s support line directly to set up KPD Labs as your “Preferred Lab” – simply give them our Company ID (420339) and they will connect your practice with our lab directly.</li>
				</ul>
		  </div>
			:""}
		</div>
		
		<div className="project-block col-lg-3 col-sm-6 wow fadeInRight">
		<div style={{display: "flex", alignItems: "center", justifyContent: "center"}} onClick={()=>{(cerecShow)? setCerecShow(false): setCerecShow(true)}} data-wow-delay="600ms">
		  <div className="inner-box">
			<div className="image-box" style={{height: "100px", display: "flex", alignItems: "center"}}>
			  <figure className="image overlay-anim"><img src={Cerec} alt=""/></figure>
			</div>
			<div className="content-box" > 
				{/* <span>IDEA</span>
			  <h4 className="title"><a href="page-project-details.html">Design & Projects</a></h4> */}
			  {/* <a href="page-project-details.html" className="angel-btn"><i className="fa-solid fa-angle-right"></i></a> */}
			</div>
			<i className={cerecShow ? "fa-solid fa-angle-down" : "fa-solid fa-angle-right"} style={{position: "absolute"}} onClick={()=>{(cerecShow)? setCerecShow(false): setCerecShow(true)}}></i>
			{/* {(cerecShow)?
			<div style={{paddingTop: "10px"}}>
				<ul style={{listStyle: "initial"}}>
					<li style={{listStyle: "initial"}}>Login to your Sirona Connect Doctor’s Portal and navigate to “Add”</li>
					<li style={{listStyle: "initial"}}>Now under “My Account,” click on “My Favorite Laboratories”</li>
					<li style={{listStyle: "initial"}}>Click on “Search Labs”</li>
					<li style={{listStyle: "initial"}}>Enter KPD Labs in the Company Name field</li>
					<li style={{listStyle: "initial"}}>If you can’t find us you may also search by location – select “United States” and then enter KPD Labs’s Florida zip code: “33844” </li>
					<li style={{listStyle: "initial"}}>Find KPD Labs and click on the plus sign in the “Add” column all the way to the right</li>
					<li style={{listStyle: "initial"}}>Your scans are ready to be sent right away – just choose KPD Labs from your drop down menu.</li>
				</ul>
		  </div>
			:""} */}
		  </div>
		 
		</div>
		{(cerecShow)?
			<div style={{paddingTop: "10px"}}>
				<ul style={{listStyle: "initial"}}>
					<li style={{listStyle: "initial"}}>Login to your Sirona Connect Doctor’s Portal and navigate to “Add”</li>
					<li style={{listStyle: "initial"}}>Now under “My Account,” click on “My Favorite Laboratories”</li>
					<li style={{listStyle: "initial"}}>Click on “Search Labs”</li>
					<li style={{listStyle: "initial"}}>Enter KPD Labs in the Company Name field</li>
					<li style={{listStyle: "initial"}}>If you can’t find us you may also search by location – select “United States” and then enter KPD Labs’s Florida zip code: “33844” </li>
					<li style={{listStyle: "initial"}}>Find KPD Labs and click on the plus sign in the “Add” column all the way to the right</li>
					<li style={{listStyle: "initial"}}>Your scans are ready to be sent right away – just choose KPD Labs from your drop down menu.</li>
				</ul>
		  </div>
			:""}
		</div>
		
		<div className="project-block col-lg-3 col-sm-6 wow fadeInRight">
		<div style={{display: "flex", alignItems: "center", justifyContent: "center"}} onClick={()=>{(shapeShow)? setShapeShow(false): setShapeShow(true)}} data-wow-delay="800ms">
		  <div className="inner-box">
			<div className="image-box" style={{height: "100px", display: "flex", alignItems: "center"}}>
			  <figure className="image overlay-anim"><img src={Shape} alt=""/></figure>
			</div>
			<div className="content-box" > 
				{/* <span>Security</span>
			  <h4 className="title"><a href="page-project-details.html">Network Security</a></h4> */}
			  {/* <a href="page-project-details.html" className="angel-btn"><i className="fa-solid fa-angle-right"></i></a> */}
			</div>
			<i className={shapeShow ? "fa-solid fa-angle-down" : "fa-solid fa-angle-right"} style={{position: "absolute"}} onClick={()=>{(shapeShow)? setShapeShow(false): setShapeShow(true)}}></i>
			{/* {(shapeShow)?
			<div style={{paddingTop: "10px"}}>
				<ul style={{listStyle: "initial"}}>
					<li style={{listStyle: "initial"}}>Login to your 3Shape Communicate account</li>
					<li style={{listStyle: "initial"}}>Navigate to “More” and then select “Settings”</li>
					<li style={{listStyle: "initial"}}>In the menu, select “Connections” then “Labs” and then “Add”</li>
					<li style={{listStyle: "initial"}}>Click on “Add Connections”</li>
					<li style={{listStyle: "initial"}}>Type in our email address: kpdlabs@kpdlabs.com</li>
					<li style={{listStyle: "initial"}}>KPD Labs will be shown. Click “Connect”</li>
				</ul>
		  </div>
			: ""} */}
		  </div>
		 
		</div>
		{(shapeShow)?
			<div style={{paddingTop: "10px"}}>
				<ul style={{listStyle: "initial"}}>
					<li style={{listStyle: "initial"}}>Login to your 3Shape Communicate account</li>
					<li style={{listStyle: "initial"}}>Navigate to “More” and then select “Settings”</li>
					<li style={{listStyle: "initial"}}>In the menu, select “Connections” then “Labs” and then “Add”</li>
					<li style={{listStyle: "initial"}}>Click on “Add Connections”</li>
					<li style={{listStyle: "initial"}}>Type in our email address: kpdlabs@kpdlabs.com</li>
					<li style={{listStyle: "initial"}}>KPD Labs will be shown. Click “Connect”</li>
				</ul>
		  </div>
			: ""}
		</div>
		

		<div className="project-block col-lg-3 col-sm-6 wow fadeInRight">
		<div style={{display: "flex", alignItems: "center", justifyContent: "center"}} onClick={()=>{(meditShow)? setMeditShow(false): setMeditShow(true)}} data-wow-delay="1000ms">
		  <div className="inner-box">
			<div className="image-box" style={{height: "100px", display: "flex", alignItems: "center"}}>
			  <figure className="image overlay-anim"><img src={Medit} alt=""/></figure>
			</div>
			<div className="content-box" > 
				{/* <span>Development</span>
			  <h4 className="title"><a href="page-project-details.html">Tech Solution</a></h4> */}
			  {/* <a href="page-project-details.html" className="angel-btn"><i className="fa-solid fa-angle-right"></i></a> */}
			</div>
			<i className={meditShow ? "fa-solid fa-angle-down" : "fa-solid fa-angle-right"} style={{position: "absolute"}} onClick={()=>{(meditShow)? setMeditShow(false): setMeditShow(true)}}></i>
			{/* {(meditShow)?
			<div style={{paddingTop: "10px"}}>
				<ul style={{listStyle: "initial"}}>
					<li style={{listStyle: "initial"}}>Sign in through your Medit Link account</li>
					<li style={{listStyle: "initial"}}>Click on “Partners” in the left-hand column</li>
					<li style={{listStyle: "initial"}}>Select “Search for Partners” at the top</li>
					<li style={{listStyle: "initial"}}>Click in the search bar and type in our email address: kpdlabs@kpdlabs.com</li>
					<li style={{listStyle: "initial"}}>KPD Labs will populate. Select our lab to add us as a partner</li>
					
				</ul>
		  </div>
			:""} */}
		  </div>
		  
		</div>
		{(meditShow)?
			<div style={{paddingTop: "10px"}}>
				<ul style={{listStyle: "initial"}}>
					<li style={{listStyle: "initial"}}>Sign in through your Medit Link account</li>
					<li style={{listStyle: "initial"}}>Click on “Partners” in the left-hand column</li>
					<li style={{listStyle: "initial"}}>Select “Search for Partners” at the top</li>
					<li style={{listStyle: "initial"}}>Click in the search bar and type in our email address: kpdlabs@kpdlabs.com</li>
					<li style={{listStyle: "initial"}}>KPD Labs will populate. Select our lab to add us as a partner</li>
					
				</ul>
		  </div>
			:""}
		</div>



	  </div>
	</div>
  </div>
</section>
{/* <!-- End project-section --> 

<!-- client section --> */}
{/* <section className="client-section pt-0">
  <div className="auto-container">
	<div className="outer-box">
	  <figure className="image wow fadeInLeft" data-wow-delay="400ms"><a href="#"><img src={Denture} alt=""/></a></figure>
	  <figure className="image wow fadeInLeft" data-wow-delay="600ms"><a href="#"><img src={Denture} alt=""/></a></figure>
	  <figure className="image wow fadeInLeft" data-wow-delay="800ms"><a href="#"><img src={Denture} alt=""/></a></figure>
	  <figure className="image wow fadeInLeft" data-wow-delay="1000ms"><a href="#"><img src={Denture} alt=""/></a></figure>
	  <figure className="image wow fadeInLeft" data-wow-delay="1100ms"><a href="#"><img src={Denture} alt=""/></a></figure>
	</div>
  </div>
</section> */}
{/* <!-- End client section --> 

<!-- about-section-two --> */}
{/* <section className="about-section-two pt-0">
  <div className="auto-container">
	<div className="row">  */}
	  {/* <!-- image-column --> */}
	  {/* <div className="image-column col-lg-6 wow fadeInLeft" data-wow-delay="400ms">
		<div className="inner-column">
		  <div className="image-box">
			<figure className="image overlay-anim">  */}
			{/* <img src={Denture} alt=""/> */}
			  {/* <div className="btn-box"> <a href="https://www.youtube.com/watch?v=Fvae8nxzVz4" className="play-now" data-fancybox="gallery" data-caption=""><i className="icon fa fa-play" aria-hidden="true"></i><span className="ripple"></span></a> </div> */}
			{/* </figure>
			<div className="exp-box">
			  <h3 className="title">Professional Dental Lab You Can Trust</h3>
			</div>
		  </div>
		</div>
	  </div> */}
	  {/* <!-- content-column --> */}
	  {/* <div className="content-column col-lg-6 wow fadeInRight" data-wow-delay="400ms">
		<div className="inner-column">
		  <div className="sec-title"> <span className="sub-title">TECH MANAGEMENT  ::::::</span>
			<h2>The Best Source For IT Solutions</h2>
			<div className="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis. </div>
		  </div>
		  <div className="title-box">
			<h6 className="title">Lorem Ipsum is simply available typesetting industry been the industry standard. </h6>
		  </div>
		  <div className="content-box">  */}
			{/* <!--Skills--> */}
			{/* <div className="skills">  */}
			  {/* <!--Skill Item--> */}
			  {/* <div className="skill-item">
				<div className="skill-header">
				  <h6 className="skill-title">Technology</h6>
				</div>
				<div className="skill-bar">
				  <div className="bar-inner">
					<div className="bar progress-line" data-width="86">
					  <div className="skill-percentage">
						<div className="count-box"><span className="count-text" data-speed="3000" data-stop="86">0</span>%</div>
					  </div>
					</div>
				  </div>
				</div>
			  </div>
			</div>
		  </div>
		  <div className="btn-box"> <a href="page-about.html" className="ser-btn theme-btn">Discover More</a> </div>
		</div>
	  </div>
	</div>
  </div>
</section> */}
{/* <!-- End about-section-two --> 

<!-- testimonial-section --> */}
{/* <section className="testimonial-section">
  <div className="auto-container">
	<div className="row">  */}
	  {/* <!-- content-column --> */}
	  {/* <div className="content-column col-lg-5 col wow fadeInUp" data-wow-delay="400ms">
		<div className="inner-column">
		  <div className="sec-title"> <span className="sub-title">OUR FEEDBAKCS  ::::::</span>
			<h2>What They are Talking About Company</h2>
		  </div>
		  <div className="btn-wrap pt-slider">
			<button className="prev-btn"><i className="fa fa-angle-left"></i></button>
			<button className="next-btn"><i className="fa fa-angle-right"></i></button>
		  </div>
		</div>
	  </div> */}
	  {/* <!-- block-column --> */}
	  {/* <div className="col-lg-7 col-md-6 col-sm-12 wow fadeInRight" data-wow-delay="400ms">
		<div className="outer-box">
		  <div className="row testimonial-slider">  */}
			{/* <!-- testimonial-block --> */}
			{/* <div className="testimonial-block col-md-6">
			  <div className="inner-box">
				<ul className="rating">
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				</ul>
				<div className="auther-info">
				  <h4 className="name">Sarah Albert</h4>
				  <span className="designation">DESIGNER</span>
				  <div className="text">We believe in four pillars of influence that drive our growth. This is ingrained in everything we do We use technology to create a better and smarter environment </div>
				  <img src={Denture} alt=""/>
				</div>
			  </div>
			</div> */}
			{/* <!-- testimonial-block --> */}
			{/* <div className="testimonial-block col-md-6">
			  <div className="inner-box">
				<ul className="rating">
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				</ul>
				<div className="auther-info">
				  <h4 className="name">Kenvin Martin</h4>
				  <span className="designation">DESIGNER</span>
				  <div className="text">We believe in four pillars of influence that drive our growth. This is ingrained in everything we do We use technology to create a better and smarter environment </div>
				  <img src={Denture} alt=""/>
				</div>
			  </div>
			</div> */}
			{/* <!-- testimonial-block --> */}
			{/* <div className="testimonial-block col-md-6">
			  <div className="inner-box">
				<ul className="rating">
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				</ul>
				<div className="auther-info">
				  <h4 className="name">Sarah Albert</h4>
				  <span className="designation">DESIGNER</span>
				  <div className="text">We believe in four pillars of influence that drive our growth. This is ingrained in everything we do We use technology to create a better and smarter environment </div>
				  <img src={Denture} alt=""/>
				</div>
			  </div>
			</div> */}
			{/* <!-- testimonial-block --> */}
			{/* <div className="testimonial-block col-md-6">
			  <div className="inner-box">
				<ul className="rating">
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				  <li><i className="fa fa-star"></i></li>
				</ul>
				<div className="auther-info">
				  <h4 className="name">Kenvin Martin</h4>
				  <span className="designation">DESIGNER</span>
				  <div className="text">We believe in four pillars of influence that drive our growth. This is ingrained in everything we do We use technology to create a better and smarter environment </div>
				  <img src={Denture} alt=""/>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	</div>
  </div>
</section> */}
{/* <!-- End testimonial-section --> 

<!-- FAQ Section --> */}
<section className="faqs-section" style={{backgroundColor: "#F6F6F6"}}>
  <div className="auto-container">
	<div className="row"> 
	  {/* <!-- FAQ Column --> */}
	  <div className="faq-column col-lg-6 wow fadeInUp" data-wow-delay="400ms">
		<div className="inner-column">
		  <div className="sec-title"> <span className="sub-title">QUESTIONS & ANSWERS  ::::::</span>
			<h2>Frequently Asked <br/>Questions For You</h2>
		  </div>
		  <ul className="accordion-box">
			{/* <!--Block--> */}
			<li className={`accordion block ${faq1 ? 'active-block' : ''}`}>
			  <div className={`acc-btn ${faq1 ? 'active' : ''}`} onClick={()=>{
				!faq1 ? setFaq1(true): setFaq1(false)}}>How do I get started with KPD? <i className="icon fas fa-angle-right" 
			  ></i> </div>
			  <div className={`acc-content${faq1 ? 'current' : ''}`}>
				<div className="content">
				  <div className="text">Click <a href="/signup">signup</a> and make an account with us! Feel free to <a href="/contact">contact</a> us with any questions regarding signing up!</div>
				</div>
			  </div>
			</li>
			{/* <!--Block--> */}
			<li className={`accordion block ${faq2 ? 'active-block' : ''}`}>
			  <div className={`acc-btn ${faq2 ? 'active' : ''}`} onClick={()=>{
				!faq2 ? setFaq2(true): setFaq2(false)}}>What materials do we offer?<i className="icon fas fa-angle-right"  ></i> </div>
			  <div className={`acc-content${faq2 ? 'current' : ''}`}>
				<div className="content">
				  <div className="text">We currently offer Zirconia for crown, bridge, and veneer. Milled TCS unbreakable for partials. Milled Multiplayer PMMA With Gingival PMMA Base for Dentures.</div>
				</div>
			  </div>
			</li>
			{/* <!--Block--> */}
			<li className={`accordion block ${faq3 ? 'active-block' : ''}`}>
			  <div className={`acc-btn ${faq3 ? 'active' : ''}`} onClick={()=>{
				!faq3 ? setFaq3(true): setFaq3(false)}}>What are KPD's terms? <i className="icon fas fa-angle-right"  ></i> </div>
			  <div className={`acc-content${faq3 ? 'current' : ''}`}>
				<div className="content">
				  <div className="text">Check out our <a href="/terms">terms.</a></div>
				</div>
			  </div>
			</li>
			{/* <!--Block--> */}
			<li className={`accordion block ${faq4 ? 'active-block' : ''}`}>
			  <div className={`acc-btn ${faq4 ? 'active' : ''}`} onClick={()=>{
				!faq4 ? setFaq4(true): setFaq4(false)}}>What is KPD's turnaround time? <i className="icon fas fa-angle-right"  ></i> </div>
			  <div className={`acc-content${faq4 ? 'current' : ''}`}>
				<div className="content">
				  <div className="text">4-6 Business days on average with rush options available.</div>
				</div>
			  </div>
			</li>
		  </ul>
		</div>
	  </div>
	  <div className="image-column col-lg-6" style={{backgroundImage: `url(${Layer11})`, paddingRight: "20px"}} >
		{/* <img src={Layer11}></img> */}
		<div className="inner-column" style={{paddingTop: "20px"}}>
		  <div className="image-box text-center">
			<h2 style={{color: "white"}}>
				Check out our latest blog post
			</h2>
			<h4 style={{color: "white"}}>
			The Aesthetic and Functional Benefits of Super High Translucent Zirconia Finished with MiYO Liquid Ceramics for Anterior and Posterior Restorations

			</h4>
			<span style={{color: "white"}}>
				6/26/2024
			</span>
			<div style={{paddingTop: "20px", paddingBottom: "20px"}} className="btn-box"> 
				<a href="/blogs" className="theme-btn">All Blog Posts</a>
			</div>
			
		  </div>
		</div>
		
	  </div>
	  {/* <!-- image-column --> */}
	  {/* <div className="image-column col-lg-6 wow fadeInUp" data-wow-delay="600ms">
		<div className="inner-column">
		  <div className="image-box">
			<figure className="image overlay-anim"><img src={Denture} alt=""/></figure>
			<div className="exp-box bounce-y"> <i className="flaticon-chat"></i>
			  <h6 className="title">Top Quality Marketing Solution</h6>
			</div>
		  </div>
		</div>
	  </div> */}
	</div>
  </div>
</section>
{/* <!--End FAQ Section --> 

<!-- news-section --> */}
{/* <section className="news-section pt-0">
  <div className="auto-container">
	<div className="sec-title text-center wow fadeInUp" data-wow-delay="400ms"> <span className="sub-title">::::::  FROM THE BLOG  ::::::</span>
	  <h2>Our Latest News Update <br/>and Artical </h2>
	</div>
	<div className="row">  */}
	  {/* <!-- news-block --> */}
	  {/* <div className="news-block col-xl-4 col-md-6 wow fadeInUp" data-wow-delay="400ms">
		<div className="inner-box">
		  <div className="image-box">
			<figure className="image overlay-anim"><img src={Denture} alt=""/></figure>
			<span className="date">11 MAR, 2023</span>
		  </div>
		  <div className="content-box">
			<div className="auther-info"> <img src={Denture} alt=""/>
			  <ul className="auther-content">
				<li>By Jackson Mile</li>
				<li>3 Comments</li>
			  </ul>
			</div><h4 className="title"><a href="news-details.html">Crypto Exchange For influencers in China</a></h4>
			<a href="news-details.html" className="news-btn theme-btn"><span>Read More</span><i className="fa-solid fa-arrow-right"></i></a>
		  </div>
		</div>
	  </div> */}
	  {/* <!-- news-block --> */}
	  {/* <div className="news-block col-xl-4 col-md-6 wow fadeInUp" data-wow-delay="600ms">
		<div className="inner-box">
		  <div className="image-box">
			<figure className="image overlay-anim"><img src={Denture} alt=""/></figure>
			<span className="date">11 MAR, 2023</span>
		  </div>
		  <div className="content-box">
			<div className="auther-info"> <img src={Denture} alt=""/>
			  <ul className="auther-content">
				<li>By Jackson Mile</li>
				<li>3 Comments</li>
			  </ul>
			</div>
			<h4 className="title"><a href="news-details.html">Technology Support us Allows Erie to Serve</a></h4>
			<a href="news-details.html" className="news-btn theme-btn"><span>Read More</span><i className="fa-solid fa-arrow-right"></i></a>
		  </div>
		</div>
	  </div> */}
	  {/* <!-- news-block --> */}
	  {/* <div className="news-block col-xl-4 col-md-6 wow fadeInUp" data-wow-delay="800ms">
		<div className="inner-box">
		  <div className="image-box">
			<figure className="image overlay-anim"><img src={Denture} alt=""/></figure>
			<span className="date">11 MAR, 2023</span>
		  </div>
		  <div className="content-box">
			<div className="auther-info"> <img src={Denture} alt=""/>
			  <ul className="auther-content">
				<li>By Jackson Mile</li>
				<li>3 Comments</li>
			  </ul>
			</div>
			<h4 className="title"><a href="news-details.html">Necessity May Give us Best Virtual Court</a></h4>
			<a href="news-details.html" className="news-btn theme-btn"><span>Read More</span><i className="fa-solid fa-arrow-right"></i></a>
		  </div>
		</div>
	  </div> */}
	{/* </div>
  </div>
</section> */}
{/* <!-- End news-section -->

<!-- contact-banner --> */}
<section className="contact-banner" style={{backgroundColor: "#F6F6F6"}}>
  <div className="auto-container">
	<div className="outer-box" style={{backgroundImage: `url(${Lines21})`, backgroundRepeat: "no-repeat"}}>
	  <div className="content-box wow fadeInLeft" data-wow-delay="400ms"> <span>We’re here for your dental needs. </span>
		<h3 className="title">Ready to try out the Wizards of Dental Technology?</h3>
	  </div>
	  <div className="btn-box wow fadeInRight" data-wow-delay="400ms"> <a href="/signup" className="ser-btn theme-btn">Sign Up</a> </div>
	</div>
  </div>
</section>
{/* <!-- End contect-banner --> 

<!-- Main Footer --> */}
{/* <footer className="main-footer" style={{backgroundImage: `url(${FootBKG})`}}>
  <div className="bg-image"  ></div> */}
  {/* <!--Widgets Section--> */}
  {/* <div className="widgets-section">
	<div className="auto-container">
	  <div className="row">  */}
		{/* <!--Footer Column--> */}
		{/* <div className="footer-column col-lg-3 col-sm-6 wow fadeInLeft">
		  <div className="footer-widget about-widget">
			<div className="logo"><a href="index.html"><img src={Logo} alt="" /></a></div>
			<div className="text">Wizards of Dental Technology</div>
			<div className="subscribe-form"> */}
			  {/* <form method="post" action="#">
				<div className="form-group">
				  <input type="email" name="email" className="email"  placeholder="Your Address" required=""/>
				  <button type="button" className="theme-btn"><i className="fa fa-paper-plane"></i></button>
				</div>
			  </form> */}
			{/* </div>
		  </div>
		</div> */}
		{/* <!--Footer Column--> */}
		{/* <div className="footer-column col-lg-3 col-sm-6 wow fadeInLeft" data-wow-delay="400ms">
		  <div className="footer-widget gallery-widget">
			<h3 className="widget-title">Our Products</h3>
			<div className="widget-content">
			  <div className="outer clearfix">
				<figure className="image"> <a href="#"><img src={Denture} alt=""/></a> </figure>
				<figure className="image"> <a href="#"><img src={Denture} alt=""/></a> </figure>
				<figure className="image"> <a href="#"><img src={Denture} alt=""/></a> </figure> */}
				{/* <figure className="image"> <a href="#"><img src={Denture} alt=""/></a> </figure>
				<figure className="image"> <a href="#"><img src={Denture} alt=""/></a> </figure>
				<figure className="image"> <a href="#"><img src={Denture} alt=""/></a> </figure> */}
			  {/* </div>
			</div>
		  </div>
		</div> */}
		{/* <!--Footer Column--> */}
		{/* <div className="footer-column col-lg-3 col-sm-6 wow fadeInLeft" data-wow-delay="600ms">
		  <div className="footer-widget links-sec">
			<h3 className="widget-title">Quick Links</h3>
			<ul className="user-links">
			  <li><a href="/aboutus">About Us</a></li>
			  <li><a href="#">Products</a></li> */}
			  {/* <li><a href="#">News & Media</a></li>
			  <li><a href="#">Our Projects</a></li>
			  <li><a href="#">Our Services</a></li> */}
			  {/* <li><a href="#">Contact Us</a></li>
			</ul>
		  </div>
		</div> */}
		{/* <!--Footer Column--> */}
		{/* <div className="footer-column col-lg-3 col-sm-6 wow fadeInLeft" data-wow-delay="800ms">
		  <div className="footer-widget contact-widget">
			<h3 className="widget-title">Contact Now</h3>
			<div className="widget-content">
			  <div className="text"><i className="fa-solid fa-location-dot"></i>3393 US Hwy 17-92 West Haines City, FL, USA</div>
			  <ul className="contact-info">
				<li><i className="fas fa-envelope"></i> <a href="mailto:kpdlabs@kpdlabs.com">kpdlabs@kpdlabs.com</a><br/>
				</li>
				<li><i className="fas fa-phone"></i> <a href="tel:+926668880000">+92 666 888 0000</a><br/>
				</li>
			  </ul>
			  <ul className="social-icons">
				<li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
				<li><a href="#"><i className="fab fa-twitter"></i></a></li>
				<li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
				<li><a href="#"><i className="fab fa-google"></i></a></li>
			  </ul>
			</div>
		  </div>
		</div>
	  </div>
	</div>
  </div> */}
  
  {/* <!--Footer Bottom--> */}
  {/* <div className="footer-bottom"/>
	<div className="auto-container">
	  <div className="inner-container">
		<div className="copyright-text text-center">© zitch Copyright reserved by <a href="index.html">kodesolution.com</a>
		<a href="#" className="footer-btn"></a>
	  </div>
	</div>
  </div>
</footer> */}
{/* <!--End Main Footer --> */}


</div>



: <Navigate to= {`/account/${sessionStorage.getItem("id")}`}> </Navigate>}
	</>

	
);
};
