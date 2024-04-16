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
import "../../styles/slick-theme.css"
import "../../styles/slick.css"
import "../../styles/style.css"
import "../../styles/animate.css"
import { Fade, Slide } from "react-awesome-reveal";


export const Navbar = (props) => {
	const [loggedIn, setLoggedIn] = useState(props.logState);
	const [pressedLogIn, setPressedLogin] = useState(false);

	const [show, setShow] = useState(props.logState);
	const [showModal, setShowModal] = useState(false);

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
	
	return (
		(!loggedIn) ? 	
		<header className="main-header header-style-one">
		<div className="logo-box ">
		  <div className="logo ps-lg-4 ps-5 mx-auto"><a href="/"><img src={Logo} alt=""/></a></div>
		 <strong> <span style={{color: "white", fontSize: "12px"}}>Kronemeyer Precision</span><span style={{color: '#ffaa17', fontSize: "12px"}}> Dental Laboratories, LLC</span></strong>
		</div>
		{/* <!-- header-top --> */}
		<div className="header-top">
		  <div className="top-left">
			<ul>
			<li>
		<a href="https://www.google.com/maps/search/?api=1&query=3393+US+Hwy+17-92+West+Haines+City,+FL" target="_blank">
		  <i className="fas fa-location-dot"></i>
		  3393 US Hwy 17-92 West Haines City, FL
		</a>
	  </li>
			  <li><a href="" onClick={()=>sendEmail()}><i className="fas fa-envelope"></i>kpdlabs@kpdlabs.com</a></li>
			</ul>
		  </div>
		  <div className="top-right">
			<ul className="login-btn">
			  <li className="active"><a href="" onClick={handleToggleModal}><i className="fa-solid fa-user"></i>Login</a></li>
			  <Modal show={showModal} onHide={handleToggleModal}>
			  <Modal.Header closeButton>
				<Modal.Title>Login</Modal.Title>
			  </Modal.Header>
			  <Modal.Body>
				<Login logState={loggedIn} updateLogState={setLoggedIn} />
			  </Modal.Body>
			  {/* You can add a footer here if needed */}
			</Modal>
			  <li><a href="/signup">Sign up</a></li>
			</ul>
			<ul className="social-icons">
			  <li><a href="#"><i className="fa-brands fa-twitter"></i></a></li>
			  {/* <li><a href="#"><i className="fa-brands fa-google"></i></a></li> */}
			  <li><a href="#"><i className="fa-brands fa-facebook-f"></i></a></li>
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
				  <li><a href="/contactus">Contact</a></li>
				</ul>
			  </nav>
			  {/* <!-- Main Menu End-->  */}
			</div>
			<div className="outer-box"> <a href="tel:8634382102" className="content-btn"> <i className="fa-solid fa-phone"></i> <span>Call Anytime</span>
			  <h6 className="title">863-438-2102</h6>
			  </a>
			  <div className="search-btn"> <a href="#" className="search"><i className="fas fa-search"></i></a> </div>
			  <div className="btn"> <a href="page-contact.html" className="theme-btn">get solution</a> </div>
			  <div className="mobile-nav-toggler"> <i className="fa fa-bars"></i> </div>
			</div>
		  </div>
		</div>
		<div className="search-popup"> <span className="search-back-drop"></span>
	<button className="close-search"><span className="fa fa-times"></span></button>
	<div className="search-inner">
	  <form method="post" action="index.html">
		<div className="form-group">
		  <input type="search" name="search-field"  placeholder="Search..." required=""/>
		  <button type="submit"><i className="fa fa-search"></i></button>
		</div>
	  </form>
	</div>
  </div>
  {/* <!-- End Header Search -->  */}
  
  {/* <!-- Sticky Header  --> */}
  <div className="sticky-header">
	<div className="auto-container">
	  <div className="inner-container"> 
		{/* <!--Logo--> */}
		<div className="logo"> <a href="/" title=""><img src={Logo} alt="" title=""/></a> </div>
		
		{/* <!--Right Col--> */}
		<div className="nav-outer"> 
		  {/* <!-- Main Menu --> */}
		  <nav className="main-menu">
			<div className="navbar-collapse show collapse clearfix">
			  <ul className="navigation clearfix">
				{/* <!--Keep This Empty / Menu will come through Javascript--> */}
			  </ul>
			</div>
		  </nav>
		  {/* <!-- Main Menu End--> 
		  
		  <!--Mobile Navigation Toggler--> */}
		  <div className="mobile-nav-toggler"> <i className="fa fa-bars"></i> </div>
		</div>
	  </div>
	</div>
  </div>
  {/* <!-- End Sticky Menu -->  */}
</header>:""















		
		


	);
};

