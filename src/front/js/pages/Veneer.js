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

import VeneerPrep from "../../img/VeneerPrep.png"
import VeneerMargin from "../../img/VeneerMargin.png"

import Intro from "../../img/footer-flip.jpg"
import AboutBKG from "../../img/testi-bg.jpg"

import { Slide, Fade } from "react-awesome-reveal";










export const Veneer = props => {

    const [currentPage, setCurrentPage] = useState("product")

    function sendEmail() {
        var recipient = "kpdlabs@kpdlabs.com";
        var subject = "Feedback";
    
        window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
    }




return(
<>
<div className="page-wrapper">


	<section className="banner-slide products-page" style={{backgroundImage: `url(${Intro})`, position: "relative", backgroundRepeat: "no-repeat", backgroundSize: "cover", marginTop: "125px", padding: "110px, 0, 110px", minHeight: "350px"}}>
		<div className="auto-container">
			<div className="title-outer text-center">
				<h1 className="title" style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>Veneer</h1>
				<ul className="page-breadcrumb">
					<li><a href="/">Home</a></li>
                    <li><i className="fa-solid fa-angle-right"></i></li>
					<li>Veneer</li>
				</ul>
			</div>
		</div>
	</section>

  <section className="" style={{minHeight:"350px", paddingTop: "50px", paddingBottom: "50px", backgroundImage: `url(${AboutBKG}`}}>
    <div className="ps-3">
      <div className="row"> 
      <div className="container pt-4 col-4 padding-container" style={{width: "20%", paddingRight: "20px"}}>
            <nav id="sidebarMenu" className="d-lg-block sidebar bg-white text-break text-nowrap overflow-hidden product-sidebar">
                <div className="position-sticky">
                <div className="list-group list-group-flush ">
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "product"  ? "active" : ""}`} onClick={()=>setCurrentPage("product")}>
                            <i className="fas fa-house fa-fw me-3"></i><span>Product Information</span>
                        </a>
                        {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "indications"  ? "active" : ""}`} onClick={()=>setCurrentPage("indications")}>
                            <i className="fas fa-house fa-fw me-3"></i><span>Indications</span>
                        </a> */}
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
      

        <div className="col-8 text-center mt-3 me-4 product-display-info" >
            {(currentPage === "product")?
            <Fade>
                <h2>1050 MPA  47% Translucency</h2>
                <br></br>
                <div>Our Veneers are made from Super High Translucency Zirconium Dioxide, The inclusion of yttrium oxide stabilizer enhances the material's resistance against cracks, significantly increasing both tensile and compressive strength. A precise grain size distribution within the material, along with the addition of aluminum oxide, further contributes to exceptional strength during milling and subsequent clinical applications.The outstanding mechanical characteristics, excellent chemical durability, and unparalleled biocompatibility, coupled with its translucent color, make our zirconia the optimal choice for dental milling systems catering to veneers and restorative dentistry.</div>
            </Fade>:
            (currentPage === "indications")?
            <div>
                <h3>Crowns: Anterior and Posterior | Bridges: Up to 14 unites</h3>
                <div>Inlays and Onlays</div>
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
                    <img src={VeneerPrep}></img>
                    
                </div>
                <div className="col-6">
                    <h3>Margin</h3>
                    <img src={VeneerMargin}></img>
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
                    
                        <ol><h4>Single Unit</h4>                   
                                <li>D2962</li>
                        </ol>
                    
                
                </div>
            </div>: ""
}
        </div>
      </div>
    </div>
  </section>

</div>
</>

)}