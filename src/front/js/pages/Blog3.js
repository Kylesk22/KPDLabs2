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


export const Blog3 = props => {

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
        <h2>The Increased Dimensional Accuracy of Milled PMMA Dentures Compared to Resin 3D Printed and Conventional Processed Acrylic Dentures
        </h2>
      </div>
      
        <div className="row" style={{paddingTop: "50px"}}> 
        In the evolving field of dental prosthetics, the precision and fit of dentures play a critical role in patient comfort and functionality. At KPD Labs, we focus on innovations that enhance the quality of dental care, and our milled PMMA dentures exemplify this commitment. Here, we explore how milled PMMA dentures surpass resin 3D printed and conventional processed acrylic dentures in terms of dimensional accuracy.
        <br></br>
        <br></br>
<h4>Precision in Manufacturing
</h4>
        <br></br>
        Milled PMMA (Polymethyl Methacrylate) dentures are produced using advanced CAD/CAM technology, ensuring unparalleled precision. This method involves digitally designing the dentures and milling them from high-quality PMMA blocks. The result is a consistently accurate fit, reducing the need for adjustments and ensuring better retention and stability.
        <br></br>
        <br></br>
<h4>Superior Fit and Comfort
</h4>
<br></br>
Dimensional accuracy directly impacts the fit of dentures. Milled PMMA dentures from KPD Labs offer a snug fit that conforms closely to the patient's oral anatomy. This precision enhances comfort and reduces pressure points, making the dentures more pleasant to wear for extended periods.
<br></br>
<br></br>
<h4>Comparison with Resin 3D Printed Dentures
</h4>
<br></br>
While resin 3D printed dentures offer customization and ease of production, they often lack the same level of precision found in milled PMMA dentures. Layering during the printing process can lead to slight variations in dimensions, which may affect the overall fit and stability of the dentures.
<br></br>
<br></br>
<h4>Advantages Over Conventional Acrylic Dentures
</h4>
<br></br>
Conventional processed acrylic dentures are made using manual techniques that can introduce variability and imperfections. Milled PMMA dentures eliminate these inconsistencies, providing a uniform product with better dimensional accuracy. This leads to fewer post-delivery adjustments and a more predictable outcome.
<br></br>
<br></br>
<h4>Durability and Aesthetics
</h4>
<br></br>
In addition to their superior accuracy, milled PMMA dentures offer excellent durability and aesthetics. The material is resistant to wear and staining, maintaining its appearance and function over time. This makes them an attractive option for patients seeking long-lasting and visually appealing solutions.
<br></br>
<br></br>
<h4>Conclusion</h4>
<br></br>
At KPD Labs, we believe that the precision of milled PMMA dentures significantly enhances the patient experience. With improved dimensional accuracy over resin 3D printed and conventional acrylic dentures, our solutions offer a perfect blend of comfort, durability, and aesthetics. Trust KPD Labs to provide cutting-edge dental solutions that prioritize both form and function.

        </div>
    </div>
  </section>

  

  


</div>




<div className="scroll-to-top scroll-to-target" data-target="html"><span className="fa fa-angle-up"></span></div>
</>

)}