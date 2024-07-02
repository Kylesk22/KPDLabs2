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
import Crown from "../../img/Crown.png"
import Denture from "../../img/Denture.jpg"


export const Blogs = props => {

    // function sendEmail() {
    //     var recipient = "kpdlabs@kpdlabs.com";
    //     var subject = "Feedback";
    
    //     window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
    // }




return(
<>
<div className="page-wrapper">



	<section className="banner-slide about-us-page" style={{backgroundImage: `url(${Intro})`, position: "relative", backgroundRepeat: "no-repeat", marginTop: "125px", padding: "110px, 0, 110px", minHeight: "350px"}}>
		<div className="auto-container">
			<div className="title-outer text-center">
				<h1 className="title" style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>Blogs</h1>
				<ul className="page-breadcrumb">
					<li><a href="/">Home</a></li>
                    <li><i className="fa-solid fa-angle-right"></i></li>
					<li>Blogs</li>
				</ul>
			</div>
		</div>
	</section>

  

 
 


  

  <section className="team-section" >
    <div className="auto-container">
      <div className="sec-title text-center"> <span className="sub-title">::::::  All Blogs  ::::::</span>
        <h2>Blogs</h2>
      </div>
      
      <div className="row" style={{paddingTop: "50px"}}> 
  
        <div className="blog-post col-lg-4 col-md-6 col-sm-12 " >
          <div className="">
            {/* <div className="image-box">
              <figure className="image"><a href=""><img src={Crown} alt=""/></a></figure>
              
            </div> */}
            <div className="">
              <h4 className="" style={{color: "black"}}><a href="">The Aesthetic and Functional Benefits of Super High Translucent Zirconia Finished with MiYO Liquid Ceramics for Anterior and Posterior Restorations
</a></h4>
              <span className="" style={{color: "black"}}>6/28/2024</span>
            </div>
          </div>
        </div>
     
        <div className="blog-post col-lg-4 col-md-6 col-sm-12" >
          <div className="">
            {/* <div className="image-box">
              <figure className="image"><a href=""><img src={Crown} alt=""/></a></figure>
              
            </div> */}
            <div className="">
              <h4 className=""><a href="" style={{color: "black"}}>The Clinical Hygiene Benefits of Highly Polished Zirconia Crowns for Posterior Restorations
</a></h4>
              <span className="" style={{color: "black"}}>6/20/2024</span>
            </div>
          </div>
        </div>
      
        <div className="blog-post col-lg-4 col-md-6 col-sm-12" >
          <div className="">
            {/* <div className="image-box">
              <figure className="image"><a href=""><img src={Denture} alt=""/></a></figure>
              
            </div> */}
            <div className="">
              <h4 className="" style={{color: "black"}}><a>The Increased Dimensional Accuracy of Milled PMMA Dentures Compared to Resin 3D Printed and Conventional Processed Acrylic Dentures
</a></h4>
              <span className="" style={{color: "black"}}>6/5/2024</span>
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