import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Login } from "../component/Login";
import Logo from "../../img/kpd_logo_final.png";
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
import "../../styles/adminSingle.css";

export const Navbar = (props) => {
	const [loggedIn, setLoggedIn] = useState(props.logState);
	const [show, setShow] = useState(props.logState);
	const [showModal, setShowModal] = useState(false);
	const [mobileActive, setMobileActive] = useState(false);
	const [displayProducts, setDisplayProducts] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const logoSize = isMobile
		? { height: "60px", width: "95px" }
		: { height: "110px", width: "175px" };

	const isTokenExpired = (token) => {
		const expirationCookie = getCookie(`${token}-expires`);
		if (!expirationCookie) return true;
		const expirationDate = new Date(expirationCookie);
		return new Date() > expirationDate;
	};

	function getCookie(name) {
		const cookies = document.cookie.split('; ');
		for (let cookie of cookies) {
			const [cookieName, cookieValue] = cookie.split('=');
			if (cookieName === name) return cookieValue;
		}
		return null;
	}

	const handleToggleModal = () => setShowModal(!showModal);

	function sendEmail() {
		var recipient = "kpdlabs@kpdlabs.com";
		var subject = "Feedback";
		window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
	}

	const logout = () => {
		sessionStorage.clear();
		setLoggedIn(false);
		props.updateLogState(false);
		window.location.href = "/";
	};

	const handleClose = () => setShow(false);
	const handleShow = () => { setShow(true); };

	useEffect(() => {
		sessionStorage.getItem("id") ? setLoggedIn(true) : setLoggedIn(false);
	});

	const clearCookies = () => {
		const cookies = document.cookie.split(';');
		cookies.forEach(cookie => {
			const [name] = cookie.split('=');
			document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
		});
	};

	return (
		(!loggedIn) ?
		<header className="main-header header-style-one">
			<div className="logo-box">
				<div className="logo"><a href="/"><img src={Logo} alt="" style={logoSize}/></a></div>
				<span style={{fontSize: "11px", whiteSpace: "nowrap"}}>
					<span style={{color: "white"}}>Kronemeyer Precision </span>
					<span style={{color: '#ffaa17'}}>Dental Laboratories, LLC</span>
				</span>
			</div>
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
						<li className="active"><a href="/login"><i className="fa-solid fa-user"></i>Login</a></li>
						<li><a href="/signup">Sign up</a></li>
					</ul>
					<ul className="social-icons no-print">
						<li><a href="https://www.instagram.com/kpd_labs?igsh=MzRlODBiNWFlZA=="><i className="fa-brands fa-instagram"></i></a></li>
						<li><a href="https://www.facebook.com/profile.php?id=61559674932411&mibextid=LQQJ4d"><i className="fa-brands fa-facebook-f"></i></a></li>
					</ul>
				</div>
			</div>
			<div className="header-lower">
				<div className="main-box">
					<div className="nav-outer">
						<nav className="nav main-menu">
							<ul className="navigation">
								<li className="current dropdown"><a href="/">Home</a></li>
								<li className="dropdown"><a href="/aboutus">About Us</a></li>
								<li className="dropdown"><a href="#">Products</a>
									<ul>
										<li><a href="/crownandbridge">Crown and Bridge</a></li>
										<li><a href="/veneer">Veneer</a></li>
										<li><a href="/partial">Partial</a></li>
										<li><a href="/denture">Denture</a></li>
									</ul>
								</li>
								<li className="resources-hide"><a href="/resources">Resources</a></li>
								<li><a href="/pricing">Pricing</a></li>
								<li className="nav-contact-us-hide"><a href="/contactus">Contact</a></li>
							</ul>
						</nav>
					</div>
					<div className="outer-box">
						<a href="tel:8634382102" className="content-btn">
							<i className="fa-solid fa-phone"></i>
							<span>Call Anytime</span>
							<h6 className="title">863-438-2109</h6>
						</a>
						<div className="btn"><a href="/signup" className="theme-btn">get solution</a></div>
						<div className="mobile-nav-toggler" onClick={()=>setMobileActive(true)}>
							<i className="fa-solid fa-bars mobile-menu-visible"></i>
						</div>
					</div>
				</div>
			</div>

			<div className={`${mobileActive ? 'mobile-menu-visible' : ''}`}>
				<div className="mobile-menu">
					<div className="menu-backdrop"></div>
					<nav className="menu-box">
						<div className="upper-box" style={{backgroundColor: "black"}}>
							<div className="nav-logo"><a href="/"><img src={Logo} alt="" style={{height: "70px", width: "111px"}}/></a></div>
							<div className="close-btn" onClick={()=>setMobileActive(false)}><i className="fas fa-times"></i></div>
						</div>
						<ul className="navigation clearfix">
							<li className="current dropdown"><a href="/">Home</a></li>
							<li className="dropdown"><a href="/aboutus">About Us</a></li>
							<li className="dropdown" onClick={()=>setDisplayProducts(true)}><a href="#">Products</a>
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
								<div className="contact-info-box"><i className="icon fas fa-phone" style={{fontSize: "25px"}}></i><span className="title">Call Now</span><a href="tel:863-438-2109">863-438-2109</a></div>
							</li>
							<li>
								<div className="contact-info-box"><span className="icon fas fa-envelope" style={{fontSize: "25px"}}></span><span className="title">Send Email</span><a href="mailto:kpdlabs@kpdlabs.com">kpdlabs@kpdlabs.com</a></div>
							</li>
							<li>
								<div className="contact-info-box"><i className="icon fas fa-clock" style={{fontSize: "25px"}}></i><span className="title">Hours</span> Mon - Fri 9:00AM - 5:00PM</div>
							</li>
							<li>
								<a href="https://www.google.com/maps/search/?api=1&query=3393+US+Hwy+17-92+West+Haines+City,+FL" target="_blank">
									<i className="icon fas fa-location-dot"></i>
									3393 US Hwy 17-92 West Haines City, FL 33844
								</a>
							</li>
						</ul>
						<ul className="social-links no-print">
							<li><a href="https://www.facebook.com/profile.php?id=61559674932411&mibextid=LQQJ4d"><i className="fab fa-facebook-f"></i></a></li>
							<li><a href="https://www.instagram.com/kpd_labs?igsh=MzRlODBiNWFlZA=="><i className="fab fa-instagram"></i></a></li>
						</ul>
					</nav>
				</div>
			</div>
		</header>

		:

		<header className="main-header header-style-one">
			<div className="logo-box">
				<div className="logo"><a href="/"><img src={Logo} alt="" style={logoSize}/></a></div>
				<span style={{fontSize: "11px", whiteSpace: "nowrap"}}>
					<span style={{color: "white"}}>Kronemeyer Precision </span>
					<span style={{color: '#ffaa17'}}>Dental Laboratories, LLC</span>
				</span>
			</div>
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
						<li className="active no-print" onClick={()=>logout()} style={{color: "white"}}>
							<i className="fa-solid fa-user" style={{color: "#ffaa17"}}></i> Logout
						</li>
					</ul>
					<ul className="social-icons no-print">
						<li className="no-print"><a href="https://www.facebook.com/profile.php?id=61559674932411&mibextid=LQQJ4d"><i className="fa-brands fa-twitter"></i></a></li>
						<li className="no-print"><a href="https://www.instagram.com/kpd_labs?igsh=MzRlODBiNWFlZA=="><i className="fa-brands fa-facebook-f"></i></a></li>
					</ul>
				</div>
			</div>
			<div className="header-lower mob-title" style={{backgroundColor: "#222429"}}>
				<div className="main-box" style={{marginLeft: "auto", marginRight: "auto"}}>
					<div className="nav-outer wizards mob-height" style={{marginLeft: "auto", marginRight: "auto", fontSize: "50px", color: "#ffaa17"}}>
						Wizards of Dental Technology
						<nav className="nav main-menu"></nav>
					</div>
					<div className="outer-box">
						<div className="mobile-nav-toggler" onClick={()=>setMobileActive(true)}>
							<i className="fa-solid fa-bars mobile-menu-visible"></i>
						</div>
					</div>
				</div>
			</div>

			<div className={`${mobileActive ? 'mobile-menu-visible' : ''}`}>
				<div className="mobile-menu">
					<div className="menu-backdrop"></div>
					<nav className="menu-box">
						<div className="upper-box" style={{backgroundColor: "black"}}>
							<div className="nav-logo"><a href="/"><img src={Logo} alt="" style={{height: "70px", width: "111px"}}/></a></div>
							<div className="close-btn" onClick={()=>setMobileActive(false)}><i className="fas fa-times"></i></div>
						</div>
						<ul className="navigation clearfix">
							<li className="current dropdown"><a onClick={()=>{props.setUserPage("home"); setMobileActive(false)}}>Home</a></li>
							<li className="dropdown"><a onClick={()=>{props.setUserPage("create"); setMobileActive(false)}}>Create A Case</a></li>
							<li className="dropdown"><a onClick={()=>{props.setUserPage("updateAccountInfo"); setMobileActive(false)}}>Update Account</a></li>
							<li><a onClick={()=>{props.setUserPage("contactUs"); setMobileActive(false)}}>Contact</a></li>
						</ul>
						<ul className="contact-list-one">
							<li>
								<div className="contact-info-box"><i className="icon fas fa-phone" style={{fontSize: "25px"}}></i><span className="title">Call Now</span><a href="tel:863-438-2109">863-438-2109</a></div>
							</li>
							<li>
								<div className="contact-info-box"><span className="icon fas fa-envelope" style={{fontSize: "25px"}}></span><span className="title">Send Email</span><a href="mailto:kpdlabs@kpdlabs.com">kpdlabs@kpdlabs.com</a></div>
							</li>
							<li>
								<div className="contact-info-box"><i className="icon fas fa-clock" style={{fontSize: "25px"}}></i><span className="title">Hours</span> Mon - Fri 9:00AM - 5:00PM</div>
							</li>
							<li>
								<a href="https://www.google.com/maps/search/?api=1&query=3393+US+Hwy+17-92+West+Haines+City,+FL" target="_blank">
									<i className="icon fas fa-location-dot"></i>
									3393 US Hwy 17-92 West Haines City, FL 33844
								</a>
							</li>
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
		</header>
	);
};

