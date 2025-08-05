import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/portfolio.css";
import "../../styles/home.css";
import "../../styles/slick-theme.css"
import "../../styles/slick.css"
import "../../styles/style.css"

import Logo from "../../img/KPD-Transparent.png"
import { Login } from "../component/Login";
import Crowns from "../../img/pexels-cottonbro-studio-6502306.jpg"
import { Link, Navigate } from "react-router-dom";
import { Modal } from 'react-bootstrap';
import Bridge1 from "../../img/Bridge 1.jpg";
import Bridge2 from "../../img/Bridge 2.jpg";
import Crown1 from "../../img/Crown 1.jpg";
import Crown2 from "../../img/Crown 2.jpg";
import Denture1 from "../../img/Denture 1.jpg";
import Denture2 from "../../img/Denture 2.jpg";
import Denture3 from "../../img/Denture 3.jpg";
import Denture4 from "../../img/Denture 4.jpg";
import Denture5 from "../../img/Denture 5.jpg";
import Denture6 from "../../img/Denture 6.jpg";
import Denture7 from "../../img/Denture 7.jpg";
import Denture8 from "../../img/Denture 8.jpg";
import Denture9 from "../../img/Denture 9.jpg";
import Denture10 from "../../img/Denture 10.jpg";
import Denture11 from "../../img/Denture 11.jpg";
import Hybrid1 from "../../img/Hybrid 1.jpg";
import Hybrid2 from "../../img/Hybrid 2.jpg";
import Hybrid3 from "../../img/Hybrid 3.jpg";
import Hybrid4 from "../../img/Hybrid 4.jpg";
import Hybrid5 from "../../img/Hybrid 5.jpg";
import Hybrid6 from "../../img/Hybrid 6.jpg";
import Hybrid7 from "../../img/Hybrid 7.jpg";
import Hybrid8 from "../../img/Hybrid 8.jpg";


import PartialIndications from "../../img/PartialIndications.png"


import Intro from "../../img/footer-flip.jpg"
import AboutBKG from "../../img/testi-bg.jpg"

import { Slide, Fade } from "react-awesome-reveal";










export const Portfolio = props => {

    const [currentPage, setCurrentPage] = useState("crowns")

    




return(
<>
<div className="page-wrapper">


    <section className="banner-slide products-page" style={{backgroundImage: `url(${Intro})`, position: "relative", backgroundSize: "cover", backgroundRepeat: "no-repeat", marginTop: "125px", padding: "110px, 0, 110px", minHeight: "350px"}}>
        <div className="auto-container">
            <div className="title-outer text-center">
                <h1 className="title" style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>Portfolio</h1>
                <ul className="page-breadcrumb">
                    <li><a href="/">Home</a></li>
                    <li><i className="fa-solid fa-angle-right"></i></li>
                    <li>Portfolio</li>
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
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "crowns"  ? "active" : ""}`} onClick={()=>setCurrentPage("crowns")}>
                            <i className="fas fa-house fa-fw me-3"></i><span>Crowns and Bridges</span>
                        </a>
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "dentures"  ? "active" : ""}`} onClick={()=>setCurrentPage("dentures")}>
                            <i className="fas fa-house fa-fw me-3"></i><span>Dentures</span>
                        </a>
                        {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "contraindications" ? "active" : ""}`} onClick={()=>setCurrentPage("contraindications")}>
                            <i className="fas fa-plus fa-fw me-3"></i><span>Contraindications</span>
                        </a> */}
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "implants" ? "active" : ""}`} onClick={()=>{setCurrentPage("implants")}}>
                            <i className="fas fa-lock fa-fw me-3"></i><span>Implants</span></a>
                        {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "margins" ? "active" : ""}`} onClick={()=>setCurrentPage("margins")}><i
                            className="fas fa-pen-nib fa-fw me-3"></i><span>Margins</span></a> */}
                        {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "cementation" ? "active" : ""}`} onClick={()=>setCurrentPage("cementation")}>
                            <i className="fas fa-address-book fa-fw me-3"></i><span>Cementation</span>
                        </a>
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "technical" ? "active" : ""}`} onClick={()=>setCurrentPage("technical")}>
                            <i className="fas fa-address-book fa-fw me-3"></i><span>Technical Tip</span>
                        </a> */}
                        {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "ada" ? "active" : ""}`} onClick={()=>setCurrentPage("ada")}>
                            <i className="fas fa-address-book fa-fw me-3"></i><span>ADA Codes</span>
                        </a> */}
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
            {(currentPage === "crowns")?
            <Fade>
                <div className="gallery">
                    <div className="image-card"><img src={Crown1}></img></div>
                    <div className="image-card"><img src={Crown2}></img></div>
                    <div className="image-card"><img src={Bridge1}></img></div>
                    <div className="image-card"><img src={Bridge2}></img></div>
                </div>

            </Fade>:
            (currentPage === "indications")?
            <div>
                <h3>Unilateral (Nesbit) or Bilateral Removable Partial Dentures</h3>
                <img src={PartialIndications}></img>
                
            </div>:
            (currentPage === "contraindications")?
            <div>
                Contraindications
            </div>:
            (currentPage === "preparation")?
            <div>
                <div className="row">
                
                    <h3>Full Arch Intra-oral Scan or Physical Impressions</h3>
                    <h4>Dentition + 15mm of gingival tissue captured throughout the arch on both Buccal/Labial and Lingual/Palatal</h4>
                    
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
                        <ol><h4>Maxillary</h4>                   
                                <li>D5225 </li>
                        </ol>
                    </div>
                    <div className="col-6">
                        <ol><h4>Mandibular</h4> 
                            <li>D5526</li>
                        </ol>
                    </div>
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