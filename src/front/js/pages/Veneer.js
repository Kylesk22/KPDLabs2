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

// import VeneerPrep from "../../img/VeneerPrep.png"
// import VeneerMargin from "../../img/VeneerMargin.png"

// import Intro from "../../img/footer-flip.jpg"
// import AboutBKG from "../../img/testi-bg.jpg"

// import { Slide, Fade } from "react-awesome-reveal";










// export const Veneer = props => {

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
// 				<h1 className="title" style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>Veneer</h1>
// 				<ul className="page-breadcrumb">
// 					<li><a href="/">Home</a></li>
//                     <li><i className="fa-solid fa-angle-right"></i></li>
// 					<li>Veneer</li>
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
//                         {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "indications"  ? "active" : ""}`} onClick={()=>setCurrentPage("indications")}>
//                             <i className="fas fa-house fa-fw me-3"></i><span>Indications</span>
//                         </a> */}
//                         {/* <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "contraindications" ? "active" : ""}`} onClick={()=>setCurrentPage("contraindications")}>
//                             <i className="fas fa-plus fa-fw me-3"></i><span>Contraindications</span>
//                         </a> */}
//                         <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "preparation" ? "active" : ""}`} onClick={()=>{setCurrentPage("preparation")}}>
//                             <i className="fas fa-lock fa-fw me-3"></i><span>Preparation Guidelines/Margins</span></a>
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
//                 <h2>1050 MPA  47% Translucency</h2>
//                 <br></br>
//                 <div>Our Veneers are made from Super High Translucency Zirconium Dioxide, The inclusion of yttrium oxide stabilizer enhances the material's resistance against cracks, significantly increasing both tensile and compressive strength. A precise grain size distribution within the material, along with the addition of aluminum oxide, further contributes to exceptional strength during milling and subsequent clinical applications.The outstanding mechanical characteristics, excellent chemical durability, and unparalleled biocompatibility, coupled with its translucent color, make our zirconia the optimal choice for dental milling systems catering to veneers and restorative dentistry.</div>
//             </Fade>:
//             (currentPage === "indications")?
//             <div>
//                 <h3>Crowns: Anterior and Posterior | Bridges: Up to 14 unites</h3>
//                 <div>Inlays and Onlays</div>
//             </div>:
//             (currentPage === "contraindications")?
//             <div>
//                 Contraindications
//             </div>:
//             (currentPage === "preparation")?
//             <div>
//                 <div className="row">
//                 <div className="col-6">
//                     <h3>Preparation</h3>
//                     <img src={VeneerPrep}></img>
                    
//                 </div>
//                 <div className="col-6">
//                     <h3>Margin</h3>
//                     <img src={VeneerMargin}></img>
//                 </div>
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
                    
//                         <ol><h4>Single Unit</h4>                   
//                                 <li>D2962</li>
//                         </ol>
                    
                
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


import React from "react";
import Intro from "../../img/footer-flip.jpg";
import { Fade } from "react-awesome-reveal";
 
export const Veneer = props => {
    return (
        <div style={styles.page}>
            {/* Hero */}
            <div style={{
                ...styles.hero,
                backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.85) 100%), url(${Intro})`
            }}>
                <div style={styles.heroInner}>
                    <p style={styles.heroEyebrow}>KPD Dental Laboratory</p>
                    <h1 style={styles.heroTitle}>Veneers</h1>
                    <div style={styles.heroRule}/>
                    <p style={styles.heroBreadcrumb}><a href="/" style={styles.breadcrumbLink}>Home</a> <span style={styles.breadcrumbSep}>›</span> Products <span style={styles.breadcrumbSep}>›</span> Veneer</p>
                </div>
            </div>
 
            {/* Product Feature */}
            <div style={styles.featureSection}>
                <Fade triggerOnce>
                <div style={styles.featureInner}>
                    <div style={styles.featureLeft}>
                        <div style={styles.featureAccent}/>
                        <p style={styles.eyebrow}>Our Offering</p>
                        <h2 style={styles.featureTitle}>Microlayered PFZ</h2>
                        <p style={styles.featureSubtitle}>Structure / Stain & Glaze</p>
                        <p style={styles.featureDesc}>
                            Our veneer offering is built on Super High Translucency Zirconia, micro-layered with MiYO Liquid Ceramics for a surface finish that captures the depth, light transmission, and natural character of enamel. Every veneer leaves our lab with structure layering followed by precision stain and glaze — delivering shade accuracy and surface texture that photographs, and more importantly, reads as completely natural in person.
                        </p>
                        <p style={styles.featureDesc}>
                            The zirconia substrate provides exceptional resistance to fracture, while the porcelain surface layering gives clinicians and patients the aesthetic outcome they expect from a premium veneer case.
                        </p>
                        <a href="/signup" style={styles.ctaBtn}>Send Us a Case →</a>
                    </div>
                    <div style={styles.featureRight}>
                        <div style={styles.specsStack}>
                            {[
                                { label: "Substrate", value: "Super High Translucency Zirconia" },
                                { label: "Translucency", value: "43%" },
                                { label: "Finish", value: "Structure / Stain & Glaze" },
                                { label: "Surface Treatment", value: "MiYO Liquid Ceramics" },
                                { label: "Indications", value: "Anterior Veneers" },
                                { label: "ADA Code", value: "D2962" },
                            ].map((s, i) => (
                                <div key={i} style={styles.specRow}>
                                    <span style={styles.specLabel}>{s.label}</span>
                                    <span style={styles.specValue}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </Fade>
            </div>
 
            {/* What Sets Us Apart */}
            <div style={styles.apartSection}>
                <div style={styles.apartInner}>
                    <p style={styles.eyebrowLight}>The KPD Difference</p>
                    <h2 style={styles.apartTitle}>Aesthetic Outcomes That Speak for Themselves</h2>
                    <div style={styles.apartGrid}>
                        {[
                            { icon: "◈", title: "Precision Shade Matching", body: "MiYO Liquid Ceramics allows our technicians to characterize each veneer individually, matching even complex polychromatic shades with accuracy." },
                            { icon: "✦", title: "Natural Light Transmission", body: "47% translucency at the incisal edge gives KPD veneers the lifelike depth that distinguishes them from monolithic restorations." },
                            { icon: "◉", title: "Minimally Invasive Compatible", body: "Designed to work with conservative prep designs, our veneers support minimally invasive treatment planning without sacrificing aesthetics." },
                        ].map((a, i) => (
                            <div key={i} style={styles.apartCard}>
                                <span style={styles.apartIcon}>{a.icon}</span>
                                <h4 style={styles.apartCardTitle}>{a.title}</h4>
                                <p style={styles.apartCardBody}>{a.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
 
            {/* Preparation Note */}
            <div style={styles.prepSection}>
                <div style={styles.prepInner}>
                    <div style={styles.prepLeft}>
                        <p style={styles.eyebrow}>Preparation Guidelines</p>
                        <h3 style={styles.prepTitle}>Setting Your Case Up for Success</h3>
                    </div>
                    <div style={styles.prepRight}>
                        <p style={styles.prepText}>For optimal results, intraoral scans are preferred. Ensure full dentition capture with at least 15mm of gingival tissue on both buccal and lingual aspects. Include bite registration and opposing arch. Shade selection with custom stump shade photos are appreciated for complex cases.</p>
                        <p style={styles.prepText}>Questions about your specific case? Our team is available to consult before you submit.</p>
                    </div>
                </div>
            </div>
 
            {/* CTA Banner */}
            <div style={styles.ctaBanner}>
                <h2 style={styles.ctaBannerTitle}>Ready to Elevate Your Veneer Cases?</h2>
                <p style={styles.ctaBannerSub}>Send us your next case and experience the KPD difference firsthand.</p>
                <a href="/signup" style={styles.ctaBannerBtn}>Send Us a Case →</a>
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
    heroTitle: { fontSize: "clamp(52px, 7vw, 88px)", fontWeight: "400", color: white, lineHeight: "1.05", marginBottom: "24px", letterSpacing: "-1px" },
    heroRule: { width: "60px", height: "2px", backgroundColor: gold, margin: "0 auto 24px" },
    heroBreadcrumb: { fontSize: "13px", color: "rgba(255,255,255,0.55)", fontFamily: "'Arial', sans-serif" },
    breadcrumbLink: { color: "rgba(255,255,255,0.55)", textDecoration: "none" },
    breadcrumbSep: { margin: "0 8px", color: gold },
    eyebrow: { fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "600", marginBottom: "12px" },
    eyebrowLight: { fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "600", marginBottom: "12px" },
 
    featureSection: { padding: "100px 60px", maxWidth: "1200px", margin: "0 auto" },
    featureInner: { display: "flex", gap: "80px", alignItems: "flex-start", flexWrap: "wrap" },
    featureLeft: { flex: "1.2", minWidth: "300px", position: "relative", paddingLeft: "24px" },
    featureAccent: { position: "absolute", left: "0", top: "0", width: "3px", height: "100%", backgroundColor: gold },
    featureTitle: { fontSize: "clamp(32px, 4vw, 50px)", fontWeight: "400", color: dark, marginBottom: "8px", letterSpacing: "-0.5px" },
    featureSubtitle: { fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "700", marginBottom: "28px" },
    featureDesc: { fontSize: "15px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.8", marginBottom: "20px" },
    ctaBtn: { display: "inline-block", padding: "14px 36px", backgroundColor: dark, color: white, textDecoration: "none", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700", marginTop: "16px" },
    featureRight: { flex: "1", minWidth: "280px" },
    specsStack: { display: "flex", flexDirection: "column", gap: "2px", backgroundColor: border },
    specRow: { backgroundColor: white, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" },
    specLabel: { fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: muted, fontFamily: "'Arial', sans-serif", fontWeight: "700" },
    specValue: { fontSize: "14px", color: dark, fontFamily: "'Georgia', serif", textAlign: "right" },
 
    apartSection: { backgroundColor: dark, padding: "100px 60px", borderTop: `3px solid ${gold}` },
    apartInner: { maxWidth: "1200px", margin: "0 auto" },
    apartTitle: { fontSize: "clamp(26px, 3vw, 40px)", fontWeight: "400", color: white, marginBottom: "60px", letterSpacing: "-0.5px", maxWidth: "600px" },
    apartGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2px", backgroundColor: "rgba(255,170,23,0.15)" },
    apartCard: { backgroundColor: dark, padding: "44px 36px" },
    apartIcon: { fontSize: "24px", color: gold, display: "block", marginBottom: "20px" },
    apartCardTitle: { fontSize: "18px", color: white, fontWeight: "400", marginBottom: "12px" },
    apartCardBody: { fontSize: "13px", color: "rgba(255,255,255,0.5)", fontFamily: "'Arial', sans-serif", lineHeight: "1.8", margin: "0" },
 
    prepSection: { padding: "80px 60px", maxWidth: "1200px", margin: "0 auto" },
    prepInner: { display: "flex", gap: "80px", flexWrap: "wrap", borderTop: `1px solid ${border}`, paddingTop: "60px" },
    prepLeft: { flex: "1", minWidth: "240px" },
    prepTitle: { fontSize: "clamp(22px, 3vw, 32px)", fontWeight: "400", color: dark, letterSpacing: "-0.3px" },
    prepRight: { flex: "2", minWidth: "300px" },
    prepText: { fontSize: "14px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.9", marginBottom: "16px" },
 
    ctaBanner: { backgroundColor: dark, borderTop: `3px solid ${gold}`, padding: "80px 60px", textAlign: "center" },
    ctaBannerTitle: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", color: white, marginBottom: "16px", letterSpacing: "-0.5px" },
    ctaBannerSub: { fontSize: "15px", color: "rgba(255,255,255,0.55)", fontFamily: "'Arial', sans-serif", marginBottom: "40px", maxWidth: "500px", margin: "0 auto 40px" },
    ctaBannerBtn: { display: "inline-block", padding: "16px 48px", backgroundColor: gold, color: dark, textDecoration: "none", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700" },
};