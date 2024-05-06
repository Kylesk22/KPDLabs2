import React, { Component } from "react";

import FootBKG from "../../img/footer-bg.jpg"
import Logo from "../../img/KPD-Transparent.png"
import Denture from "../../img/Denture.jpg"

import "../../styles/home.css";
import "../../styles/slick-theme.css"
import "../../styles/slick.css"
import "../../styles/style.css"
import "../../styles/animate.css"

export const Footer = () => {
	// Create a new Date object
const currentDate = new Date();

// Get the current year
const currentYear = currentDate.getFullYear();





return (
	<footer className="main-footer" style={{backgroundImage: `url(${FootBKG})`}}>
  <div className="bg-image"  ></div>
  {/* <!--Widgets Section--> */}
  <div className="widgets-section">
	<div className="auto-container">
	  <div className="row"> 
		{/* <!--Footer Column--> */}
		<div className="footer-column col-lg-4 col-sm-6 wow fadeInLeft">
		  <div className="footer-widget about-widget text-center text-lg-start">
			<div className="logo ps-4"><a href="/"><img src={Logo} alt="" /></a></div>
			<strong> <span style={{color: "white", fontSize: "12px"}}>Kronemeyer Precision</span><span style={{color: '#ffaa17', fontSize: "12px"}}> Dental Laboratories, LLC</span></strong>
			{/* <div className="subscribe-form"> */}
			  {/* <form method="post" action="#">
				<div className="form-group">
				  <input type="email" name="email" className="email"  placeholder="Your Address" required=""/>
				  <button type="button" className="theme-btn"><i className="fa fa-paper-plane"></i></button>
				</div>
			  </form> */}
			{/* </div> */}
		  </div>
		</div>
		{/* <!--Footer Column--> */}
		{/* <div className="footer-column col-lg-3 col-sm-6 wow fadeInLeft" data-wow-delay="400ms"> */}
		  {/* <div className="footer-widget gallery-widget">
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
		  </div> */}
		{/* </div> */}
		{/* <!--Footer Column--> */}
		<div className="footer-column col-lg-4 col-sm-6 fadeInLeft" >
		  <div className="footer-widget contact-widget">
			<h3 className="widget-title">Quick Links</h3>
			{/* <ul className="widget-content">
			  <li><a href="/aboutus">About Us</a></li>
			  <li><a href="#">Products</a></li>
			  <li><a href="/contactus">Contact Us</a></li>
			</ul> */}
			<ul className="contact-info ">
				<li><i className="fa-solid fa-angle-right"></i> <a href="/aboutus">About Us</a><br/>
				</li>
				<li><i className="fa-solid fa-angle-right"></i> <a href="#products">Products</a><br/>
				</li>
				<li><i className="fa-solid fa-angle-right"></i> <a href="/contactus">Contact Us</a><br/>
				</li>
			  </ul>
		  </div>
		</div>
		{/* <!--Footer Column--> */}
		<div className="footer-column col-lg-4 col-sm-6 fadeInLeft" >
		  <div className="footer-widget contact-widget">
			<h3 className="widget-title ">Contact Now</h3>
			<div className="widget-content ">
			  <div className="text"><i className="fa-solid fa-location-dot"></i>3393 US Hwy 17-92 West <div className="footer-breakpoint"></div>Haines City, FL 33844</div>
			  <ul className="contact-info ">
				<li><i className="fas fa-envelope"></i> <a href="mailto:kpdlabs@kpdlabs.com">kpdlabs@kpdlabs.com</a><br/>
				</li>
				<li><i className="fas fa-phone"></i> <a href="tel:8634382102">863-438-2102</a><br/>
				</li>
			  </ul>
			  <ul className="social-icons justify-content-center">
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
  </div>
  
  {/* <!--Footer Bottom--> */}
  <div className="footer-bottom" style={{zIndex:1}}/>
	<div className="auto-container">
	  <div className="inner-container">
		<div className="copyright-text text-center">© {currentYear} KPD Labs Copyright All Rights Reserved <a href="index.html">kodesolution.com</a>
		<a href="#" className="footer-btn"></a>
	  </div>
	</div>
  </div>
</footer>
)};
