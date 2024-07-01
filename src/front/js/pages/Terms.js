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


export const Terms = props => {

    // function sendEmail() {
    //     var recipient = "kpdlabs@kpdlabs.com";
    //     var subject = "Feedback";
    
    //     window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
    // }




return(
<>
<div className="page-wrapper">



	<section className="banner-slide about-us-page" style={{backgroundImage: `url(${Intro})`, position: "relative", backgroundRepeat: "no-repeat", marginTop: "125px", padding: "110px, 0, 110px", minHeight: "350px"}}>
		<div className="auto-container">
			<div className="title-outer text-center">
				<h1 className="title" style={{color: "white", fontSize: "64px", marginBottom: "17px", paddingTop: "100px", fontWeight: "700"}}>Terms</h1>
				<ul className="page-breadcrumb">
					<li><a href="/">Home</a></li>
                    <li><i className="fa-solid fa-angle-right"></i></li>
					<li>Terms</li>
				</ul>
			</div>
		</div>
	</section>

  

 
 


  

  <section className="terms-section" style={{paddingLeft: "100px", paddingRight: "100px"}}>
  Welcome to our website. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern Kronemeyer Precision Dental Laboratories, LLC relationship with you in relation to this website. If you disagree with any part of these terms and conditions, please do not use our website.
The term Kronemeyer Precisions Dental Laboratories, LLC or ‘KPD Labs’ or ‘KPD or ‘us’ or ‘our’ or ‘we’ refers to Kronemeyer Precision Dental Laboratories, LLC whose company certificate number is L24000137239. The term ‘you’ or ‘client’ refers to the user or viewer of this website.
<br></br>
<br></br>
The use of this website is subject to the following terms of use:
<br></br>
•	The content of the pages of this website is for your information and use only. It is subject to change without notice.
<br></br>
•	Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
<br></br>
•	Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services, or information available through this website meet your specific requirements.
<br></br>
•	Reproduction of any material on this website is prohibited unless you have the prior written consent of Kronemeyer Precision Dental Laboratories, LLC.
<br></br>
•	All trademarks reproduced in this website, which are not the property of, or licensed to the operator, are acknowledged on the website.
<br></br>
•	Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.
<br></br>
•	Your use of this website and any dispute arising out of such use of the website is subject to the laws of the United States.
<br></br>
<br></br>
<strong>Terms and Conditions</strong>
<br></br>
All orders placed with Kronemeyer Precision Dental Laboratories, LLC (“KPD”) by the Client are subject to the following:
<br></br>
1.	Credit Policy.
<br></br>
    a.	The initial credit is limited to $2,500 until the credit is established or 15 days whichever comes first.
<br></br>
        i.	When your account reaches the $2,500 threshold or 15 days your preferred method of payment (credit card add 3% merchant fee or ACH with no fee) will be charged.
<br></br>
	b.	Credit can be established at KPD Labs sole discretion through the use of KPD Labs Account Form or the Client’s history with KPD Labs. Any established credit may be revoked if the Client is past due.
<br></br>
		i.	Once credit is established your preferred method of payment (credit card add 3% merchant fee or ACH with no fee) will be automatically charged once per month.
<br></br>
2.	Payment Terms. 
<br></br>
	a.	The client will receive an emailed invoice as every case is shipped detailing the products and associated fees incurred. 
<br></br>
	b.	Payment is due in full upon receipt.
<br></br>
		i.	In addition, the Client will receive a monthly statement listing all outstanding invoices. 
<br></br>
		ii.	A finance charge will be assessed to any past due account of 1.5% per month, or maximum amount permitted by law. 
<br></br>
3.	KPD Labs may refuse to accept new or complete existing orders on accounts with past due balances.
<br></br>
4.	Accounts more than (60) days past due will be subject to COD including any COD surcharge until the account is current. KPD Labs may require a delinquent account holder to pay a deposit for existing or continuing orders.
<br></br>
5.	KPD Labs reserves the right to refuse to accept orders and/or terminate the agreement without notice. Following any termination, client agrees to pay all outstanding balances, plus any reasonable attorney’s fees and costs associated with collecting the balance or monies owed.
<br></br>
6.	Any credit must be applied to appliances and services within (60) days of issuance.
<br></br>
7.	Returned payments (ACH, Check, Declined Card) will be assessed $35 fee or the maximum fee permitted by law plus any associated bank costs/fees. 
<br></br>
8.	Customer must examine all goods and appliances for fitness and condition. Please see Limited Warranty/Limitation of Liability.
<br></br>
9.	Any use, sale, alternation or modification to the appliance or failure to timely notify and return the appliance to KPD Labs within (30) days of receipt of the item stall constitute acceptance of the appliance.
<br></br>
10.	KPD Labs reserves the right to correct any defect before issuance of any credit or refund.
<br></br>
11.	KPD Labs must receive written notice of any disputed charges from client within (30) days after the invoice date or client shall be deemed to have waived its right to dispute the charges. Client will be deemed to have accepted all invoices and/or statements for which KPD Labs does not receive such timely notification of dispute and shall pay all undisputed amounts due under such invoices within the period set forth herein.
<br></br>
12.	Notwithstanding anything contained in any pricing schedule or other document to the contrary, KPD Labs reserves the right to adjust pricing at any time upon two week prior notice.
<br></br>
13.	Each laboratory authorization procedure (prescription) constitutes a complete and separate transaction billed and collected.
<br></br><br></br>
<strong>Remake Policy.</strong>
<br></br>
Remake charges of 50-100% will apply under the following conditions:
<br></br>
1.	If a remake is requested after the lab deemed the provided case materials incomplete and/or unsatisfactory and customer elects to proceed with the completion of the case without making any adjustment, refuses a try-in, or does not supply requested materials.
<br></br>
2.	If a remake is requested because the customer requests a tooth shade or mold different from the original request. 
<br></br>
3.	Shade must be submitted as Vita Classical 16 Shade Guide, not providing intraoral photo of natural dentition with equivalent Vita Classical Shade tab for anterior crowns and veneers voids 50% remake charge and is subject to 100% remake fee. 
<br></br>
4.	If a remake is requested due to treatment plan or material change from the original request.
<br></br>
5.	If a remake is requested greater than 30 days from invoice date.
<br></br>
6.	If a remake is requested for immediate/surgical partials or dentures or treatments with healing extractions.
<br></br>
7.	If a remake is requested because the appliance fits the model but does not fit in the mouth.
<br></br>
KPD Labs Remake Policy will not apply to any account past due. KPD Labs reserves the right in its sole discretion to refuse accepting any new cases and processing remake cases until the balance is paid in full and the account is current. 
A non-refundable charge will apply if the original appliance is not returned at the time of remake request. 
KPD Labs can amend the remake policy at its sole discretion and without prior notice.
Shipping
<br></br>
1.	Standard shipping is a flat $10 rate.
<br></br>
	a.	Multiple cases MAY be grouped into one shipment based on submitted case volume and frequency.
<br></br>
2.	Expedited shipping is a flat $35 rate.
<br></br>
	a.	Multiple cases MAY be grouped into one shipment based on submitted case volume and frequency.
<br></br>
<br></br>
<strong>Limited Warranty / Limitation of Liability</strong>
<br></br>
KPD Labs accepts no liability for damages to customer, any provider, or any patient(s) for any cause arising under or related to the products or services provided. In no event will KPD Labs be liable for any indirect, special, incidental, or consequential damages, or for any claim against customer by any other party. 
KPD Labs warrants that all crown and bridge restorations and removable prosthetics, and other devices will be constructed according to the prescribing dentist’s specifications. 
KPD Labs will repair or replace any product that fails due to defects in materials or workmanship, such as chipped or cracked porcelain, broken acrylic and/or a tooth falling out of removable appliance, within a period of one year from date of invoice.
The warranty will be void for removable prosthetics fabricated without a try-in/setup. 
KPD Labs is not responsible for any additional costs or fees associated with adjustments, repairs, and replacement of dental devices. 
KPD Labs does not warrant that such devices are fit for any particular purpose and if such disclaimer is not permitted by law, the duration of any implied warranty is limited to ninety (90) days from the date of delivery. 
This warranty is in lieu of and supersedes all other warranties, whether expressed or implied, and may not be modified by any agent, employee, representative or distributor of KPD Labs.

  </section>

  

  


</div>




<div className="scroll-to-top scroll-to-target" data-target="html"><span className="fa fa-angle-up"></span></div>
</>

)}