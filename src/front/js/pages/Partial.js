// import React, { useContext, useState, useEffect } from "react";
// import { Context } from "../store/appContext";
// import "../../styles/home.css";
// import "../../styles/slick-theme.css"
// import "../../styles/slick.css"
// import "../../styles/style.css"

// import Logo from "../../img/KPD-Transparent.png"
// import { Login } from "../component/Login";
// import Crowns from "../../img/pexels-cottonbro-studio-6502306.jpg"
// import { Link, Navigate } from "react-router-dom";
// import { Modal } from 'react-bootstrap';

// import PartialIndications from "../../img/PartialIndications.png"


// import Intro from "../../img/footer-flip.jpg"
// import AboutBKG from "../../img/testi-bg.jpg"

// import { Slide, Fade } from "react-awesome-reveal";










// export const Partial = props => {

//     const [currentPage, setCurrentPage] = useState("product")

//     function sendEmail() {
//         var recipient = "kpdlabs@kpdlabs.com";
//         var subject = "Feedback";
    
//         window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
//     }




// return(
// <>
// <div className="page-wrapper">


// 	<section className="banner-slide products-page" style={{backgroundImage: `url(${Intro})`, position: "relative", backgroundRepeat: "no-repeat", backgroundSize: "cover", marginTop: "125px", padding: "110px, 0, 110px", minHeight: "350px"}}>
// 		<div className="auto-container">
// 			<div className="title-outer text-center">
// 				<h1 className="title" style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>Partial</h1>
// 				<ul className="page-breadcrumb">
// 					<li><a href="/">Home</a></li>
//                     <li><i className="fa-solid fa-angle-right"></i></li>
// 					<li>Partial</li>
// 				</ul>
// 			</div>
// 		</div>
// 	</section>

//   <section className="" style={{minHeight:"350px", paddingTop: "50px", paddingBottom: "50px", backgroundImage: `url(${AboutBKG}`}}>
//     <div className="ps-3">
//       <div className="row"> 
//       <div className="container pt-4 col-4 padding-container" style={{width: "20%", paddingRight: "20px"}}>
//             <nav id="sidebarMenu" className="d-lg-block sidebar bg-white text-break text-nowrap overflow-hidden product-sidebar">
//                 <div className="position-sticky">
//                 <div className="list-group list-group-flush ">
//                         <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "product"  ? "active" : ""}`} onClick={()=>setCurrentPage("product")}>
//                             <i className="fas fa-house fa-fw me-3"></i><span>Product Information</span>
//                         </a>
//                         <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "indications"  ? "active" : ""}`} onClick={()=>setCurrentPage("indications")}>
//                             <i className="fas fa-house fa-fw me-3"></i><span>Indications</span>
//                         </a>
//                         {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "contraindications" ? "active" : ""}`} onClick={()=>setCurrentPage("contraindications")}>
//                             <i className="fas fa-plus fa-fw me-3"></i><span>Contraindications</span>
//                         </a> */}
//                         <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "preparation" ? "active" : ""}`} onClick={()=>{setCurrentPage("preparation")}}>
//                             <i className="fas fa-lock fa-fw me-3"></i><span>Impression Guidelines</span></a>
//                         {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "margins" ? "active" : ""}`} onClick={()=>setCurrentPage("margins")}><i
//                             className="fas fa-pen-nib fa-fw me-3"></i><span>Margins</span></a> */}
//                         {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "cementation" ? "active" : ""}`} onClick={()=>setCurrentPage("cementation")}>
//                             <i className="fas fa-address-book fa-fw me-3"></i><span>Cementation</span>
//                         </a>
//                         <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "technical" ? "active" : ""}`} onClick={()=>setCurrentPage("technical")}>
//                             <i className="fas fa-address-book fa-fw me-3"></i><span>Technical Tip</span>
//                         </a> */}
//                         <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "ada" ? "active" : ""}`} onClick={()=>setCurrentPage("ada")}>
//                             <i className="fas fa-address-book fa-fw me-3"></i><span>ADA Codes</span>
//                         </a>
//                         {/* <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
//                             className="fas fa-chart-bar fa-fw me-3"></i><span>Orders</span></a>
//                         <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
//                             className="fas fa-globe fa-fw me-3"></i><span>International</span></a>
//                         <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
//                             className="fas fa-building fa-fw me-3"></i><span>Partners</span></a>
//                         <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
//                             className="fas fa-calendar fa-fw me-3"></i><span>Calendar</span></a>
//                         <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
//                             className="fas fa-users fa-fw me-3"></i><span>Users</span></a>
//                         <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
//                             className="fas fa-money-bill fa-fw me-3"></i><span>Sales</span></a> */}
//                 </div>
//                 </div>
//             </nav>
//         </div>
      

//         <div className="col-8 text-center mt-3 me-4 product-display-info" >
//             {(currentPage === "product")?
//             <Fade>
//                 <h2>Acetal</h2>
//                 <br></br>
//                 <div>Acetal is an extremely resilient, high performance thermoplastic resin, popular for its superior aesthetics, strength and retentive resiliency. Providing comfort, flexibility, strength and aesthetics.</div>
//             </Fade>:
//             (currentPage === "indications")?
//             <div>
//                 <h3>Unilateral (Nesbit) or Bilateral Removable Partial Dentures</h3>
//                 <img src={PartialIndications}></img>
                
//             </div>:
//             (currentPage === "contraindications")?
//             <div>
//                 Contraindications
//             </div>:
//             (currentPage === "preparation")?
//             <div>
//                 <div className="row">
                
//                     <h3>Full Arch Intra-oral Scan or Physical Impressions</h3>
//                     <h4>Dentition + 15mm of gingival tissue captured throughout the arch on both Buccal/Labial and Lingual/Palatal</h4>
                    
//                 </div>
                
                
//             </div>:
//             (currentPage === "margins")?
//             <div>
//                 Margins
//             </div>:
//             (currentPage === "cementation")?
//             <div>
//                 Cementation
//             </div>:
//             (currentPage === "technical")?
//             <div>
//                 Technical
//             </div>:
//             (currentPage === "ada")?
//             <div>
//                 <h2>ADA Codes</h2>
//                 <div className="row">
//                     <div className="col-6">
//                         <ol><h4>Maxillary</h4>                   
//                                 <li>D5225 </li>
//                         </ol>
//                     </div>
//                     <div className="col-6">
//                         <ol><h4>Mandibular</h4> 
//                             <li>D5526</li>
//                         </ol>
//                     </div>
//                 </div>
//             </div>: ""
// }
//         </div>
//       </div>
//     </div>
//   </section>

// </div>
// </>

// )}

import React, { useState } from "react";
import { Helmet } from "react-helmet";
import Intro from "../../img/footer-flip.jpg";
import { Fade } from "react-awesome-reveal";

const shades = [
    { name: "Opaque Pink", desc: "The most lifelike option for patients with naturally pink, opaque gingiva. Seamlessly blends with tissue for a natural emergence profile.", swatch: "#e8a0a8" },
    { name: "Translucent Pink", desc: "A translucent pink tone that captures the subtle depth of natural gingiva — ideal for lighter tissue types and high-smile-line cases.", swatch: "#f0bec4" },
    { name: "Translucent Meharry", desc: "Developed to harmonize with deeper, richer gingival tones. The go-to choice for patients with naturally darker tissue pigmentation.", swatch: "#c47a7a" },
    { name: "100% Clear", desc: "Fully transparent base for cases where maximum discretion is required. Adapts to the patient's own tissue color underneath.", swatch: "#e8e0d8" },
];

export const Partial = props => {
    const [activeShade, setActiveShade] = useState(0);

    return (
        <div style={styles.page}>
            <Helmet>
                <title>KPD Premier Partial | KPD Labs Dental Laboratory Florida</title>
                <meta name="description" content="The KPD Premier Partial — more precise and stable than nylon, more comfortable than metal. Available in 4 gingival shades. Serving Florida dentists with fast turnaround." />
                <link rel="canonical" href="https://kpdlabs.com/partial" />
            </Helmet>
            {/* Hero */}
            <div style={{
                ...styles.hero,
                backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.85) 100%), url(${Intro})`
            }}>
                <div style={styles.heroInner}>
                    <p style={styles.heroEyebrow}>KPD Dental Laboratory</p>
                    <h1 style={styles.heroTitle}>KPD Premier Partial</h1>
                    <div style={styles.heroRule}/>
                    <p style={styles.heroBreadcrumb}><a href="/" style={styles.breadcrumbLink}>Home</a> <span style={styles.breadcrumbSep}>›</span> Products <span style={styles.breadcrumbSep}>›</span> Partial</p>
                </div>
            </div>

            {/* Product Overview */}
            <div style={styles.overviewSection}>
                <Fade triggerOnce>
                <div style={styles.overviewInner}>
                    <div style={styles.overviewLeft}>
                        <div style={styles.overviewAccent}/>
                        <p style={styles.eyebrow}>The KPD Premier Partial</p>
                        <h2 style={styles.overviewTitle}>The Best of Both Worlds</h2>
                        <p style={styles.overviewDesc}>
                            The KPD Premier Partial occupies a clinical space that no other partial denture material can claim. More precise, stable, and rigid than nylon-based partials — delivering superior retention and fit through accurate adaptation to undercuts. Yet flexible enough that patients never experience the discomfort associated with a traditional metal framework.
                        </p>
                        <p style={styles.overviewDesc}>
                            The result is a partial that holds better, fits better, and feels better. Patients notice the difference from day one.
                        </p>
                        <div style={styles.compareRow}>
                            <div style={styles.compareCard}>
                                <span style={styles.compareLabel}>vs. Nylon</span>
                                <span style={styles.compareText}>More precise, stable, and rigid. Superior undercut retention and long-term fit accuracy.</span>
                            </div>
                            <div style={styles.compareCard}>
                                <span style={styles.compareLabel}>vs. Metal</span>
                                <span style={styles.compareText}>Flexible enough for patient comfort. No metal clasps. Invisible in the smile.</span>
                            </div>
                        </div>
                        <a href="/signup" style={styles.ctaBtn}>Send Us a Case →</a>
                    </div>
                    <div style={styles.overviewRight}>
                        <div style={styles.specsStack}>
                            {[
                                { label: "Indications", value: "Unilateral & Bilateral Removable Partials" },
                                { label: "ADA Maxillary", value: "D5225" },
                                { label: "ADA Mandibular", value: "D5226" },
                                { label: "Available Shades", value: "4 Options" },
                                { label: "Scan Requirement", value: "Full Arch + 15mm Gingiva" },
                            ].map((spec, i) => (
                                <div key={i} style={styles.specRow}>
                                    <span style={styles.specLabel}>{spec.label}</span>
                                    <span style={styles.specValue}>{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </Fade>
            </div>

            {/* Shade Selector */}
            <div style={styles.shadeSection}>
                <div style={styles.shadeInner}>
                    <p style={styles.eyebrowLight}>Gingival Shades</p>
                    <h2 style={styles.shadeSectionTitle}>Four Shades. Every Patient.</h2>
                    <p style={styles.shadeSectionSub}>Each shade is selected to blend naturally with the patient's existing tissue tone, ensuring the partial remains virtually invisible in the smile.</p>
                    <div style={styles.shadeGrid}>
                        {shades.map((spec, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveShade(i)}
                                style={{
                                    ...styles.shadeCard,
                                    ...(activeShade === i ? styles.shadeCardActive : {})
                                }}
                            >
                                <div style={{ ...styles.shadeSwatch, backgroundColor: spec.swatch }}/>
                                <span style={styles.shadeName}>{spec.name}</span>
                            </button>
                        ))}
                    </div>
                    <Fade key={activeShade} triggerOnce={false}>
                    <div style={styles.shadeDetail}>
                        <div style={{ ...styles.shadeDetailSwatch, backgroundColor: shades[activeShade].swatch }}/>
                        <div>
                            <h4 style={styles.shadeDetailName}>{shades[activeShade].name}</h4>
                            <p style={styles.shadeDetailDesc}>{shades[activeShade].desc}</p>
                        </div>
                    </div>
                    </Fade>
                </div>
            </div>

            {/* CTA Banner */}
            <div style={styles.ctaBanner}>
                <h2 style={styles.ctaBannerTitle}>Ready to Send a Partial Case?</h2>
                <p style={styles.ctaBannerSub}>Full arch intraoral scan or physical impressions. Dentition + 15mm of gingival tissue captured throughout the arch on both buccal and lingual aspects.</p>
                <a href="/signup" style={styles.ctaBannerBtn}>Get Started →</a>
            </div>
        </div>
    );
};

const gold = "#ffaa17";
const dark = "#222429";
const light = "#f8f6f1";
const white = "#ffffff";
const muted = "#6b7280";
const border = "#e5e0d8";

const styles = {
    page: { fontFamily: "'Georgia', serif", backgroundColor: light, color: dark, overflowX: "hidden" },
    hero: { minHeight: "60vh", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "180px 40px 80px" },
    heroInner: { maxWidth: "700px" },
    heroEyebrow: { fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "600", marginBottom: "20px" },
    heroTitle: { fontSize: "clamp(40px, 6vw, 80px)", fontWeight: "400", color: white, lineHeight: "1.05", marginBottom: "24px", letterSpacing: "-1px" },
    heroRule: { width: "60px", height: "2px", backgroundColor: gold, margin: "0 auto 24px" },
    heroBreadcrumb: { fontSize: "13px", color: "rgba(255,255,255,0.55)", fontFamily: "'Arial', sans-serif" },
    breadcrumbLink: { color: "rgba(255,255,255,0.55)", textDecoration: "none" },
    breadcrumbSep: { margin: "0 8px", color: gold },
    eyebrow: { fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "600", marginBottom: "12px" },
    eyebrowLight: { fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "600", marginBottom: "12px" },

    overviewSection: { padding: "100px 60px", maxWidth: "1200px", margin: "0 auto" },
    overviewInner: { display: "flex", gap: "80px", alignItems: "flex-start", flexWrap: "wrap" },
    overviewLeft: { flex: "1.3", minWidth: "300px", position: "relative", paddingLeft: "24px" },
    overviewAccent: { position: "absolute", left: "0", top: "0", width: "3px", height: "100%", backgroundColor: gold },
    overviewTitle: { fontSize: "clamp(30px, 4vw, 46px)", fontWeight: "400", color: dark, marginBottom: "24px", letterSpacing: "-0.5px" },
    overviewDesc: { fontSize: "15px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.8", marginBottom: "20px" },
    compareRow: { display: "flex", gap: "2px", backgroundColor: border, marginBottom: "36px", marginTop: "8px" },
    compareCard: { flex: "1", backgroundColor: white, padding: "20px 24px", display: "flex", flexDirection: "column", gap: "8px" },
    compareLabel: { fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "700" },
    compareText: { fontSize: "13px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.7" },
    ctaBtn: { display: "inline-block", padding: "14px 36px", backgroundColor: dark, color: white, textDecoration: "none", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700" },
    overviewRight: { flex: "1", minWidth: "280px" },
    specsStack: { display: "flex", flexDirection: "column", gap: "2px", backgroundColor: border },
    specRow: { backgroundColor: white, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" },
    specLabel: { fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: muted, fontFamily: "'Arial', sans-serif", fontWeight: "700" },
    specValue: { fontSize: "14px", color: dark, fontFamily: "'Georgia', serif", textAlign: "right" },

    shadeSection: { backgroundColor: dark, padding: "100px 60px", borderTop: `3px solid ${gold}` },
    shadeInner: { maxWidth: "1200px", margin: "0 auto" },
    shadeSectionTitle: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", color: white, marginBottom: "16px", letterSpacing: "-0.5px" },
    shadeSectionSub: { fontSize: "14px", color: "rgba(255,255,255,0.5)", fontFamily: "'Arial', sans-serif", lineHeight: "1.8", marginBottom: "48px", maxWidth: "560px" },
    shadeGrid: { display: "flex", gap: "2px", flexWrap: "wrap", marginBottom: "40px" },
    shadeCard: { flex: "1", minWidth: "140px", padding: "24px 20px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", transition: "all 0.2s ease" },
    shadeCardActive: { backgroundColor: "rgba(255,170,23,0.1)", borderColor: gold },
    shadeSwatch: { width: "48px", height: "48px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)" },
    shadeName: { fontSize: "12px", color: white, fontFamily: "'Arial', sans-serif", textAlign: "center", letterSpacing: "0.5px" },
    shadeDetail: { display: "flex", alignItems: "center", gap: "28px", padding: "32px", backgroundColor: "rgba(255,255,255,0.05)", borderLeft: `3px solid ${gold}` },
    shadeDetailSwatch: { width: "64px", height: "64px", borderRadius: "50%", flexShrink: "0", border: "2px solid rgba(255,255,255,0.2)" },
    shadeDetailName: { fontSize: "20px", color: white, fontWeight: "400", marginBottom: "8px" },
    shadeDetailDesc: { fontSize: "14px", color: "rgba(255,255,255,0.55)", fontFamily: "'Arial', sans-serif", lineHeight: "1.7", margin: "0" },

    ctaBanner: { backgroundColor: dark, borderTop: `3px solid ${gold}`, padding: "80px 60px", textAlign: "center" },
    ctaBannerTitle: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", color: white, marginBottom: "16px", letterSpacing: "-0.5px" },
    ctaBannerSub: { fontSize: "14px", color: "rgba(255,255,255,0.55)", fontFamily: "'Arial', sans-serif", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px", lineHeight: "1.8" },
    ctaBannerBtn: { display: "inline-block", padding: "16px 48px", backgroundColor: gold, color: dark, textDecoration: "none", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700" },
};