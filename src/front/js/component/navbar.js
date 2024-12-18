import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Login } from "../component/Login";
import Logo from "../../img/KPD-Transparent.png"
import KPDLogo from "../../img/KPD-Logo.png"
import KPDtransparent from "../../img/KPD-Transparent.png"
import "../../styles/home.css";
import { Modal } from 'react-bootstrap';
import Sparkle from 'react-sparkle'
import "../../styles/home.css";
import "../../styles/index.css";
import "../../styles/slick-theme.css"
import "../../styles/slick.css"
import "../../styles/style.css"
import "../../styles/animate.css"
import { Fade, Slide } from "react-awesome-reveal";
import Wizards from "../../img/kpd_wizards-justletters.png"

import Painter from "../../fonts/SignPainter-HouseScript-Regular.ttf"
import "../../styles/adminSingle.css";





export const Navbar = (props) => {
	const [loggedIn, setLoggedIn] = useState(props.logState);
	const [pressedLogIn, setPressedLogin] = useState(false);

	const [show, setShow] = useState(props.logState);
	const [showModal, setShowModal] = useState(false);
	const [mobileActive, setMobileActive] = useState(false)
	const [displayProducts, setDisplayProducts] = useState(false)


	const fontFamily = `
    @font-face {
		font-family: "Painter2";
		src: local("SignPainter-HouseScript-Regular"),
			url("../../fonts/SignPainter-HouseScript-Regular.ttf") format("truetype");
			font-weight: normal;
			font-style: normal
    }
  `;





  
  
  const isTokenExpired = (token) => {
	const expirationCookie = getCookie(`${token}-expires`);
	if (!expirationCookie) return true; // No expiration date means expired or missing
  
	const expirationDate = new Date(expirationCookie);
	return new Date() > expirationDate; // Check if current date is past the expiration date
  };

  function getCookie(name) {
	console.log(`full cookie: ${document.cookie}`)
	const cookies = document.cookie.split('; ');
	for (let cookie of cookies) {
		const [cookieName, cookieValue] = cookie.split('=');
		if (cookieName === name) {
			return cookieValue;
		}
	}
	return null; // Return null if cookie not found
}






	const handleToggleModal = () => {
		setShowModal(!showModal);
	  };

	  function sendEmail() {
        var recipient = "kpdlabs@kpdlabs.com";
        var subject = "Feedback";
    
        window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
    }
	
  

	const logout = () => {
		sessionStorage.clear();
		setLoggedIn(false);
		props.updateLogState(false)
		window.location.href = "/";


	}

	const handleClose = () => setShow(false);
	const handleShow = () => {
		setShow(true);
		console.log(loggedIn)
	
	};
	
	useEffect(()=>{
		sessionStorage.getItem("id")?
		setLoggedIn(true):
		setLoggedIn(false)
		


		
	})

	const clearCookies = () => {
		const cookies = document.cookie.split(';');
	  
		cookies.forEach(cookie => {
		  const [name] = cookie.split('=');
		  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
		});
	  
		console.log('All cookies cleared');
	  };

	// useEffect(()=>{
	// 	let token = getCookie('csrf_access_token')
	// 	const expirationCookie = getCookie(`${token}-expires`);
	// 	console.log(`expired: ${expirationCookie}`)
	// 	console.log(`token: ${token}`)
	// 	console.log(`test: ${isTokenExpired(token)}`)
	// 	if (token !== null){
	// 		if (isTokenExpired(token) === true){
	// 			// clearCookies('.kpdlabs.com');
				
	// 		}
	// 		else{console.log("token fresh")}
	// 	}

	// })
	
	return (
		(!loggedIn) ? 	
		<header className="main-header header-style-one" >
			<div className="logo-box ">
			<div className="logo"><a href="/"><img src={Logo} alt=""/></a></div>
			<strong> <span className="logo-text" style={{color: "white", fontSize: "12px"}}>Kronemeyer Precision</span><span className="logo-text" style={{color: '#ffaa17', fontSize: "12px"}}> Dental Laboratories, LLC</span></strong>
			</div>
		{/* <!-- header-top --> */}
		<div className="header-top">
		  <div className="top-left">
			<ul>
			<li>
		<a href="https://www.google.com/maps/search/?api=1&query=3393+US+Hwy+17-92+West+Haines+City,+FL" target="_blank">
		  <i className="fas fa-location-dot"></i>
		  3393 US Hwy 17-92 West Haines City, FL 33844
		</a>
	  </li>
			  <li><a href="" onClick={()=>sendEmail()}><i className="fas fa-envelope"></i>kpdlabs@kpdlabs.com</a></li>
			</ul>
		  </div>
		  <div className="top-right no-print">
			<ul className="login-btn no-print">
			  <li className="active"><a href="/login" ><i className="fa-solid fa-user"></i>Login</a></li>
			  {/* <Modal show={showModal} onHide={handleToggleModal}>
			  <Modal.Header closeButton>
				<Modal.Title>Login</Modal.Title>
			  </Modal.Header>
			  <Modal.Body>
				<Login logState={loggedIn} updateLogState={setLoggedIn} />
			  </Modal.Body>
			</Modal> */}
			  <li><a href="/signup">Sign up</a></li>
			</ul>
			<ul className="social-icons no-print">
			  <li><a href="https://www.instagram.com/kpd_labs?igsh=MzRlODBiNWFlZA=="><i className="fa-brands fa-instagram"></i></a></li>
			  {/* <li><a href="#"><i className="fa-brands fa-google"></i></a></li> */}
			  <li><a href="https://www.facebook.com/profile.php?id=61559674932411&mibextid=LQQJ4d"><i className="fa-brands fa-facebook-f"></i></a></li>
			  {/* <li><a href="#"><i className="fa-brands fa-youtube"></i></a></li> */}
			</ul>
		  </div>
		</div>
		<div className="header-lower"> 
		  {/* <!-- Main box --> */}
		  <div className="main-box"> 
			{/* <!--Nav Box--> */}
			<div className="nav-outer">
			  <nav className="nav main-menu">
				<ul className="navigation">
				  <li className="current dropdown"> <a href="/">Home</a>
					
				  </li>
				  <li className="dropdown"> <a href="/aboutus">About Us</a>
					{/* <ul>
					  <li><a href="page-about.html">About</a></li>
					  <li className="dropdown"> <a href="#">Projects</a>
						<ul>
						  <li><a href="page-projects.html">Projects List</a></li>
						  <li><a href="page-project-details.html">Project Details</a></li>
						</ul>
					  </li>
					  <li className="dropdown"> <a href="#">Team</a>
						<ul>
						  <li><a href="page-team.html">Team List</a></li>
						  <li><a href="page-team-details.html">Team Details</a></li>
						</ul>
					  </li>
					  <li><a href="page-testimonial.html">Testimonial</a></li>
					  <li><a href="page-pricing.html">Pricing</a></li>
					  <li><a href="page-faq.html">FAQ</a></li>
					  <li><a href="page-404.html">Page 404</a></li>
					</ul> */}
				  </li>
				  <li className="dropdown"> <a href="#">Products</a>
					<ul>
					  <li><a href="/crownandbridge">Crown and Bridge</a></li>
					  <li><a href="/veneer">Veneer</a></li>
					  <li><a href="/partial">Partial</a></li>
					  <li><a href="/denture">Denture</a></li>
					</ul>
				  </li>
				  {/* <li className="dropdown"> <a href="#">Shop</a>
					<ul>
					  <li><a href="shop-products.html">Products</a></li>
					  <li><a href="shop-products-sidebar.html">Products with Sidebar</a></li>
					  <li><a href="shop-product-details.html">Product Details</a></li>
					  <li><a href="shop-cart.html">Cart</a></li>
					  <li><a href="shop-checkout.html">Checkout</a></li>
					</ul>
				  </li>
				  <li className="dropdown"> <a href="#">News</a>
					<ul>
					  <li><a href="news-grid.html">News Grid</a></li>
					  <li><a href="news-details.html">News Details</a></li>
					</ul>
				  </li> */}
				  <li className="resources-hide"><a href="/resources">Resources</a></li>
				  <li><a href="/pricing">Pricing</a></li>
				  <li className="nav-contact-us-hide"><a href="/contactus">Contact</a></li>
				</ul>
			  </nav>
			  {/* <!-- Main Menu End-->  */}
			</div>
			<div className="outer-box"> <a href="tel:8634382102" className="content-btn"> <i className="fa-solid fa-phone"></i> <span>Call Anytime</span>
			  <h6 className="title">863-438-2109</h6>
			  </a>
			  {/* <div className="search-btn"> <a href="#" className="search"><i className="fas fa-search"></i></a> </div> */}
			  <div className="btn"> <a href="/signup" className="theme-btn">get solution</a> </div>
			  <div className="mobile-nav-toggler"  onClick={()=>setMobileActive(true)}> <i className="fa-solid fa-bars mobile-menu-visible"></i> </div>
			</div>
		 </div>
		</div>

	<div className={`${mobileActive ? 'mobile-menu-visible' : ''}`} >
		<div className={`mobile-menu `} >
		<div className="menu-backdrop"></div>
		
		
		<nav className="menu-box">
			<div className="upper-box" style={{backgroundColor: "black"}}>
			<div className="nav-logo" ><a href="/"><img src={Logo} alt="" title=""/></a></div>
			<div className="close-btn" onClick={()=>setMobileActive(false)}><i className="fas fa-times"></i></div>
			</div>
			<ul className="navigation clearfix">
				<li className="current dropdown"> <a href="/">Home</a>
					
				</li>
				<li className="dropdown"> <a href="/aboutus">About Us</a></li>
				<li className="dropdown" onClick={()=>setDisplayProducts(true)}> <a href="#">Products</a>
					<ul style={{ display: displayProducts ? "block" : "none" }}>
					  <li><a href="/crownandbridge">Crown and Bridge</a></li>
					  <li><a href="/veneer">Veneer</a></li>
					  <li><a href="/partial">Partial</a></li>
					  <li><a href="/denture">Denture</a></li>
					</ul>
					<div className="dropdown-btn"><i className="fas fa-angle-down"></i></div>
				</li>
				<li><a href="/resources">Resources</a></li>
				<li><a href="/pricing">Pricing</a></li>
				<li><a href="/contactus">Contact</a></li>
			
			</ul>
			<ul className="contact-list-one">
			<li> 
			
				<div className="contact-info-box"> <i className="icon fas fa-phone" style={{fontSize: "25px"}}></i> <span className="title">Call Now</span> <a href="tel:863-438-2109">863-438-2109</a> </div>
			</li>
			<li> 
			
				<div className="contact-info-box"> <span className="icon fas fa-envelope" style={{fontSize: "25px"}}></span> <span className="title">Send Email</span> <a href="mailto:kpdlabs@kpdlabs.com">kpdlabs@kpdlabs.com</a> </div>
			</li>
			<li> 
				
				<div className="contact-info-box" onClick={()=>sendEmail()}> <i className="icon fas fa-clock" style={{fontSize: "25px"}}></i> <span className="title">Hours</span> Mon - Fri 9:00AM - 5:00PM</div>
			</li>
			<li>
		<a href="https://www.google.com/maps/search/?api=1&query=3393+US+Hwy+17-92+West+Haines+City,+FL" target="_blank">
		  <i className="icon fas fa-location-dot"></i>
		  3393 US Hwy 17-92 West Haines City, FL 33844
		</a>
	  </li>
			  {/* <li><a href="" onClick={()=>sendEmail()}><i className="icon fas fa-envelope"></i>kpdlabs@kpdlabs.com</a></li> */}
			</ul>
			<ul className="social-links no-print">
			<li><a href="https://www.facebook.com/profile.php?id=61559674932411&mibextid=LQQJ4d"><i className="fab fa-facebook-f"></i></a></li>
			<li><a href="https://www.instagram.com/kpd_labs?igsh=MzRlODBiNWFlZA=="><i className="fab fa-instagram"></i></a></li>
			</ul>
		</nav>
		</div>
	</div>





		{/* <div className="search-popup"> <span className="search-back-drop"></span>
	<button className="close-search"><span className="fa fa-times"></span></button>
	<div className="search-inner">
	  <form method="post" action="index.html">
		<div className="form-group">
		  <input type="search" name="search-field"  placeholder="Search..." required=""/>
		  <button type="submit"><i className="fa fa-search"></i></button>
		</div>
	  </form>
	</div>
  </div> */}
  {/* <!-- End Header Search -->  */}
  
  {/* <!-- Sticky Header  --> */}
  {/* <div className="sticky-header">
	<div className="auto-container">
	  <div className="inner-container">  */}
		{/* <!--Logo--> */}
		{/* <div className="logo"> <a href="/" title=""><img src={Logo} alt="" title=""/></a> </div> */}
		
		{/* <!--Right Col--> */}
		{/* <div className="nav-outer">  */}
		  {/* <!-- Main Menu --> */}
		  {/* <nav className="main-menu">
			<div className="navbar-collapse show collapse clearfix">
			  <ul className="navigation clearfix"> */}
				{/* <!--Keep This Empty / Menu will come through Javascript--> */}
			  {/* </ul>
			</div>
		  </nav> */}
		  {/* <!-- Main Menu End--> 
		  
		  <!--Mobile Navigation Toggler--> */}
		  {/* <div className="mobile-nav-toggler"> <i className="fas fa-bars"></i> </div>
		</div>
	  </div>
	</div>
  </div> */}
  {/* <!-- End Sticky Menu -->  */}
</header>:

<header className="main-header header-style-one" >
			<div className="logo-box ">
			<div className="logo"><a href="/"><img src={Logo} alt=""/></a></div>
			<strong> <span className="logo-text" style={{color: "white", fontSize: "12px"}}>Kronemeyer Precision</span><span className="logo-text" style={{color: '#ffaa17', fontSize: "12px"}}> Dental Laboratories, LLC</span></strong>
			</div>
		{/* <!-- header-top --> */}
		<div className="header-top">
		  <div className="top-left">
			<ul>
			<li>
		<a href="https://www.google.com/maps/search/?api=1&query=3393+US+Hwy+17-92+West+Haines+City,+FL" target="_blank">
		  <i className="fas fa-location-dot"></i>
		  3393 US Hwy 17-92 West Haines City, FL 33844
		</a>
	  </li>
			  <li><a href="" onClick={()=>sendEmail()}><i className="fas fa-envelope"></i>kpdlabs@kpdlabs.com</a></li>
			</ul>
		  </div>
		  <div className="top-right no-print">
			<ul className="login-btn no-print">
			  <li className="active no-print" onClick={()=>logout()} style={{color: "white"}}><i className="fa-solid fa-user" style={{color: "#ffaa17"}}></i> Logout</li>
			  {/* <Modal show={showModal} onHide={handleToggleModal}>
			  <Modal.Header closeButton>
				<Modal.Title>Login</Modal.Title>
			  </Modal.Header>
			  <Modal.Body>
				<Login logState={loggedIn} updateLogState={setLoggedIn} />
			  </Modal.Body>
			</Modal> */}
			  {/* <li><a href="/signup">Sign up</a></li> */}
			</ul>
			<ul className="social-icons no-print">
			  <li className="no-print"><a href="https://www.facebook.com/profile.php?id=61559674932411&mibextid=LQQJ4d"><i className="fa-brands fa-twitter"></i></a></li>
			  {/* <li><a href="#"><i className="fa-brands fa-google"></i></a></li> */}
			  <li className="no-print"><a href="https://www.instagram.com/kpd_labs?igsh=MzRlODBiNWFlZA=="><i className="fa-brands fa-facebook-f"></i></a></li>
			  {/* <li><a href="#"><i className="fa-brands fa-youtube"></i></a></li> */}
			</ul>
		  </div>
		</div>
		<div className="header-lower mob-title" style={{backgroundColor: "#222429"}}> 
		  {/* <!-- Main box --> */}
		  <div className="main-box" style={{marginLeft: "auto", marginRight: "auto" }}> 
			{/* <!--Nav Box--> */}
			<div className="nav-outer wizards mob-height" style={{marginLeft: "auto", marginRight: "auto", fontSize: "50px", color: "#ffaa17"}}> Wizards of Dental Technology
			  <nav className="nav main-menu">
				{/* <img src={Wizards}></img> */}
				{/* <ul className="navigation"> */}
				  {/* <li className="current dropdown"> <a href="/">Home</a>
					
				  </li>
				  <li className="dropdown"> <a href="/aboutus">About Us</a>
					
				  </li>
				  <li className="dropdown"> <a href="#">Products</a>
					<ul>
					  <li><a href="/crownandbridge">Crown and Bridge</a></li>
					  <li><a href="/veneer">Veneer</a></li>
					  <li><a href="/partial">Partial</a></li>
					  <li><a href="/denture">Denture</a></li>
					</ul>
				  </li>
				 
				  <li><a href="/contactus">Contact</a></li> */}
				{/* </ul> */}
			  </nav>
			  {/* <!-- Main Menu End-->  */}
			</div>
			<div className="outer-box"> 
			{/* <a href="tel:8634382102" className="content-btn"> <i className="fa-solid fa-phone"></i> <span>Call Anytime</span> */}
			  {/* <h6 className="title">863-438-2102</h6>
			  </a> */}
			  {/* <div className="search-btn"> <a href="#" className="search"><i className="fas fa-search"></i></a> </div> */}
			  {/* <div className="btn"> <a href="/contactus" className="theme-btn">get solution</a> </div> */}
			  <div className="mobile-nav-toggler"  onClick={()=>setMobileActive(true)}> <i className="fa-solid fa-bars mobile-menu-visible"></i> </div>
			</div>
		 </div>
		</div>

	<div className={`${mobileActive ? 'mobile-menu-visible' : ''}`} >
		<div className={`mobile-menu `} >
		<div className="menu-backdrop"></div>
		
		
		<nav className="menu-box">
			<div className="upper-box" style={{backgroundColor: "black"}}>
			<div className="nav-logo" ><a href="/"><img src={Logo} alt="" title=""/></a></div>
			<div className="close-btn" onClick={()=>setMobileActive(false)}><i className="fas fa-times"></i></div>
			</div>
			<ul className="navigation clearfix">
				<li className="current dropdown"> <a onClick={()=>{props.setUserPage("home"); setMobileActive(false)}}>Home</a>
					
				</li>
				<li className="dropdown"> <a onClick={()=>{props.setUserPage("create"); setMobileActive(false)}}>Create A Case</a></li>
				<li className="dropdown" > <a onClick={()=>{props.setUserPage("updateAccountInfo"); setMobileActive(false)}}>Update Account</a>
					
					
				</li>
				<li><a onClick={()=>{props.setUserPage("contactUs"); setMobileActive(false)}}>Contact</a></li>
			
			</ul>
			<ul className="contact-list-one">
			<li> 
			
				<div className="contact-info-box"> <i className="icon fas fa-phone" style={{fontSize: "25px"}}></i> <span className="title">Call Now</span> <a href="tel:863-438-2109">863-438-2109</a> </div>
			</li>
			<li> 
			
				<div className="contact-info-box"> <span className="icon fas fa-envelope" style={{fontSize: "25px"}}></span> <span className="title">Send Email</span> <a href="mailto:kpdlabs@kpdlabs.com">kpdlabs@kpdlabs.com</a> </div>
			</li>
			<li> 
				
				<div className="contact-info-box"> <i className="icon fas fa-clock" style={{fontSize: "25px"}}></i> <span className="title">Hours</span> Mon - Fri 9:00AM - 5:00PM</div>
			</li>
			<li>
		<a href="https://www.google.com/maps/search/?api=1&query=3393+US+Hwy+17-92+West+Haines+City,+FL" target="_blank">
		  <i className="icon fas fa-location-dot"></i>
		  3393 US Hwy 17-92 West Haines City, FL 33844
		</a>
	  </li>
			  {/* <li><a href="" onClick={()=>sendEmail()}><i className="icon fas fa-envelope"></i>kpdlabs@kpdlabs.com</a></li> */}
			</ul>
			<ul className="social-links">
			<li><a href="#"><i className="fab fa-twitter"></i></a></li>
			<li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
			<li><a href="#"><i className="fab fa-pinterest"></i></a></li>
			<li><a href="#"><i className="fab fa-instagram"></i></a></li>
			</ul>
		</nav>
		</div>
	</div>





		{/* <div className="search-popup"> <span className="search-back-drop"></span>
	<button className="close-search"><span className="fa fa-times"></span></button>
	<div className="search-inner">
	  <form method="post" action="index.html">
		<div className="form-group">
		  <input type="search" name="search-field"  placeholder="Search..." required=""/>
		  <button type="submit"><i className="fa fa-search"></i></button>
		</div>
	  </form>
	</div>
  </div> */}
  {/* <!-- End Header Search -->  */}
  
  {/* <!-- Sticky Header  --> */}
  {/* <div className="sticky-header">
	<div className="auto-container">
	  <div className="inner-container">  */}
		{/* <!--Logo--> */}
		{/* <div className="logo"> <a href="/" title=""><img src={Logo} alt="" title=""/></a> </div> */}
		
		{/* <!--Right Col--> */}
		{/* <div className="nav-outer">  */}
		  {/* <!-- Main Menu --> */}
		  {/* <nav className="main-menu">
			<div className="navbar-collapse show collapse clearfix">
			  <ul className="navigation clearfix"> */}
				{/* <!--Keep This Empty / Menu will come through Javascript--> */}
			  {/* </ul>
			</div>
		  </nav> */}
		  {/* <!-- Main Menu End--> 
		  
		  <!--Mobile Navigation Toggler--> */}
		  {/* <div className="mobile-nav-toggler"> <i className="fas fa-bars"></i> </div>
		</div>
	  </div>
	</div>
  </div> */}
  {/* <!-- End Sticky Menu -->  */}
</header>















		
		


	);
};

