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

import Intro from "../../img/footer-flip.jpg"





export const ContactUs = props => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [emailBody, setEmailBody] = useState("")
    const [phone, setPhone] = useState("")
    const [subject, setSubject] = useState("")


    function sendEmail() {
        var recipient = "kpdlabs@kpdlabs.com";
        var subjects = "Feedback";
    
        window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subjects);
    }

    function fullEmail() {
        let recipient = "kpdlabs@kpdlabs.com"
        window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(emailBody) + encodeURIComponent(phone)
    }


return(
<>
<div className="page-wrapper">

	
    
  


  <section className="contact-us-page banner-slide" style={{backgroundImage: `url(${Intro})`, position: "relative", backgroundRepeat: "no-repeat", marginTop: "125px", padding: "110px, 0, 110px", minHeight: "350px"}}>
		<div className="auto-container">
			<div className="title-outer text-center">
				<h1 className="title"  style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>Contact Us</h1>
				<ul className="page-breadcrumb">
					<li><a href="/">Home</a></li>
                    <li><i className="fa-solid fa-angle-right"></i></li>
					<li>Contact</li>
				</ul>
			</div>
		</div>
	</section>

	<section className="contact-details">
		<div className="container pb-70">
			<div className="row">
				<div className="col-xl-7 col-lg-6">
					<div className="sec-title">
						<span className="sub-title">Send us email</span>
						<h2>Feel free to write</h2>
					</div>
				
					<form id="contact_form" name="contact_form" className=""  onSubmit={()=>fullEmail()}>
						<div className="row">
							<div className="col-sm-6">
								<div className="mb-3">
									<input name="form_name" className="form-control" type="text" placeholder="Enter Name" value={name} onChange={(e)=>setName(e.target.value)}/>
								</div>
							</div>
							<div className="col-sm-6">
								<div className="mb-3">
									<input name="form_email" className="form-control required email" type="email" placeholder="Enter Email" value={email} onChange={(e)=> setEmail(e.target.value)}/>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="col-sm-6">
								<div className="mb-3">
									<input name="form_subject" className="form-control required" type="text" placeholder="Enter Subject" value={subject} onChange={(e)=>setSubject(e.target.value)}/>
								</div>
							</div>
							<div className="col-sm-6">
								<div className="mb-3">
									<input name="form_phone" className="form-control" type="text" placeholder="Enter Phone" value={phone} onChange={(e)=> setPhone(e.target.value)} />
								</div>
							</div>
						</div>
						<div className="mb-3">
							<textarea name="form_message" className="form-control required" rows="7" placeholder="Enter Message" value={emailBody} onChange={(e)=>{setEmailBody(e.target.value)}} ></textarea>
						</div>
						<div className="mb-5">
							<input name="form_botcheck" className="form-control" type="hidden" value="" />
							<button type="submit" className="theme-btn btn-style-one" data-loading-text="Please wait..."><span className="btn-title">Send message</span></button>
							<button type="reset" className="theme-btn btn-style-one bg-theme-color5"><span className="btn-title">Reset</span></button>
						</div>
					</form>
					
				</div>
				<div className="col-xl-5 col-lg-6">
					<div className="contact-details__right">
						<div className="sec-title">
							<span className="sub-title">Need any help?</span>
							<h2>Get in touch</h2>
							<div className="text">We look forward to serving your dental needs!</div>
						</div>
						<ul className="list-unstyled contact-details__info">
							<li>
								<div className="icon">
                                <i className="fa-solid fa-phone" style={{fontSize: "30px"}}></i>
								</div>
								<div className="text">
									<h6>Have a question?</h6>
									<a href="tel:863-438-2102">863-438-2102</a>
								</div>
							</li>
							<li>
								<div className="icon">
                                <i className="fas fa-envelope" style={{fontSize: "30px"}} onClick={()=>sendEmail()}></i>
								</div>
								<div className="text">
									<h6>Write email</h6>
									<a href="mailto:kpdlabs@kpdlabs.com">kpdlabs@kpdlabs.com</a>
								</div>
							</li>
							<li>
								<div className="icon">
                                <i className="fas fa-location-dot" style={{fontSize: "30px"}}></i>
								</div>
								<div className="text">
									<h6>Visit anytime</h6>
									<span>3393 US Hwy 17-92 West Haines City, FL</span>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>


	
	<section className="map-section">
    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56299.88475939487!2d-81.65276555917411!3d28.123867342046044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88dd7150d3620fcd%3A0xa583ad760053fe35!2s3393%20U.S.%20Hwy%2017-92%20N%2C%20Florida!5e0!3m2!1sen!2sus!4v1713188069365!5m2!1sen!2sus" style={{width:"100%", height:"600px", border:0 , allowfullscreen:"", loading:"lazy", referrerpolicy: "no-referrer-when-downgrade"}}></iframe>
	</section>
	
  

 


</div>



<div className="scroll-to-top scroll-to-target" data-target="html"><span className="fa fa-angle-up"></span></div>

</>)}