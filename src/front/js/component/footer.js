import React from "react";
import FootBKG from "../../img/footer-bg.jpg";
import Logo from "../../img/kpd_logo_final.png";
import "../../styles/home.css";
import "../../styles/slick-theme.css";
import "../../styles/slick.css";
import "../../styles/style.css";
import "../../styles/animate.css";
import "../../styles/adminSingle.css";

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="main-footer no-print" style={{ backgroundImage: `url(${FootBKG})` }}>
            <div className="bg-image"></div>

            {/* Widgets */}
            <div className="widgets-section">
                <div className="auto-container">
                    <div className="row">

                        {/* Logo column */}
                        <div className="footer-column col-lg-4 col-sm-6 wow fadeInLeft">
                            <div className="footer-widget about-widget">
                                <div className="logo ps-4">
                                    <a href="/"><img src={Logo} alt="KPD Labs" style={{ height: "110px", width: "175px" }} /></a>
                                </div>
                                <div style={{ paddingLeft: "16px" }}>
                                    <span style={{ color: "white", fontSize: "11px" }}>Kronemeyer Precision </span>
                                    <span style={{ color: "#ffaa17", fontSize: "11px" }}>Dental Laboratories, LLC</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-column col-lg-4 col-sm-6 fadeInLeft">
                            <div className="footer-widget contact-widget">
                                <h3 className="widget-title">Quick Links</h3>
                                <ul className="contact-info">
                                    <li><i className="fa-solid fa-angle-right"></i> <a href="/aboutus">About Us</a></li>
                                    <li><i className="fa-solid fa-angle-right"></i> <a href="/crownandbridge">Crown & Bridge</a></li>
                                    <li><i className="fa-solid fa-angle-right"></i> <a href="/veneer">Veneer</a></li>
                                    <li><i className="fa-solid fa-angle-right"></i> <a href="/partial">KPD Premier Partial</a></li>
                                    <li><i className="fa-solid fa-angle-right"></i> <a href="/denture">KPD Premier Denture</a></li>
                                    <li><i className="fa-solid fa-angle-right"></i> <a href="/removable-program">Removable Program</a></li>
                                    <li><i className="fa-solid fa-angle-right"></i> <a href="/pricing">Pricing</a></li>
                                    <li><i className="fa-solid fa-angle-right"></i> <a href="/contactus">Contact Us</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="footer-column col-lg-4 col-sm-6 fadeInLeft">
                            <div className="footer-widget contact-widget">
                                <h3 className="widget-title">Contact Now</h3>
                                <div className="widget-content">
                                    <div className="text">
                                        <i className="fa-solid fa-location-dot"></i> 3393 US Hwy 17-92 West
                                        <div className="footer-breakpoint"></div>Haines City, FL 33844
                                    </div>
                                    <ul className="contact-info">
                                        <li><i className="fas fa-envelope"></i> <a href="mailto:kpdlabs@kpdlabs.com">kpdlabs@kpdlabs.com</a></li>
                                        <li><i className="fas fa-phone"></i> <a href="tel:8634382109">863-438-2109</a></li>
                                    </ul>
                                    <ul className="social-icons justify-content-center">
                                        <li><a href="https://www.facebook.com/profile.php?id=61559674932411&mibextid=LQQJ4d"><i className="fab fa-facebook-f"></i></a></li>
                                        <li><a href="https://www.instagram.com/kpd_labs?igsh=MzRlODBiNWFlZA=="><i className="fab fa-instagram"></i></a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom" style={{ zIndex: 1 }} />
            <div className="auto-container">
                <div className="inner-container">
                    <div className="copyright-text text-center">
                        © {currentYear} KPD Labs. All Rights Reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};