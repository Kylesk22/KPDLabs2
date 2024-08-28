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


export const Resources = props => {

    // function sendEmail() {
    //     var recipient = "kpdlabs@kpdlabs.com";
    //     var subject = "Feedback";
    
    //     window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
    // }

    const url = process.env.BACKEND_URL


//       useEffect(()=>{
        
//         const options = {
//             method:"GET"

//         }
//         fetch(`${url}/blogs`, options)
//         .then((res)=> {
//             if (res.ok) {
//                 return res.json()
//                 .then((data)=>{
//                     console.log(data)
//                 })}
            
//             })
       
//         .catch((err)=> {
//             console.log(err);
//             alert("Error displaying blogs")
//     })
//   }, [])

return(
<>
<div className="page-wrapper">



	<section className="banner-slide about-us-page" style={{backgroundImage: `url(${Intro})`, position: "relative", backgroundRepeat: "no-repeat", marginTop: "125px", padding: "110px, 0, 110px", minHeight: "350px"}}>
		<div className="auto-container">
			<div className="title-outer text-center">
				<h1 className="title" style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>Resources</h1>
				<ul className="page-breadcrumb">
					<li><a href="/">Home</a></li>
                    <li><i className="fa-solid fa-angle-right"></i></li>
					<li>Resources</li>
				</ul>
			</div>
		</div>
	</section>

  

 
 


  

  <section className="team-section" >
    <div className="auto-container">
      <div className="sec-title text-center"> <span className="sub-title">::::::  Resources  ::::::</span>
        {/* <h2>Blogs</h2> */}
      </div>
      
      <div className="row" style={{paddingTop: "50px"}}> 
  
        <div style={{border: "4px solid #ffaa17", marginRight: "2px"}} className="col-6 text-center">
            <a href="https://pubmed.ncbi.nlm.nih.gov/23328193/" target="_blank">
                <h3>The Difference Between Polished and Glazed Crowns and the Benefits of Polishing</h3>
                
                <h4>The wear of polished and glazed zirconia against enamel - PubMed</h4>
            </a>
                        
        </div>
        <div style={{border: "4px solid #ffaa17", marginLeft: "2px"}} className="col-6 text-center">
             <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9807933/" target="_blank">
                <h3>Natural teeth wear opposite to glazed and polished ceramic crowns: A systematic review</h3>
                
                <h4>The wear of polished and glazed zirconia against enamel - PubMed</h4>
            </a>

        </div>
      </div>
    </div>
  </section>

  

  


</div>




<div className="scroll-to-top scroll-to-target" data-target="html"><span className="fa fa-angle-up"></span></div>
</>

)}