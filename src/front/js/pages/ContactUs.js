import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import "../../styles/slick-theme.css"
import "../../styles/slick.css"
import "../../styles/style.css"

import Logo from "../../img/KPD-Transparent.png"
import { Login } from "../component/Login";
import Crowns from "../../img/pexels-cottonbro-studio-6502306.jpg"
import { Link, Navigate } from "react-router-dom";
import { Modal } from 'react-bootstrap';

import Intro from "../../img/footer-flip.jpg"





export const ContactUs = props => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [emailBody, setEmailBody] = useState("")
    const [phone, setPhone] = useState("")
    const [subject, setSubject] = useState("")


    function sendEmail() {
        var recipient = "kpdlabs@kpdlabs.com";
        var subjects = "Feedback";
    
        window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subjects);
    }

    function fullEmail() {
        let recipient = "kpdlabs@kpdlabs.com"
        window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(emailBody) + encodeURIComponent(phone)
    }


return(
<>
<div className="page-wrapper">

	
    
  
  <header className="main-header header-style-one">
    <div className="logo-box">
      <div className="logo"><a href="index.html"><img src="" alt=""/></a></div>
    </div>
    
    <div className="header-top">
      <div className="top-left">
        <ul>
          <li><a href="#"><i className="fa-solid fa-location-dot"></i>Beverley Road Brooklyn, USA</a></li>
          <li><a href="#"><i className="fa-solid fa-envelope"></i>example@company.com</a></li>
        </ul>
      </div>
      <div className="top-right">
        <ul className="login-btn">
          <li className="active"><a href="#"><i className="fa fa-user"></i>Login</a></li>
          <li><a href="#">Sign up</a></li>
        </ul>
        <ul className="social-icons">
          <li><a href="#"><i className="fa-brands fa-twitter"></i></a></li>
          <li><a href="#"><i className="fa-brands fa-google"></i></a></li>
          <li><a href="#"><i className="fa-brands fa-facebook-f"></i></a></li>
          <li><a href="#"><i className="fa-brands fa-youtube"></i></a></li>
        </ul>
      </div>
    </div>
    <div className="header-lower"> 
     
      <div className="main-box"> 
      
        <div className="nav-outer">
          <nav className="nav main-menu">
            <ul className="navigation">
              <li className="current dropdown"> <a href="index.html">Home</a>
                <ul>
                  <li><a href="index.html">Home page 01</a></li>
                  <li><a href="index-2.html">Home page 02</a></li>
                </ul>
              </li>
              <li className="dropdown"> <a href="#">Pages</a>
                <ul>
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
                </ul>
              </li>
              <li className="dropdown"> <a href="#">Services</a>
                <ul>
                  <li><a href="page-services.html">Services List</a></li>
                  <li><a href="page-service-details.html">Service Details</a></li>
                </ul>
              </li>
              <li className="dropdown"> <a href="#">Shop</a>
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
              </li>
              <li><a href="page-contact.html">Contact</a></li>
            </ul>
          </nav>
        
        </div>
        <div className="outer-box"> <a href="tel:123456789" className="content-btn"> <i className="fa-solid fa-phone"></i> <span>Call Anytime</span>
          <h6 className="title">+ 12 (3456) 7890</h6>
          </a>
          <div className="search-btn"> <a href="#" className="search"><i className="flaticon-search-3"></i></a> </div>
          <div className="btn"> <a href="page-contact.html" className="theme-btn">get solution</a> </div>
          <div className="mobile-nav-toggler"> <i className="fa fa-bars"></i> </div>
        </div>
      </div>
     
    </div>
    <div className="mobile-menu">
      <div className="menu-backdrop"></div>
      
      
      <nav className="menu-box">
        <div className="upper-box">
          <div className="nav-logo"><a href="index.html"><img src="" alt="" title=""/></a></div>
          <div className="close-btn"><i className="icon fa fa-times"></i></div>
        </div>
        <ul className="navigation clearfix">
          
        </ul>
        <ul className="contact-list-one">
          <li> 
            
            <div className="contact-info-box"> <i className="icon lnr-icon-phone-handset"></i> <span className="title">Call Now</span> <a href="tel:+92880098670">+92 (8800) - 98670</a> </div>
          </li>
          <li> 
       
            <div className="contact-info-box"> <span className="icon lnr-icon-envelope1"></span> <span className="title">Send Email</span> <a href="mailto:help@company.com">help@company.com</a> </div>
          </li>
          <li> 
           
            <div className="contact-info-box"> <span className="icon lnr-icon-clock"></span> <span className="title" onClick={()=>sendEmail()}>Send Email</span> Mon - Sat 8:00 - 6:30, Sunday - CLOSED </div>
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
    
    <div className="sticky-header">
      <div className="auto-container">
        <div className="inner-container"> 
       
          <div className="logo"> <a href="index.html" title=""><img src="" alt="" title=""/></a> </div>
          
          
          <div className="nav-outer"> 
          
            <nav className="main-menu">
              <div className="navbar-collapse show collapse clearfix">
                <ul className="navigation clearfix">
                 
                </ul>
              </div>
            </nav>
         
            <div className="mobile-nav-toggler"> <i className="fa fa-bars"></i> </div>
          </div>
        </div>
      </div>
    </div>
 
  </header>

  <section className="banner-slide" style={{backgroundImage: `url(${Intro})`, position: "relative", backgroundRepeat: "no-repeat", marginTop: "125px", padding: "110px, 0, 110px", minHeight: "350px"}}>
		<div className="auto-container">
			<div className="title-outer text-center">
				<h1 className="title"  style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>Contact Us</h1>
				<ul className="page-breadcrumb">
					<li><a href="/">Home</a></li>
                    <li><i className="fa-solid fa-angle-right"></i></li>
					<li>Contact</li>
				</ul>
			</div>
		</div>
	</section>

	<section className="contact-details">
		<div className="container pb-70">
			<div className="row">
				<div className="col-xl-7 col-lg-6">
					<div className="sec-title">
						<span className="sub-title">Send us email</span>
						<h2>Feel free to write</h2>
					</div>
				
					<form id="contact_form" name="contact_form" className=""  onSubmit={()=>fullEmail()}>
						<div className="row">
							<div className="col-sm-6">
								<div className="mb-3">
									<input name="form_name" className="form-control" type="text" placeholder="Enter Name" value={name} onChange={(e)=>setName(e.target.value)}/>
								</div>
							</div>
							<div className="col-sm-6">
								<div className="mb-3">
									<input name="form_email" className="form-control required email" type="email" placeholder="Enter Email" value={email} onChange={(e)=> setEmail(e.target.value)}/>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="col-sm-6">
								<div className="mb-3">
									<input name="form_subject" className="form-control required" type="text" placeholder="Enter Subject" value={subject} onChange={(e)=>setSubject(e.target.value)}/>
								</div>
							</div>
							<div className="col-sm-6">
								<div className="mb-3">
									<input name="form_phone" className="form-control" type="text" placeholder="Enter Phone" value={phone} onChange={(e)=> setPhone(e.target.value)} />
								</div>
							</div>
						</div>
						<div className="mb-3">
							<textarea name="form_message" className="form-control required" rows="7" placeholder="Enter Message" value={emailBody} onChange={(e)=>{setEmailBody(e.target.value)}} ></textarea>
						</div>
						<div className="mb-5">
							<input name="form_botcheck" className="form-control" type="hidden" value="" />
							<button type="submit" className="theme-btn btn-style-one" data-loading-text="Please wait..."><span className="btn-title">Send message</span></button>
							<button type="reset" className="theme-btn btn-style-one bg-theme-color5"><span className="btn-title">Reset</span></button>
						</div>
					</form>
					
				</div>
				<div className="col-xl-5 col-lg-6">
					<div className="contact-details__right">
						<div className="sec-title">
							<span className="sub-title">Need any help?</span>
							<h2>Get in touch</h2>
							<div className="text">We look forward to serving your dental needs!</div>
						</div>
						<ul className="list-unstyled contact-details__info">
							<li>
								<div className="icon">
                                <i className="fa-solid fa-phone" style={{fontSize: "30px"}}></i>
								</div>
								<div className="text">
									<h6>Have a question?</h6>
									<a href="tel:980089850"><span>Free</span> +92 (020)-9850</a>
								</div>
							</li>
							<li>
								<div className="icon">
                                <i className="fas fa-envelope" style={{fontSize: "30px"}} onClick={()=>sendEmail()}></i>
								</div>
								<div className="text">
									<h6>Write email</h6>
									<a href="mailto:kpdlabs@kpdlabs.com">kpdlabs@kpdlabs.com</a>
								</div>
							</li>
							<li>
								<div className="icon">
                                <i className="fas fa-location-dot" style={{fontSize: "30px"}}></i>
								</div>
								<div className="text">
									<h6>Visit anytime</h6>
									<span>3393 US Hwy 17-92 West Haines City, FL</span>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>


	
	<section className="map-section">
    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56299.88475939487!2d-81.65276555917411!3d28.123867342046044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88dd7150d3620fcd%3A0xa583ad760053fe35!2s3393%20U.S.%20Hwy%2017-92%20N%2C%20Florida!5e0!3m2!1sen!2sus!4v1713188069365!5m2!1sen!2sus" style={{width:"100%", height:"600px", border:0 , allowfullscreen:"", loading:"lazy", referrerpolicy: "no-referrer-when-downgrade"}}></iframe>
	</section>
	
  

 


</div>



<div className="scroll-to-top scroll-to-target" data-target="html"><span className="fa fa-angle-up"></span></div>

</>)}