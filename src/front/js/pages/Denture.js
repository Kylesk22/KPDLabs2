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










// export const Denture = props => {

//     const [currentPage, setCurrentPage] = useState("product")

//     function sendEmail() {
//         var recipient = "kpdlabs@kpdlabs.com";
//         var subject = "Feedback";
    
//         window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
//     }




// return(
// <>
// <div className="page-wrapper">


// 	<section className="banner-slide products-page" style={{backgroundImage: `url(${Intro})`, position: "relative", backgroundSize: "cover", backgroundRepeat: "no-repeat", marginTop: "125px", padding: "110px, 0, 110px", minHeight: "350px"}}>
// 		<div className="auto-container">
// 			<div className="title-outer text-center">
// 				<h1 className="title" style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>Denture</h1>
// 				<ul className="page-breadcrumb">
// 					<li><a href="/">Home</a></li>
//                     <li><i className="fa-solid fa-angle-right"></i></li>
// 					<li>Denture</li>
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
//                 <h2>Removable Full Denture</h2>
//                 <br></br>
//                 <div>Introducing our precision-engineered Removable Full Denture, meticulously crafted to deliver exceptional durability, lifelike aesthetics, and precise accuracy for a comfortable fit and natural appearance.
// This full denture is CNC machined from the most fracture-resistant pink PMMA base material, ensuring longevity and resilience in daily wear. The combination of this robust base with highly esthetic multi-layer PMMA denture teeth results in a stunningly lifelike smile that matches the unique contours and shades of natural teeth.
// Each component of our Removable Full Denture is designed to harmonize durability with aesthetics, providing patients with a strong and reliable dental solution that enhances both function and appearance. Experience the confidence of a beautifully crafted denture that looks, feels, and functions like natural teeth.</div>
//             </Fade>:
//             (currentPage === "indications")?
//             <div>
//                 <h3>Maxillary and Mandibular Full Dentures</h3>
                
                
//             </div>:
//             (currentPage === "contraindications")?
//             <div>
//                 Contraindications
//             </div>:
//             (currentPage === "preparation")?
//             <div>
//                 <div className="row">
                
//                     <h3>Full Arch Physical Impressions</h3>
//                     <h4>Recommended - Custom Tray Impressions</h4>
                    
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
//                                 <li>D5110 </li>
//                         </ol>
//                     </div>
//                     <div className="col-6">
//                         <ol><h4>Mandibular</h4> 
//                             <li>D5120</li>
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

import React from "react";
import Intro from "../../img/footer-flip.jpg";
import { Fade } from "react-awesome-reveal";

export const Denture = props => {
    return (
        <div style={styles.page}>
            {/* Hero */}
            <div style={{
                ...styles.hero,
                backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.85) 100%), url(${Intro})`
            }}>
                <div style={styles.heroInner}>
                    <p style={styles.heroEyebrow}>KPD Dental Laboratory</p>
                    <h1 style={styles.heroTitle}>KPD Premier Denture</h1>
                    <div style={styles.heroRule}/>
                    <p style={styles.heroBreadcrumb}><a href="/" style={styles.breadcrumbLink}>Home</a> <span style={styles.breadcrumbSep}>›</span> Products <span style={styles.breadcrumbSep}>›</span> Denture</p>
                </div>
            </div>

            {/* Product Overview */}
            <div style={styles.overviewSection}>
                <Fade triggerOnce>
                <div style={styles.overviewInner}>
                    <div style={styles.overviewLeft}>
                        <div style={styles.overviewAccent}/>
                        <p style={styles.eyebrow}>The KPD Premier Denture</p>
                        <h2 style={styles.overviewTitle}>Crafted to Look<br/>as Natural as it Feels</h2>
                        <p style={styles.overviewDesc}>
                            Every KPD Premier Denture begins with a CNC-milled fracture-resistant pink PMMA base — engineered for the durability and precision that milling provides over conventional processing. The result is a base that fits accurately, resists fracture, and maintains its dimensional stability long after delivery.
                        </p>
                        <p style={styles.overviewDesc}>
                            The teeth are multi-layer PMMA, selected and set to match the patient's natural dentition in form and shade. But what truly distinguishes a KPD Premier Denture is the final step: our technicians hand-characterize the gingival tissue using Vita Akzent, adding the subtle natural variations in color and translucency that make tissue look alive rather than artificial.
                        </p>
                        <p style={styles.overviewDesc}>
                            It's the difference between a denture and a restoration.
                        </p>
                        <a href="/signup" style={styles.ctaBtn}>Send Us a Case →</a>
                    </div>
                    <div style={styles.overviewRight}>
                        <div style={styles.specsStack}>
                            {[
                                { label: "Base Material", value: "Fracture-Resistant Pink PMMA" },
                                { label: "Fabrication", value: "CNC Milled" },
                                { label: "Teeth", value: "Multi-Layer PMMA" },
                                { label: "Gingival Finish", value: "Hand-Characterized with Vita Akzent" },
                                { label: "ADA Maxillary", value: "D5110" },
                                { label: "ADA Mandibular", value: "D5120" },
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

            {/* Vita Akzent Feature */}
            <div style={styles.vitaSection}>
                <div style={styles.vitaInner}>
                    <div style={styles.vitaLeft}>
                        <p style={styles.eyebrowLight}>What Sets Us Apart</p>
                        <h2 style={styles.vitaTitle}>The Art of Hand Characterization</h2>
                        <p style={styles.vitaDesc}>
                            Most denture labs stop at milling. We don't. Every KPD Premier Denture gingiva is individually characterized by our technicians using Vita Akzent stains — adding the subtle pinks, reds, and translucencies that appear in natural gingival tissue.
                        </p>
                        <p style={styles.vitaDesc}>
                            The stippling. The vascular detail. The variation from papilla to margin. These aren't cosmetic extras — they're what makes a patient feel confident enough to smile without thinking about it.
                        </p>
                    </div>
                    <div style={styles.vitaRight}>
                        {[
                            { num: "01", title: "CNC Milled Base", body: "Precision milling ensures accurate fit and long-term dimensional stability that conventional processing cannot match." },
                            { num: "02", title: "Multi-Layer PMMA Teeth", body: "Lifelike incisal translucency and natural shade gradients that photograph beautifully and look natural in person." },
                            { num: "03", title: "Vita Akzent Characterization", body: "Hand-applied gingival characterization creates the natural color variation and depth that distinguishes our work." },
                        ].map((f, i) => (
                            <div key={i} style={styles.featureRow}>
                                <span style={styles.featureNum}>{f.num}</span>
                                <div>
                                    <h4 style={styles.featureTitle}>{f.title}</h4>
                                    <p style={styles.featureBody}>{f.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Impression Guidelines */}
            <div style={styles.prepSection}>
                <div style={styles.prepInner}>
                    <div style={styles.prepLeft}>
                        <p style={styles.eyebrow}>Submission Guidelines</p>
                        <h3 style={styles.prepTitle}>Setting the Case Up for Success</h3>
                    </div>
                    <div style={styles.prepRight}>
                        <p style={styles.prepText}>Full arch physical impressions are required for denture cases. Custom tray impressions are strongly recommended for optimal border seal and tissue detail capture. Please include bite registration, existing denture (if duplicate or reline), and shade selection with any notes on tooth mold preference.</p>
                        <p style={styles.prepText}>Our team is happy to consult on complex cases before you submit — including immediate dentures, duplicate dentures, and implant-supported overdentures.</p>
                    </div>
                </div>
            </div>

            {/* CTA Banner */}
            <div style={styles.ctaBanner}>
                <h2 style={styles.ctaBannerTitle}>Ready to Send a Denture Case?</h2>
                <p style={styles.ctaBannerSub}>Our team crafts every KPD Premier Denture with the same care and attention we'd want for our own patients.</p>
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
    overviewTitle: { fontSize: "clamp(30px, 4vw, 46px)", fontWeight: "400", color: dark, marginBottom: "24px", letterSpacing: "-0.5px", lineHeight: "1.15" },
    overviewDesc: { fontSize: "15px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.8", marginBottom: "20px" },
    ctaBtn: { display: "inline-block", padding: "14px 36px", backgroundColor: dark, color: white, textDecoration: "none", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700", marginTop: "16px" },
    overviewRight: { flex: "1", minWidth: "280px" },
    specsStack: { display: "flex", flexDirection: "column", gap: "2px", backgroundColor: border },
    specRow: { backgroundColor: white, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" },
    specLabel: { fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: muted, fontFamily: "'Arial', sans-serif", fontWeight: "700" },
    specValue: { fontSize: "14px", color: dark, fontFamily: "'Georgia', serif", textAlign: "right" },

    vitaSection: { backgroundColor: dark, padding: "100px 60px", borderTop: `3px solid ${gold}` },
    vitaInner: { maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "80px", flexWrap: "wrap" },
    vitaLeft: { flex: "1", minWidth: "280px" },
    vitaTitle: { fontSize: "clamp(26px, 3vw, 40px)", fontWeight: "400", color: white, marginBottom: "24px", letterSpacing: "-0.5px", lineHeight: "1.15" },
    vitaDesc: { fontSize: "14px", color: "rgba(255,255,255,0.55)", fontFamily: "'Arial', sans-serif", lineHeight: "1.9", marginBottom: "20px" },
    vitaRight: { flex: "1.2", minWidth: "280px", display: "flex", flexDirection: "column", gap: "2px", backgroundColor: "rgba(255,170,23,0.1)" },
    featureRow: { display: "flex", gap: "24px", padding: "32px 28px", backgroundColor: dark, alignItems: "flex-start" },
    featureNum: { fontSize: "28px", color: "rgba(255,170,23,0.25)", fontWeight: "400", minWidth: "40px", lineHeight: "1" },
    featureTitle: { fontSize: "16px", color: white, fontWeight: "400", marginBottom: "8px" },
    featureBody: { fontSize: "13px", color: "rgba(255,255,255,0.5)", fontFamily: "'Arial', sans-serif", lineHeight: "1.7", margin: "0" },

    prepSection: { padding: "80px 60px", maxWidth: "1200px", margin: "0 auto" },
    prepInner: { display: "flex", gap: "80px", flexWrap: "wrap", borderTop: `1px solid ${border}`, paddingTop: "60px" },
    prepLeft: { flex: "1", minWidth: "240px" },
    prepTitle: { fontSize: "clamp(22px, 3vw, 32px)", fontWeight: "400", color: dark, letterSpacing: "-0.3px" },
    prepRight: { flex: "2", minWidth: "300px" },
    prepText: { fontSize: "14px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.9", marginBottom: "16px" },

    ctaBanner: { backgroundColor: dark, borderTop: `3px solid ${gold}`, padding: "80px 60px", textAlign: "center" },
    ctaBannerTitle: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", color: white, marginBottom: "16px", letterSpacing: "-0.5px" },
    ctaBannerSub: { fontSize: "15px", color: "rgba(255,255,255,0.55)", fontFamily: "'Arial', sans-serif", marginBottom: "40px", maxWidth: "500px", margin: "0 auto 40px", lineHeight: "1.8" },
    ctaBannerBtn: { display: "inline-block", padding: "16px 48px", backgroundColor: gold, color: dark, textDecoration: "none", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700" },
};