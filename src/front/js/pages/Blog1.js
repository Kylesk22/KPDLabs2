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


export const Blog1 = props => {

    // function sendEmail() {
    //     var recipient = "kpdlabs@kpdlabs.com";
    //     var subject = "Feedback";
    
    //     window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
    // }

    const url = process.env.BACKEND_URL


      useEffect(()=>{
        
        const options = {
            method:"GET"

        }
        fetch(`${url}/blogs`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{
                    console.log(data)
                })}
            
            })
       
        .catch((err)=> {
            console.log(err);
            alert("Error displaying blogs")
    })
  }, [])

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
      <div className="sec-title text-center"> <a href = "/blogs"><span className="sub-title">::::::  All Blogs  ::::::</span></a>
        <h2>The Aesthetic and Functional Benefits of Super High Translucent Zirconia Finished with MiYO Liquid Ceramics for Anterior and Posterior Restorations</h2>
      </div>
      
        <div className="row" style={{paddingTop: "50px"}}> 
        At KPD Labs, we are committed to advancing dental restoration technology with materials that excel in both aesthetics and functionality. Our Super High Translucent Zirconia finished with MiYO Liquid Ceramics offers unparalleled benefits for anterior and posterior restorations, setting a new standard in dental care.
        <br></br>
        <br></br>
<h4>Enhanced Aesthetics</h4>
        <br></br>
Super High Translucent Zirconia from KPD Labs mimics the natural translucency of teeth, providing a lifelike appearance that is essential for anterior restorations. When finished with MiYO Liquid Ceramics, these crowns achieve an even higher level of aesthetic appeal. MiYO Liquid Ceramics enhance the color depth and surface texture, resulting in restorations that blend seamlessly with natural dentition.
        <br></br>
        <br></br>
<h4>Superior Strength and Durability</h4>
<br></br>
While aesthetics are crucial, strength cannot be compromised, especially for posterior restorations. Our zirconia crowns are engineered to withstand the forces of chewing, ensuring long-lasting durability. This makes them ideal for both anterior and posterior applications, providing a robust solution without sacrificing appearance.
<br></br>
<br></br>
<h4>Optimal Functionality</h4>
<br></br>
The combination of Super High Translucent Zirconia and MiYO Liquid Ceramics at KPD Labs ensures that our restorations are not only beautiful but also functional. The smooth surface finish reduces plaque buildup, promoting better oral hygiene and reducing the risk of periodontal issues.
<br></br>
<br></br>
<h4>Biocompatibility and Patient Comfort</h4>
<br></br>
Biocompatibility is a key consideration in dental restorations. Our zirconia crowns are designed to be gentle on the surrounding tissues, reducing the risk of irritation or allergic reactions. This enhances patient comfort and contributes to overall oral health.
<br></br>
<br></br>
<h4>Versatility in Application</h4>
<br></br>
The versatility of Super High Translucent Zirconia finished with MiYO Liquid Ceramics makes it suitable for a wide range of applications. Whether for anterior or posterior restorations, these crowns provide consistent results that meet both aesthetic and functional demands.
<br></br>
<br></br>
<h4>Conclusion</h4>
<br></br>
KPD Labs is proud to offer Super High Translucent Zirconia finished with MiYO Liquid Ceramics, a solution that combines stunning aesthetics with exceptional functionality. Ideal for both anterior and posterior restorations, these crowns support a natural appearance while ensuring durability and patient comfort. Trust KPD Labs for advanced dental solutions that prioritize excellence in every aspect.

        </div>
    </div>
  </section>

  

  


</div>




<div className="scroll-to-top scroll-to-target" data-target="html"><span className="fa fa-angle-up"></span></div>
</>

)}