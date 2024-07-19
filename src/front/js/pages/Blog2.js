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


export const Blog2 = props => {

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
        <h2>The Clinical Hygiene Benefits of Highly Polished Zirconia Crowns for Posterior Restorations
        </h2>
      </div>
      
        <div className="row" style={{paddingTop: "50px"}}> 
        In the world of dental restorations, choosing the right material is crucial for both aesthetics and functionality. At KPD Labs, we understand the importance of not only providing durable solutions but also ensuring optimal oral hygiene. Highly polished zirconia crowns have emerged as a top choice for posterior restorations, offering significant benefits that extend beyond their strength and appearance.
        <br></br>
        <br></br>
<h4>Superior Smoothness
</h4>
        <br></br>
        One of the primary advantages of highly polished zirconia crowns from KPD Labs is their superior smoothness. This polished surface minimizes plaque accumulation, making it easier for patients to maintain their oral hygiene. Unlike other materials, zirconia’s polished finish resists plaque formation, reducing the risk of periodontal disease and caries.
        <br></br>
        <br></br>
<h4>Biocompatibility
</h4>
<br></br>
Zirconia is well-known for its biocompatibility, which means it is less likely to cause allergic reactions or inflammation in the surrounding gum tissue. At KPD Labs, we ensure our zirconia crowns are crafted with precision, promoting a healthier oral environment and enhancing patient comfort.
<br></br>
<br></br>
<h4>Strength and Longevity
</h4>
<br></br>
The durability of zirconia crowns makes them ideal for posterior restorations, where the forces of chewing are greatest. At KPD Labs, our highly polished zirconia crowns not only withstand these forces but also maintain their smooth surface over time. This durability ensures that the crowns do not become rough or abrasive, which can contribute to plaque buildup and compromise oral hygiene.
<br></br>
<br></br>
<h4>Aesthetic Benefits
</h4>
<br></br>
While functionality and hygiene are paramount, aesthetics also play a critical role. The natural translucency and color-matching capabilities of zirconia crowns make them an excellent choice for patients concerned about the appearance of their dental restorations. At KPD Labs, we prioritize both the visual appeal and the health benefits of our products.
<br></br>
<br></br>
<h4>Conclusion</h4>
<br></br>
Choosing the right material for posterior restorations is vital for long-term oral health. Highly polished zirconia crowns from KPD Labs offer a winning combination of durability, aesthetics, and hygiene benefits. By reducing plaque accumulation and being gentle on the gums, our zirconia crowns support better oral health outcomes for patients. Trust KPD Labs for superior dental solutions that prioritize both form and function.

        </div>
    </div>
  </section>

  

  


</div>




<div className="scroll-to-top scroll-to-target" data-target="html"><span className="fa fa-angle-up"></span></div>
</>

)}