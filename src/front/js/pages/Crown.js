
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

import CrownPrep1 from "../../img/CrownPrep1.jpg"
import CrownPrep2 from "../../img/CrownPrep2.jpg"
import CrownMargin1 from "../../img/CrownMargin1.png"
import CrownMargin2 from "../../img/CrownMargin2.png"

import Intro from "../../img/footer-flip.jpg"
import AboutBKG from "../../img/testi-bg.jpg"

import { Slide, Fade } from "react-awesome-reveal";










export const Crown = props => {

    const [currentPage, setCurrentPage] = useState("product")

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

	<section className="banner-slide products-page" style={{backgroundImage: `url(${Intro})`, position: "relative", backgroundRepeat: "no-repeat", marginTop: "125px", padding: "110px, 0, 110px", minHeight: "350px"}}>
		<div className="auto-container">
			<div className="title-outer text-center">
				<h1 className="title" style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>Crown and Bridge</h1>
				<ul className="page-breadcrumb">
					<li><a href="/">Home</a></li>
                    <li><i className="fa-solid fa-angle-right"></i></li>
					<li>Crown and Bridge</li>
				</ul>
			</div>
		</div>
	</section>

  <section className="" style={{minHeight:"350px", paddingTop: "50px", paddingBottom: "50px", backgroundImage: `url(${AboutBKG}`}}>
    <div className="ps-3">
      <div className="row "> 
      <div className="container pt-4 col-4 padding-container" style={{width: "20%", paddingRight: "20px"}}>
            <nav id="sidebarMenu" className="sidebar bg-white text-break text-nowrap overflow-hidden product-sidebar" >
                <div className="position-sticky">
                <div className="list-group list-group-flush ">
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "product"  ? "active" : ""}`} onClick={()=>setCurrentPage("product")}>
                            <i className="fas fa-house fa-fw me-3"></i><span>Product Information</span>
                        </a>
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "indications"  ? "active" : ""}`} onClick={()=>setCurrentPage("indications")}>
                            <i className="fas fa-house fa-fw me-3"></i><span>Indications</span>
                        </a>
                        {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "contraindications" ? "active" : ""}`} onClick={()=>setCurrentPage("contraindications")}>
                            <i className="fas fa-plus fa-fw me-3"></i><span>Contraindications</span>
                        </a> */}
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "preparation" ? "active" : ""}`} onClick={()=>{setCurrentPage("preparation")}}>
                            <i className="fas fa-lock fa-fw me-3"></i><span>Preparation Guidelines/Margins</span></a>
                        {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "margins" ? "active" : ""}`} onClick={()=>setCurrentPage("margins")}><i
                            className="fas fa-pen-nib fa-fw me-3"></i><span>Margins</span></a> */}
                        {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "cementation" ? "active" : ""}`} onClick={()=>setCurrentPage("cementation")}>
                            <i className="fas fa-address-book fa-fw me-3"></i><span>Cementation</span>
                        </a>
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "technical" ? "active" : ""}`} onClick={()=>setCurrentPage("technical")}>
                            <i className="fas fa-address-book fa-fw me-3"></i><span>Technical Tip</span>
                        </a> */}
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "ada" ? "active" : ""}`} onClick={()=>setCurrentPage("ada")}>
                            <i className="fas fa-address-book fa-fw me-3"></i><span>ADA Codes</span>
                        </a>
                        {/* <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-chart-bar fa-fw me-3"></i><span>Orders</span></a>
                        <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-globe fa-fw me-3"></i><span>International</span></a>
                        <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-building fa-fw me-3"></i><span>Partners</span></a>
                        <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-calendar fa-fw me-3"></i><span>Calendar</span></a>
                        <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-users fa-fw me-3"></i><span>Users</span></a>
                        <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-money-bill fa-fw me-3"></i><span>Sales</span></a> */}
                </div>
                </div>
            </nav>
        </div>
        {/* <div className="content-column col-lg-6 wow fadeInLeft" data-wow-delay="600ms">
          <div className="inner-column">
            <div className="sec-title"> <span className="sub-title">ABOUT KPD LABS  ::::::</span>
              <h2>We Bring Technical Engineering to Dental, Providing YOU with Precise Results</h2>
              <div className="text">Using our original design process and in house created software solutions, we vow to give you the best results in a timely manner.</div>
            </div>
            <div className="row"> 
          
              <div className="about-block col-sm-6">
                <div className="inner-box">
                  <div className="icon-box"> <i className="flaticon-support-2"></i>
                    <h4 className="title">Internal Networking</h4>
                  </div>
                  <div className="text">Lorem ipsum dolor sited amet consectetur notted </div>
                </div>
              </div>
          
              <div className="about-block col-sm-6">
                <div className="inner-box">
                  <div className="icon-box"> <i className="flaticon-typography"></i>
                    <h4 className="title">Manage IT Services</h4>
                  </div>
                  <div className="text">Lorem ipsum dolor sited amet consectetur notted </div>
                </div>
              </div>
            </div>
            <div className="btn-box"> <a href="" className="btn theme-btn" onClick={()=>sendEmail()}>Contact Us</a> <img src="" alt=""/> </div>
          </div>
        </div> */}

        <div className="col-8 text-center mt-3 me-4 product-display-info" >
            {(currentPage === "product")?
            <Fade>
                <h2>Zirconia Information</h2>
                <br></br>
                <div className="row">
                  <div className="col-4">
                    <h3>HT Polished Zirconia Crown</h3>
                    <h4>1400 Mpa | Translucent 35% </h4>
                    <br></br>
                    <div>High Strength High Translucent Polished Zirconia. Best for Posterior Crowns due to its High Strength and Polished. Surface Finish for Best in Class Hygiene</div>
                  </div>
                  <div className="col-4">
                    <h3>SHT Polished Zirconia Crown</h3>
                    <h4>1370 Mpa | Translucent 43% </h4>
                    <br></br>
                    <div>
                    Super High Translucent Polished Zirconia. Best for Pre-Molar and Molar Restorations combining High Polished Hygienic Surface Finish with Super High Translucent Aesthetics
                    </div>
                  </div>
                  <div className="col-4">
                    <h3>SHT Liquid Ceramics Zirconia Crown</h3>
                    <h4>1370 Mpa | Translucent 43% </h4>
                    <br></br>
                    <div>
                    Super High Translucent Zirconia For Anterior and Posterior Restorations Micro Layered with MiYO Liquid Ceramics for a Highly Aesthetic Surface Finish and Precision Shade Matching
                    </div>
                  </div>
                </div>
                <br></br>
                  <h3>More Zirconia Information</h3>
                  <div>Our white zirconia is crafted from biocompatible zirconium dioxide, tailored for applications in single unit crowns and bridges up to 14 units. The inclusion of yttrium oxide stabilizer fortifies the material, enhancing resistance against cracks while bolstering tensile and compressive strength. Furthermore, a meticulous grain size distribution within the material, coupled with the infusion of aluminum oxide, ensures heightened strength during milling and subsequent clinical application. These exceptional mechanical properties, alongside excellent chemical resilience and unparalleled biocompatibility, position our zirconia as the premier material choice for fixed dental restorations.</div>
                
            </Fade>:
            (currentPage === "indications")?
            <div>
                {/* <h3>Crowns: Anterior and Posterior | Bridges: Up to 14 units</h3>
                <h3>Inlays and Onlays</h3> */}
                <div className="row">
                  <div className="col-4">
                    <h3>HT Polished Zirconia Crown</h3>
                    <div>
                      Full contour first and second molar single unit crowns, copings, long span bridge substructure.
                    </div>
                  </div>
                  <div className="col-4">
                    <h3>SHT Polished Zirconia Crown</h3>
                    <div>
                      Full contour premolar and molar single unit crowns, copings, long span bridge substructure, posterior full contour bridges up to 4 units.
                    </div>
                  </div>
                  <div className="col-4">
                    <h3>SHT Liquid Ceramics Zirconia Crown</h3>
                    <div>
                      Full contour anterior and posterior single unit crowns, full contour bridges up to 14 units.
                    </div>
                  </div>

                </div>
            </div>:
            (currentPage === "contraindications")?
            <div>
                Contraindications
            </div>:
            (currentPage === "preparation")?
            <div>
                <div className="row">
                <div className="col-6">
                    <h3>Preparation</h3>
                    <img src={CrownPrep1}></img>
                    <img src={CrownPrep2}></img>
                </div>
                <div className="col-6">
                    <h3>Margin</h3>
                    <img src={CrownMargin1}></img>
                    <img src={CrownMargin2}></img>
                </div>
                </div>
            </div>:
            (currentPage === "margins")?
            <div>
                Margins
            </div>:
            (currentPage === "cementation")?
            <div>
                Cementation
            </div>:
            (currentPage === "technical")?
            <div>
                Technical
            </div>:
            (currentPage === "ada")?
            <div>
                <h2>ADA Codes</h2>
                <div className="row">
                    <div className="col-6">
                        <ol><h4>Single Unit</h4>                   
                                <li>D2740 Crown – porcelain/ceramic substrate</li>
                        </ol>
                    </div>
                    <div className="col-6">
                        <ol><h4>Bridgework</h4> 
                            <li>D6740 Crown – porcelain/ceramic</li>
                            <li>D6245 Pontic – porcelain/ceramic</li>
                        </ol>
                    </div>
                </div>
            </div>: ""
}
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

  </section>

  <section className="team-section">
    <div className="auto-container">
      <div className="sec-title text-center"> <span className="sub-title">::::::  Expert Team Members  ::::::</span>
        <h2>Meet our Professional <br/>Team Members</h2>
      </div>
      <div className="row"> 
  
        <div className="team-block col-lg-4 col-md-6 col-sm-12 wow fadeInUp">
          <div className="inner-box">
            <div className="image-box">
              <figure className="image"><a href=""><img src={Laurie} alt=""/></a></figure>
              <div className="social-links">
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-google"></i></a>
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
              </div>
              <span className="share-icon fa fa-share"></span>
            </div>
            <div className="info-box">
              <h4 className="name"><a href="">Laurie Troulis</a></h4>
              <span className="designation">Chief Financial Officer</span>
            </div>
          </div>
        </div>
     
        <div className="team-block col-lg-4 col-md-6 col-sm-12 wow fadeInUp" data-wow-delay="400ms">
          <div className="inner-box">
            <div className="image-box">
              <figure className="image"><a href=""><img src="" alt=""/></a></figure>
              <div className="social-links">
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-google"></i></a>
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
              </div>
              <span className="share-icon fa fa-share"></span>
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
              <div className="social-links">
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-google"></i></a>
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
              </div>
              <span className="share-icon fa fa-share"></span>
            </div>
            <div className="info-box">
              <h4 className="name"><a>Kyle Kronemeyer</a></h4>
              <span className="designation">Chief Technology Officer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section> */}

  

  


</div>




<div className="scroll-to-top scroll-to-target" data-target="html"><span className="fa fa-angle-up"></span></div>
</>

)}