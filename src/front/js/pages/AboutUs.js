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
import Kyle from "../../img/Kyle.png"
import Laurie from "../../img/Laurie.jpg"
import Casey from "../../img/casey2.jpg"

import Intro from "../../img/footer-flip.jpg"

import AboutBKG from "../../img/testi-bg.jpg"
import CustomVideoPlayer from "../component/CustomVideoPlayer"
import MillingClip from "../../img/MillingClip1080p.mp4"
import Lines from "../../img/lines.jpg"


export const AboutUs = props => {

    function sendEmail() {
        var recipient = "kpdlabs@kpdlabs.com";
        var subject = "Feedback";
    
        window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
    }




return(
<>
<div className="page-wrapper">


	{/* <div className="preloader"></div> */}
    

  {/* <header className="main-header header-style-one">
    <div className="logo-box">
      <div className="logo"><a href="/"><img src={Logo} alt=""/></a></div>
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
              <li className="current dropdown"> <a href="/">Home</a>
                
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
          <div className="nav-logo"><a href="index.html"><img src={Logo} alt="" title=""/></a></div>
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
      
            <div className="contact-info-box"> <span className="icon lnr-icon-clock"></span> <span className="title">Send Email</span> Mon - Sat 8:00 - 6:30, Sunday - CLOSED </div>
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

  </header> */}

	<section className="banner-slide about-us-page" style={{backgroundImage: `url(${Intro})`, position: "relative", backgroundRepeat: "no-repeat", marginTop: "125px", padding: "110px, 0, 110px", minHeight: "350px"}}>
		<div className="auto-container">
			<div className="title-outer text-center">
				<h1 className="title" style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>About Us</h1>
				<ul className="page-breadcrumb">
					<li><a href="/">Home</a></li>
                    <li><i className="fa-solid fa-angle-right"></i></li>
					<li>About Us</li>
				</ul>
			</div>
		</div>
	</section>

  <section className="about-section " 
  style={{backgroundImage: `url(${AboutBKG})`}}
  // style={{backgroundImage: `url(${Lines})`}}
  >
    
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
		  {/* <div className="btn-box"> <a href="/aboutus" className="btn theme-btn">Discover More</a> 
	
		  </div> */}
		</div>
	  </div>
	  {/* <!-- image-column --> */}
	  <div className="image-column col-lg-6 wow fadeInRight millvideo" data-wow-delay="600ms" >
		<div className="inner-column">
		  <div className="image-box">
			
				{/* <img src={Mill} alt=""/> */}
				{/* <i className="icon fas fa-play">
				<video id="myVideo" width="320" height="240" controls muted className="play-now" data-fancybox="gallery" data-caption=""><source src={MillingClip} type="video/mp4"/></video>
				</i> */}

			{/* <div className="video-container">
			<video id="myVideo" width="320" height="240" controls muted className="play-now" data-fancybox="gallery" data-caption="">
				<source src={MillingClip} type="video/mp4"/>
			</video>
			
			</div> */}
			<CustomVideoPlayer videoSrc={MillingClip}/>


		  </div>
		</div>
	  </div>
	</div>
	
  </div>
</section>

 
 


  {/* <section className="main-section"> 

    <div className="process-section pb-0">
      <div className="auto-container">
        <div className="sec-title text-center"> <span className="sub-title">::::::  What We’re Offering  ::::::</span>
          <h2>Services Built Specifically <br/>for your Business</h2>
        </div>
        <div className="row"> 
         
          <div className="process-block current col-lg-3 col-md-6 col-sm-12 wow fadeInLeft" data-wow-delay="400ms" data-tab="tab-1">
            <div className="inner-box">
              <div className="icon-box"> <i className="flaticon-web-programming"></i> </div>
              <div className="content-box">
                <h6 className="title"><a href="page-about.html">Project Reporting</a></h6>
              </div>
            </div>
          </div>
        
          <div className="process-block col-lg-3 col-md-6 col-sm-12 wow fadeInLeft" data-wow-delay="600ms" data-tab="tab-2">
            <div className="inner-box">
              <div className="icon-box"> <i className="flaticon-headhunting"></i> </div>
              <div className="content-box">
                <h6 className="title"><a href="page-about.html">SEO Optimized Expert</a></h6>
              </div>
            </div>
          </div>
        
          <div className="process-block col-lg-3 col-md-6 col-sm-12 wow fadeInLeft" data-wow-delay="800ms" data-tab="tab-3">
            <div className="inner-box">
              <div className="icon-box"> <i className="flaticon-shield"></i> </div>
              <div className="content-box">
                <h6 className="title"><a href="page-about.html">Database Security</a></h6>
              </div>
            </div>
          </div>
        
          <div className="process-block col-lg-3 col-md-6 col-sm-12 wow fadeInLeft" data-wow-delay="1000ms" data-tab="tab-4">
            <div className="inner-box">
              <div className="icon-box"> <i className="flaticon-cog"></i> </div>
              <div className="content-box">
                <h6 className="title"><a href="page-about.html">Analytic Solutions</a></h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  
    <div className="what-we-do-section">
      <div className="auto-container">
        <div className="custom-tab-content">
          <div className="custom-tab-slide current" id="tab-1">
            <div className="row"> 
           
              <div className="image-column col-lg-6">
                <div className="inner-column">
                  <div className="image-box">
                    <figure className="image"><img src="" alt=""/></figure>
                  </div>
                </div>
              </div>
       
              <div className="content-column col-lg-6">
                <div className="inner-column">
                  <h3 className="title">SEO Optimized Expert</h3>
                  <div className="text">We is the partner of choice for many of the world’s leading enterprises, SMEs and technology challengers. We help businesses elevate their value through custom software development, product design, QA and consultancy services. </div>
                  <ul className="list">
                    <li><i className="fa-solid fa-circle-check"></i>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                    <li><i className="fa-solid fa-circle-check"></i>Donec lobortis id diam facilisis, vitae pellentesque convallis.</li>
                    <li><i className="fa-solid fa-circle-check"></i>Vivamus volutpat dui nec mauris ultrices lacinia.</li>
                  </ul>
                  <a href="page-about.html" className="ser-btn theme-btn btn-style-one">discover more</a>
                </div>
              </div>
            </div>
          </div>
          <div className="custom-tab-slide" id="tab-2">
            <div className="row"> 
      
              <div className="image-column col-lg-6">
                <div className="inner-column">
                  <div className="image-box">
                    <figure className="image"><img src="" alt=""/></figure>
                  </div>
                </div>
              </div>
       
              <div className="content-column col-lg-6">
                <div className="inner-column">
                  <h3 className="title">SEO Optimized Expert</h3>
                  <div className="text">We is the partner of choice for many of the world’s leading enterprises, SMEs and technology challengers. We help businesses elevate their value through custom software development, product design, QA and consultancy services. </div>
                  <ul className="list">
                    <li><i className="fa-solid fa-circle-check"></i>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                    <li><i className="fa-solid fa-circle-check"></i>Donec lobortis id diam facilisis, vitae pellentesque convallis.</li>
                    <li><i className="fa-solid fa-circle-check"></i>Vivamus volutpat dui nec mauris ultrices lacinia.</li>
                  </ul>
                  <a href="page-about.html" className="ser-btn theme-btn btn-style-one">discover more</a>
                </div>
              </div>
            </div>
          </div>
          <div className="custom-tab-slide" id="tab-3">
            <div className="row"> 
    
              <div className="image-column col-lg-6">
                <div className="inner-column">
                  <div className="image-box">
                    <figure className="image"><img src="" alt=""/></figure>
                  </div>
                </div>
              </div>
        
              <div className="content-column col-lg-6">
                <div className="inner-column">
                  <h3 className="title">SEO Optimized Expert</h3>
                  <div className="text">We is the partner of choice for many of the world’s leading enterprises, SMEs and technology challengers. We help businesses elevate their value through custom software development, product design, QA and consultancy services. </div>
                  <ul className="list">
                    <li><i className="fa-solid fa-circle-check"></i>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                    <li><i className="fa-solid fa-circle-check"></i>Donec lobortis id diam facilisis, vitae pellentesque convallis.</li>
                    <li><i className="fa-solid fa-circle-check"></i>Vivamus volutpat dui nec mauris ultrices lacinia.</li>
                  </ul>
                  <a href="page-about.html" className="ser-btn theme-btn btn-style-one">discover more</a>
                </div>
              </div>
            </div>
          </div>
          <div className="custom-tab-slide" id="tab-4">
            <div className="row"> 
        
              <div className="image-column col-lg-6">
                <div className="inner-column">
                  <div className="image-box">
                    <figure className="image"><img src="" alt=""/></figure>
                  </div>
                </div>
              </div>
          
              <div className="content-column col-lg-6">
                <div className="inner-column">
                  <h3 className="title">SEO Optimized Expert</h3>
                  <div className="text">We is the partner of choice for many of the world’s leading enterprises, SMEs and technology challengers. We help businesses elevate their value through custom software development, product design, QA and consultancy services. </div>
                  <ul className="list">
                    <li><i className="fa-solid fa-circle-check"></i>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                    <li><i className="fa-solid fa-circle-check"></i>Donec lobortis id diam facilisis, vitae pellentesque convallis.</li>
                    <li><i className="fa-solid fa-circle-check"></i>Vivamus volutpat dui nec mauris ultrices lacinia.</li>
                  </ul>
                  <a href="page-about.html" className="ser-btn theme-btn btn-style-one">discover more</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section> */}

  <section className="team-section" >
    <div className="auto-container">
      <div className="sec-title text-center"> <span className="sub-title">::::::  Expert Team Members  ::::::</span>
        <h2>Meet our Professional <br/>Team Members</h2>
      </div>
      <div className="row"> 
  
        <div className="team-block col-lg-4 col-md-6 col-sm-12 wow fadeInUp">
          <div className="inner-box">
            <div className="image-box">
              <figure className="image"><a href=""><img src={Laurie} alt=""/></a></figure>
              {/* <div className="social-links">
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-google"></i></a>
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
              </div> */}
              {/* <span className="share-icon fa fa-share"></span> */}
            </div>
            <div className="info-box">
              <h4 className="name"><a href="">Laurie Troulis</a></h4>
              <span className="designation">Chief Executive Officer</span>
            </div>
          </div>
        </div>
     
        <div className="team-block col-lg-4 col-md-6 col-sm-12 wow fadeInUp" data-wow-delay="400ms">
          <div className="inner-box">
            <div className="image-box">
              <figure className="image"><a href=""><img src={Casey} alt=""/></a></figure>
              {/* <div className="social-links">
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-google"></i></a>
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
              </div> */}
              {/* <span className="share-icon fa fa-share"></span> */}
            </div>
            <div className="info-box">
              <h4 className="name"><a href="">Casey Kronemeyer</a></h4>
              <span className="designation">Chief Operating Officer</span>
            </div>
          </div>
        </div>
      
        <div className="team-block col-lg-4 col-md-6 col-sm-12 wow fadeInUp" data-wow-delay="600ms">
          <div className="inner-box">
            <div className="image-box">
              <figure className="image"><a href=""><img src={Kyle} alt=""/></a></figure>
              {/* <div className="social-links">
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-google"></i></a>
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
              </div> */}
              {/* <span className="share-icon fa fa-share"></span> */}
            </div>
            <div className="info-box">
              <h4 className="name"><a>Kyle Kronemeyer</a></h4>
              <span className="designation">Chief Technology Officer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  

  


</div>




<div className="scroll-to-top scroll-to-target" data-target="html"><span className="fa fa-angle-up"></span></div>
</>

)}