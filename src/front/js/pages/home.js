import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { Helmet } from "react-helmet";
import Sparkle from 'react-sparkle';
import "../../styles/home.css";
import "../../styles/slick-theme.css";
import "../../styles/slick.css";
import "../../styles/style.css";
import "../../styles/animate.css";
import { Fade } from "react-awesome-reveal";
import { Navigate } from "react-router-dom";
import CustomVideoPlayer from "../component/CustomVideoPlayer";
import ThreeScene2 from "../component/Scene2";

import Zirc from "../../img/Crown.png";
import ZircV from "../../img/Veneer.png";
import PartialImg from "../../img/TCS Unbreakable Partial Denture.png";
import Denture from "../../img/Denture.png";
import Intro from "../../img/footer-flip.jpg";
import AboutBKG from "../../img/testi-bg.jpg";
import Lines21 from "../../img/lines2-1.png";
import Layer11 from "../../img/layer1-1.jpg";
import Itero from "../../img/itero-logo-2-300x103.png";
import Cerec from "../../img/CEREC-Logo-removebg-preview-300x94.png";
import Shape from "../../img/3shape-logo-vector-removebg-preview-300x167.png";
import Medit from "../../img/medit-logo-300.png";


export const Home = (props) => {
    const { store, actions } = useContext(Context);
    const [faq1, setFaq1] = useState(false);
    const [faq2, setFaq2] = useState(false);
    const [faq3, setFaq3] = useState(false);
    const [faq4, setFaq4] = useState(false);
    const [iteroShow, setIteroShow] = useState(false);
    const [cerecShow, setCerecShow] = useState(false);
    const [shapeShow, setShapeShow] = useState(false);
    const [meditShow, setMeditShow] = useState(false);

    const products = [
        { img: Zirc, title: "Crown & Bridge", desc: "Full Contour Zirconia, Microlayered PFZ, PMMA Temporary", link: "/crownandbridge" },
        { img: ZircV, title: "Veneer", desc: "Microlayered PFZ with Structure, Stain & Glaze", link: "/veneer" },
        { img: PartialImg, title: "KPD Premier Partial", desc: "Precision-fit, flexible, metal-free removable partial", link: "/partial" },
        { img: Denture, title: "KPD Premier Denture", desc: "CNC-milled PMMA with hand-characterized Vita Akzent gingiva", link: "/denture" },
    ];

    const scanners = [
        {
            img: Itero, name: "iTero", show: iteroShow, toggle: () => setIteroShow(!iteroShow),
            steps: [
                "Login to your iTero/Align Tech Doctor's portal.",
                "Navigate to \"Add Preferred Lab\" and input our Company ID: 420339.",
                "If issues arise, call iTero support directly with our Company ID (420339) and they'll connect your practice with KPD Labs.",
            ]
        },
        {
            img: Cerec, name: "CEREC", show: cerecShow, toggle: () => setCerecShow(!cerecShow),
            steps: [
                "Login to your Sirona Connect Doctor's Portal and navigate to \"Add\".",
                "Under \"My Account\" click \"My Favorite Laboratories\" then \"Search Labs\".",
                "Enter KPD Labs in the Company Name field, or search by zip code: 33844.",
                "Find KPD Labs and click the plus sign in the \"Add\" column.",
            ]
        },
        {
            img: Shape, name: "3Shape", show: shapeShow, toggle: () => setShapeShow(!shapeShow),
            steps: [
                "Login to your 3Shape Communicate account.",
                "Navigate to \"More\" → \"Settings\" → \"Connections\" → \"Labs\" → \"Add\".",
                "Type our email: kpdlabs@kpdlabs.com",
                "KPD Labs will appear — click \"Connect\".",
            ]
        },
        {
            img: Medit, name: "Medit", show: meditShow, toggle: () => setMeditShow(!meditShow),
            steps: [
                "Sign in to your Medit Link account.",
                "Click \"Partners\" in the left-hand column, then \"Search for Partners\".",
                "Search for kpdlabs@kpdlabs.com",
                "Select KPD Labs to add us as a partner.",
            ]
        },
    ];

    return (
        <>
        <Helmet>
            <title>KPD Labs | Dental Laboratory — Haines City, Florida</title>
            <meta name="description" content="KPD Labs is a full-service dental laboratory in Haines City, Florida offering zirconia crowns, microlayered veneers, PMMA temporaries, and premium removable prosthetics. Fast turnaround, digital workflow, family-run." />
            <meta name="keywords" content="dental lab Florida, dental laboratory Haines City, zirconia crowns Florida, dental lab Polk County, microlayered PFZ veneer, PMMA temporary crown, removable partial denture lab Florida" />
            <meta property="og:title" content="KPD Labs | Dental Laboratory — Haines City, Florida" />
            <meta property="og:description" content="Precision dental restorations crafted in Central Florida. Zirconia crowns, veneers, partials, and dentures. Fast turnaround, digital workflow." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://kpdlabs.com" />
            <link rel="canonical" href="https://kpdlabs.com" />
        </Helmet>

        {(!sessionStorage.getItem("id")) ?
        <div className="page-wrapper">

            {/* ── HERO ── */}
            <section className="banner-section">
                <div className="banner-slider slick-initialized slick-slider">
                    <div className="banner-slide">
                        <img src={Intro} style={{ position: "absolute" }} alt="KPD Labs dental laboratory" />
                        <div className="outer-box" style={{ zIndex: "2" }}>
                            <div className="auto-container" style={{ zIndex: "2" }}>
                                <div className="content-box" style={{ zIndex: "2" }}>
                                    <Fade cascade>
                                        <ul>
                                            <li>
                                                <span className="sub-title" style={{
                                                    border: "1px solid #ffaa17",
                                                    backgroundColor: "transparent",
                                                    color: "#ffaa17",
                                                    padding: "4px 12px",
                                                    letterSpacing: "3px",
                                                    fontSize: "11px",
                                                    fontWeight: "600"
                                                }}>KPD DENTAL LABORATORY</span>
                                            </li>
                                            <li>
                                                <h1 data-animation-in="fadeInLeft" data-delay-in="0.2">
                                                    Wizards of <br />Dental Technology
                                                    <Sparkle minSize={6} maxSize={12} count={40} fadeOutSpeed={12} color={'#ffaa17'} flickerSpeed={'slowest'} />
                                                </h1>
                                            </li>
                                            <li>
                                                <p style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Arial', sans-serif", fontSize: "15px", maxWidth: "420px", lineHeight: "1.7", marginBottom: "32px" }}>
                                                    Digital precision. Handcrafted quality. Every case, every time.
                                                </p>
                                            </li>
                                            <li>
                                                <div className="btn-box" style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                                                    <a href="/signup" className="theme-btn">Send Us A Case</a>
                                                    <a href="/pricing" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Arial', sans-serif", fontSize: "13px", letterSpacing: "1px", textDecoration: "none" }}>
                                                        Request Pricing →
                                                    </a>
                                                </div>
                                            </li>
                                        </ul>
                                    </Fade>
                                </div>
                            </div>
                        </div>
                        <div className="d-none d-md-flex outer-box col-lg-8 float-end"
                            style={{ width: "50%", height: "auto", position: "absolute", zIndex: "1", left: "auto", right: "0" }}>
                            <ThreeScene2 />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── THREE PILLARS ── */}
            <section style={{ backgroundColor: "#222429", borderTop: "3px solid #ffaa17" }}>
                <div className="auto-container">
                    <div className="row g-0">
                        {[
                            { icon: "fa-solid fa-award", title: "Unparalleled Quality", text: "Every restoration leaves our lab meeting the standard we'd set for our own patients." },
                            { icon: "fa-solid fa-comments", title: "Seamless Communication", text: "Clear, fast communication from scan received to case delivered — no guesswork." },
                            { icon: "fa-solid fa-person-running", title: "Fast Turnaround", text: "Standard production 4–6 business days. Rush options available." },
                        ].map((item, i) => (
                            <div key={i} className="service-block col-lg-4 col-md-6">
                                <div className="inner-box">
                                    <div className="icon-box">
                                        <i className={item.icon}></i>
                                        <h5 className="title"><a>{item.title}</a></h5>
                                    </div>
                                    <div className="text">{item.text}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── OUR PROMISE ── */}
            <section className="about-section" style={{ backgroundImage: `url(${AboutBKG})` }}>
                <div className="auto-container">
                    <div className="row">
                        <div className="content-column col-lg-6 wow fadeInLeft" data-wow-delay="600ms">
                            <div className="inner-column">
                                <div className="sec-title">
                                    <span className="sub-title">KPD Labs ::::::</span>
                                    <h2>Our Promise</h2>
                                    <div className="text" style={{ textTransform: "none", color: "#333" }}>
                                        As a family-run dental lab based in Central Florida, we combine modern digital technology with time-tested craftsmanship to deliver restorations that exceed expectations. Our commitment goes beyond production — we streamline lab-to-doctor communication, guarantee clear timelines, and stand behind every case we deliver. From the initial scan to final placement, we're with you every step of the way.
                                    </div>
                                </div>
                                <div className="btn-box">
                                    <a href="/aboutus" className="btn theme-btn" style={{ textTransform: "none" }}>Discover More</a>
                                </div>
                            </div>
                        </div>
                        <div className="image-column col-lg-6 wow fadeInRight millvideo" data-wow-delay="600ms">
                            <div className="inner-column">
                                <div className="image-box">
                                    <CustomVideoPlayer />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRODUCTS ── */}
            <section className="service-section-two" id="products">
                <div className="auto-container">
                    <div className="sec-title text-center">
                        <span className="sub-title">::::::  WHAT WE OFFER  ::::::</span>
                        <h2>Precision Restorations<br />For Every Case</h2>
                    </div>
                    <div className="row">
                        {products.map((p, i) => (
                            <div key={i} className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay={`${400 + i * 200}ms`}>
                                <div className="inner-box">
                                    <div className="image-box">
                                        <figure className="image overlay-animr">
                                            <img src={p.img} alt={p.title} className="product-pic" />
                                        </figure>
                                    </div>
                                    <div className="content-box">
                                        <h4 className="title"><a href={p.link}>{p.title}</a></h4>
                                        <div className="text">{p.desc}</div>
                                        <a href={p.link} className="ser-btn">Learn More <i className="fa-solid fa-angles-right"></i></a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── REMOVABLE PROGRAM CALLOUT ── */}
                    <div style={{
                        backgroundColor: "#222429",
                        borderTop: "3px solid #ffaa17",
                        borderRadius: "8px",
                        padding: "36px 48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "24px",
                        marginTop: "48px"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: "1", minWidth: "280px" }}>
                            <i className="fa-solid fa-shield-halved" style={{ color: "#ffaa17", fontSize: "36px", flexShrink: "0" }}></i>
                            <div>
                                <p style={{ color: "#ffaa17", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700", marginBottom: "4px" }}>KPD Removable Program</p>
                                <p style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: "16px", margin: "0", lineHeight: "1.5" }}>
                                    Every removable comes backed by our 30-day warranty and forever replacement program.
                                </p>
                            </div>
                        </div>
                        <a href="/partial" style={{
                            display: "inline-block",
                            padding: "12px 32px",
                            backgroundColor: "transparent",
                            color: "#ffaa17",
                            border: "1px solid #ffaa17",
                            fontSize: "11px",
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            fontFamily: "'Arial', sans-serif",
                            fontWeight: "700",
                            textDecoration: "none",
                            whiteSpace: "nowrap"
                        }}>Learn More →</a>
                    </div>
                </div>
            </section>

            {/* ── CONNECT YOUR SCANNER ── */}
            <section style={{ backgroundColor: "#222429", borderTop: "3px solid #ffaa17", padding: "80px 60px" }}>
                <div className="auto-container">
                    {/* Header */}
                    <div style={{ marginBottom: "60px" }}>
                        <span style={{ fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "#ffaa17", fontFamily: "'Arial', sans-serif", fontWeight: "600" }}>CONNECT</span>
                        <h2 style={{ color: "white", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", letterSpacing: "-0.5px", marginTop: "12px", marginBottom: "16px" }}>
                            Already Have an Intraoral Scanner?<br />Connect to KPD in Minutes.
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Arial', sans-serif", fontSize: "15px", maxWidth: "560px", lineHeight: "1.7", margin: "0" }}>
                            We're integrated with all major digital scanning platforms. Select your scanner below for step-by-step setup instructions and start sending cases digitally today.
                        </p>
                    </div>

                    {/* Logo grid — fully inline, no template classes */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px", backgroundColor: "rgba(255,170,23,0.1)" }}>
                        {scanners.map((scanner, i) => (
                            <div key={i} style={{ backgroundColor: "#222429" }}>
                                {/* Logo button */}
                                <div
                                    onClick={scanner.toggle}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "40px 24px 24px",
                                        cursor: "pointer",
                                        borderBottom: scanner.show ? "2px solid #ffaa17" : "2px solid transparent",
                                        transition: "border-color 0.2s ease"
                                    }}
                                >
                                    <img
                                        src={scanner.img}
                                        alt={scanner.name}
                                        style={{
                                            maxHeight: "70px",
                                            maxWidth: "160px",
                                            width: "auto",
                                            objectFit: "contain",
                                            filter: "brightness(0) invert(1)",
                                            opacity: scanner.show ? "1" : "0.6",
                                            transition: "opacity 0.2s ease"
                                        }}
                                    />
                                    <i
                                        className={scanner.show ? "fa-solid fa-angle-up" : "fa-solid fa-angle-down"}
                                        style={{ color: "#ffaa17", fontSize: "14px", marginTop: "20px" }}
                                    ></i>
                                </div>

                                {/* Steps dropdown */}
                                {scanner.show && (
                                    <div style={{ padding: "24px 28px 32px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                                        <p style={{ color: "#ffaa17", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700", marginBottom: "16px" }}>
                                            {scanner.name} Setup
                                        </p>
                                        <ol style={{ paddingLeft: "18px", margin: "0" }}>
                                            {scanner.steps.map((step, j) => (
                                                <li key={j} style={{ marginBottom: "10px", fontFamily: "'Arial', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7" }}>
                                                    {step}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ + BLOG ── */}
            <section className="faqs-section" style={{ backgroundColor: "#F6F6F6" }}>
                <div className="auto-container">
                    <div className="row">
                        <div className="faq-column col-lg-6 wow fadeInUp" data-wow-delay="400ms">
                            <div className="inner-column">
                                <div className="sec-title">
                                    <span className="sub-title">QUESTIONS & ANSWERS ::::::</span>
                                    <h2>Frequently Asked<br />Questions</h2>
                                </div>
                                <ul className="accordion-box">
                                    {[
                                        {
                                            state: faq1, setState: setFaq1,
                                            q: "How do I get started with KPD?",
                                            a: <span>Click <a href="/signup">sign up</a> to create an account. Feel free to <a href="/contactus">contact us</a> with any questions about getting started.</span>
                                        },
                                        {
                                            state: faq2, setState: setFaq2,
                                            q: "What products does KPD offer?",
                                            a: "Crown & Bridge (Full Contour Zirconia, Microlayered PFZ, PMMA Temporary), Veneers (Microlayered PFZ), KPD Premier Partial, and KPD Premier Denture. Visit our Products pages for full details on each."
                                        },
                                        {
                                            state: faq3, setState: setFaq3,
                                            q: "What are KPD's terms?",
                                            a: <span>Review our full <a href="/terms">terms and conditions here</a>.</span>
                                        },
                                        {
                                            state: faq4, setState: setFaq4,
                                            q: "What is KPD's turnaround time?",
                                            a: "Standard production is 4–6 business days. Rush production options are available — contact us to discuss your timeline."
                                        },
                                    ].map((faq, i) => (
                                        <li key={i} className={`accordion block ${faq.state ? 'active-block' : ''}`}>
                                            <div className={`acc-btn ${faq.state ? 'active' : ''}`}
                                                onClick={() => faq.setState(!faq.state)}>
                                                {faq.q}
                                                <i className="icon fas fa-angle-right"></i>
                                            </div>
                                            <div className={`acc-content ${faq.state ? 'current' : ''}`}>
                                                <div className="content">
                                                    <div className="text">{faq.a}</div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="image-column col-lg-6" style={{ backgroundImage: `url(${Layer11})`, paddingRight: "20px" }}>
                            <div className="inner-column" style={{ paddingTop: "20px" }}>
                                <div className="image-box text-center">
                                    <span style={{ color: "#ffaa17", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700" }}>Latest from KPD</span>
                                    <h2 style={{ color: "white", marginTop: "12px" }}>From the Lab</h2>
                                    <h4 style={{ color: "rgba(255,255,255,0.8)", fontWeight: "400", lineHeight: "1.5", marginTop: "16px" }}>
                                        The Aesthetic and Functional Benefits of Super High Translucent Zirconia Finished with MiYO Liquid Ceramics for Anterior and Posterior Restorations
                                    </h4>
                                    <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Arial', sans-serif", fontSize: "12px", letterSpacing: "1px" }}>
                                        June 26, 2024
                                    </span>
                                    <div style={{ paddingTop: "28px" }} className="btn-box">
                                        <a href="/blogs" className="theme-btn">All Blog Posts</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── BOTTOM CTA ── */}
            <section className="contact-banner" style={{ backgroundColor: "#222429", borderTop: "3px solid #ffaa17" }}>
                <div className="auto-container">
                    <div className="outer-box" style={{ backgroundImage: `url(${Lines21})`, backgroundRepeat: "no-repeat" }}>
                        <div className="content-box wow fadeInLeft" data-wow-delay="400ms">
                            <h3 className="title" style={{ color: "white" }}>
                                Experience the KPD difference — precision craftsmanship, delivered on time.
                            </h3>
                        </div>
                        <div className="btn-box wow fadeInRight" data-wow-delay="400ms">
                            <a href="/signup" className="theme-btn" style={{
                                display: "inline-block",
                                padding: "16px 48px",
                                height: "auto",
                                lineHeight: "normal",
                                fontSize: "14px",
                                letterSpacing: "2px",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap"
                            }}>Send Us a Case</a>
                        </div>
                    </div>
                </div>
            </section>

        </div>
        : <Navigate to={`/account/${sessionStorage.getItem("id")}`} />}
        </>
    );
};