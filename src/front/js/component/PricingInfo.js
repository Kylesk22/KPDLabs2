// import React, { useContext, useEffect, useState } from "react";
// import { Link, Navigate } from "react-router-dom";
// import { Signup } from "../pages/Signup";
// import CaseyWork from "../../img/CaseyWork.jpg"
// import bgbg from "../../img/bgbg.png"
// import bgbgprice from "../../img/lines2-1.png"
// import Intro from "../../img/footer-flip.jpg"
// import "../../styles/priceinfo.css";

// import Zirc from "../../img/Crown.png"
// import ZircV from "../../img/Veneer.png"
// import Partial from "../../img/TCS Unbreakable Partial Denture.png"
// import Denture from "../../img/Denture.png"
// import Implant from "../../img/Implant.png"
// import NightGuard from "../../img/NightGuard.png"




// export const PricingInfo = props => {
//     const [loggedIn, setLoggedIn] = useState(props.logState);
//     const [id, setId] = useState("");
//     const [email, setEmail] = useState("");
//     const [firstName, setFirstName] = useState("");
//     const [lastName, setLastName] = useState("");
//     const [practiceName, setPracticeName] = useState("");
//     const [officeNumber, setOfficeNumber] = useState("");
//     const [mobileNumber, setMobileNumber] = useState("");
//     const [password, setPassword] = useState("");
//     const [findUs, setFindUs] = useState("")
//     const [position, setPosition] = useState("")
//     const [type, setType] = useState("")


//     const url = process.env.BACKEND_URL
//     let user;

//     // useEffect(()=>{
//     //     if (sessionStorage.getItem("id") === true) {           
//     //         <Navigate to= {`/account/${sessionStorage.getItem("id")}`}> </Navigate>
            
//     //     }
        
//     // });

//     function sentToSlack(){

//         let message = {
//             "msg": `Pricing info requested! Email: ${email}, Name: ${firstName} ${lastName}, Practice: ${practiceName}, Office: ${officeNumber}, Mobile: ${mobileNumber}, Position: ${position}, Found Us:${findUs}`,
//         }

//         const options = {
//             method:"POST",
//             withCredntials: true,
//             credentials: 'include',
            
//             headers:{
//                 "Content-Type": "application/json",
                
//             },
//             body: JSON.stringify(message)
            
            
//         }
//         fetch(`${url}/slack`, options)
//         .then((res)=> {
//             if (res.ok) {
//                 return res.json()
//                 .then((data)=>{
//                     console.log(data)
//                 });
//             } else {
//                 return res.json()
//                 .then((body)=>{
//                     console.log(body)
//                     alert(body.message);
//                 });
//             }
//         })
//         .catch((err)=> {
//             console.log(err);
            
//         });
        
       

//     }

//     function submitHandler(e){
//         e.preventDefault();
//         user = {
//             firstName,
//             lastName,
//             email,
//             practiceName,
//             officeNumber,
//             mobileNumber,
//             findUs,
//             position
//         }
//         const options = {
//             method:"POST",
//             withCredntials: true,
//             credentials: 'include',
            
//             headers:{
//                 "Content-Type": "application/json",
                
//             },
//             body: JSON.stringify(user)
//         }
//         fetch(`${url}/pricing`, options)
//         .then((res)=> {
//             if (res.ok) {
//                 return res.json()
//                 .then((data)=>{
//                    alert(data.message)
//                 });
                
//             } else {
//                 return res.json()
//                 .then((body)=>{
                    
//                     alert("Error: Please contact KPD");
//                 });
//             }
            
//         })
//         .then(()=>{window.location.href = "/"})
//         .catch((err)=> {
//             console.log(err);
            
//         });

//         sentToSlack()

//     }

//     const barStyle = {
//         width: '100%',
//         height: '4px', // Adjust the height as needed
//         backgroundColor: '#ffaa17',
        
 
//         left: '0', // Aligns the bar to the left edge of the viewport
//         zIndex: '1000' // Optional: makes sure the bar is on top of other content
//       };
//     return(
//         <div className="">
            
//             <div style={{paddingTop: "200px", textAlign: "center", justifyContent: "center", backgroundImage: `url(${Intro})`}}>
//             <h2 style={{color: "white"}}>Request Price List</h2> 
//             <div style={barStyle}></div>
//             <div className="row" style={{padding: "80px"}}>
//             <div className="col-8 pricing" style={{padding: "30px"}}>
           
//                 <h3 style={{color: "white"}}>Please fill out our form to recieve your price list from KPD</h3>
//                 <h4 style={{color: "white"}}>Questions? Please contact us at 863-438-2109 or kpdlabs@kpdlabs.com</h4>
//                 <div className="row pricing1" style={{justifyContent: "center"}}> 
//                     {/* <!-- service-block-two --> */}
//                     <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp m-5" data-wow-delay="400ms" style={{border: "#ffaa17 1px solid", borderRadius: "5px", width: "200px", height: "200px", boxShadow: `0px 0px 6px 8px #ffaa17`}}>
//                         <div className="inner-box" onClick={()=>setType("crown")}>
//                             <div className="image-box" >
//                             <figure className="image overlay-animr">
                                
//                                     {/* <img src={Zirc} alt="" className="product-pic" /> */}
                                
//                             </figure>
//                             {/* <i className="flaticon-clock-1"></i> */}
//                             </div>
//                             <div className="content-box text-center">
//                             <h4 className="title"><a style={{color: "white",textShadow: `
//       1px 1px 0 black, 
//       -1px -1px 0 black, 
//       1px -1px 0 black, 
//       -1px 1px 0 black
//     `}}>Crowns Starting at <h2 style={{color: "white"}}>$60</h2></a></h4>                 
//                             </div>
//                         </div>
//                     </div>
//                     {/* <!-- service-block-two --> */}
//                     <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp m-5" data-wow-delay="600ms" style={{border: "#ffaa17 1px solid", borderRadius: "5px", width: "200px", height: "200px", boxShadow: `0px 0px 6px 8px #ffaa17`}}>
//                     <div className="inner-box" onClick={()=>setType("veneer")}>
//                         <div className="image-box">
//                         <figure className="image overlay-anim">
//                             {/* <img src={ZircV} alt="" className="product-pic" /> */}
//                             </figure>
//                         {/* <i className="flaticon-monitor-1"></i> */}
//                         </div>
//                         <div className="content-box text-center">
//                         <h4 className="title"><a style={{color: "white"}}>Veneers Starting at <h2 style={{color: "white"}}>$95</h2></a></h4>
//                         </div>
//                     </div>
//                     </div>
//                     {/* <!-- service-block-two --> */}
//                     <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp m-5" data-wow-delay="800ms" style={{border: "#ffaa17 1px solid", borderRadius: "5px", width: "200px", height: "200px", boxShadow: `0px 0px 6px 8px #ffaa17`}}>
//                     <div className="inner-box" onClick={()=>setType("partial")}>
//                         <div className="image-box">
//                         <figure className="image overlay-anim">
//                             {/* <img src={Partial} alt="" className="product-pic" /> */}
//                             </figure>
//                         {/* <i className="flaticon-cog-1"></i> */}
//                         </div>
//                         <div className="content-box text-center">
//                         <h4 className="title"><a style={{color: "white"}}>Partials starting at <h2 style={{color: "white"}}>$250</h2></a></h4>
//                         </div>
//                     </div>
//                     </div>
//                     <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp m-5" data-wow-delay="800ms" style={{border: "#ffaa17 1px solid", borderRadius: "5px", width: "200px", height: "200px", boxShadow: `0px 0px 6px 8px #ffaa17`}}>
//                     <div className="inner-box" onClick={()=>setType("denture")}>
//                         <div className="image-box">
//                         <figure className="image overlay-anim">
//                             {/* <img src={Denture} alt="" className="product-pic" /> */}
//                             </figure>
//                         {/* <i className="flaticon-cog-1"></i> */}
//                         </div>
//                         <div className="content-box text-center">
//                         <h4 className="title"><a style={{color: "white"}}>Dentures starting at <h2 style={{color: "white"}}>$350</h2></a></h4>
//                         </div>
//                     </div>
//                     </div>
//                     <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp m-5" data-wow-delay="800ms" style={{border: "#ffaa17 1px solid", borderRadius: "5px", width: "200px", height: "200px", boxShadow: `0px 0px 6px 8px #ffaa17`}}>
//                     <div className="inner-box" onClick={()=>setType("implant")}>
//                         <div className="image-box">
//                         <figure className="image overlay-anim">
//                             {/* <img src={Implant} alt="" className="product-pic" /> */}
//                             </figure>
                        
//                         </div>
//                         <div className="content-box text-center">
//                         <h4 className="title"><a style={{color: "white"}}>Implants starting at <h2 style={{color: "white"}}>$500</h2></a></h4>
//                         </div>
//                     </div>
//                     </div>
//                     <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp m-5" data-wow-delay="800ms" style={{border: "#ffaa17 1px solid", borderRadius: "5px", width: "200px", height: "200px", boxShadow: `0px 0px 6px 8px #ffaa17`}}>
//                     <div className="inner-box" onClick={()=>setType("removeableAppliances")}>
//                         <div className="image-box">
//                         <figure className="image overlay-anim">
//                             {/* <img src={NightGuard} alt="" className="product-pic" /> */}
//                             </figure>
                        
//                         </div>
//                         <div className="content-box text-center">
//                         <h4 className="title"><a style={{color: "white"}}>Removable Appliances starting at <h2 style={{color: "white"}}>$50</h2></a></h4>
//                         </div>
//                     </div>
//                     </div>
//                 </div>
//                 {/* <img className="pricing1" src={CaseyWork} style={{width: "50%"}}></img> */}
//                {/* <img src={bgbg}></img> */}
//             </div>
//             <div className="form container form col-4 pricing2" onSubmit={submitHandler} style={{border: "#ffaa17 2px solid", borderRadius: "8px"}}>
//             <div className="pricingform" style ={{width: "300px", margin: "auto"}}> 
//                 <div className="form-group">
//                 <label htmlFor="userEmail" className="form-label mt-4 " style={{color: "white",textShadow: `
//       1px 1px 0 black, 
//       -1px -1px 0 black, 
//       1px -1px 0 black, 
//       -1px 1px 0 black
//     `}}>Email address</label>
//                         <input style={{border: "black 1px solid"}} type="email" className="form-control" id="userEmail" aria-describedby="emailHelp" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
//                         <small id="emailHelp" className="form-text text-muted">abc@abc.com.</small>
//                 </div>
//                 <div className="form-group mx-3">
//                         <label htmlFor="firstName" className="form-label mt-4" style={{textAlign: "center", color:"white"}} >First Name</label>
//                         <input style={{border: "black 1px solid"}} type="text" required className="form-control" id="firstName" placeholder="First Name" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
//                 </div>
//                 <div className="form-group mx-3">
//                         <label htmlFor="lastName" className="form-label mt-4 " style={{textAlign: "center", color:"white"}} >Last Name</label>
//                         <input style={{border: "black 1px solid"}} type="text" required className="form-control" id="lastName" placeholder="Last Name" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
//                 </div>
//                 <div className="form-group mx-3">
//                         <label htmlFor="practiceName" className="form-label mt-4 " style={{textAlign: "center", color:"white"}} >Practice Name</label>
//                         <input style={{border: "black 1px solid"}}  type="text" required className="form-control" id="practiceName" placeholder="Practice Name" value={practiceName} onChange={(e)=>setPracticeName(e.target.value)} />
//                 </div>
                
//                 <div className="form-group mx-3">
//                     <label htmlFor="officeNumber" className="form-label mt-4 " style={{color: "white"}}>Office Number</label>
//                     <input  style={{border: "black 1px solid"}} type="text" className="form-control" id="officeNumber" aria-describedby="phoneHelp" placeholder="Enter office number" value={officeNumber} onChange={(e)=>setOfficeNumber(e.target.value)}/>
//                     {/* <small id="phoneHelp" className="form-text text-muted">abc@abc.com.</small> */}
//                 </div>
//                 <div className="form-group mx-3">
//                     <label htmlFor="mobileNumber" className="form-label mt-4 " style={{color: "white"}}>Mobile Number</label>
//                     <input  style={{border: "black 1px solid"}} type="text" className="form-control" id="mobileNumber" aria-describedby="phoneHelp" placeholder="Enter mobile number" value={mobileNumber} onChange={(e)=>setMobileNumber(e.target.value)}/>
//                     {/* <small id="phoneHelp" className="form-text text-muted">abc@abc.com.</small> */}
//                 </div>

//                 <div className="form-group mx-3">
                    
//                         <label className="form-label mt-4 " htmlFor="findUs"style={{color: "white"}}>Professional Position?</label>
//                         <select  className="form-select" id="position"  style={{minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="" onChange={(e)=>{setPosition(e.target.value)}}>
//                             <option value="Select One">Select One</option>
//                             <option value="Dentist" onClick={()=>setPosition("Dentist")}>Dentist</option>
//                             <option value="Dental Office Manager" onClick={()=>setPosition("Dental Office Manager")}>Dental Office Manager</option>
//                             <option value="Dental Assistant" onClick={()=>setPosition("Dental Assistant")}>Dental Assistant</option>
//                             <option value="Dental Office Team Member" onClick={()=>setPosition("Dental Office Team Member")}>Dental Office Team Member</option>

                        
//                         </select>
//                 </div>


//                 <div className="form-group mx-3">
                    
//                         <label className="form-label mt-4 " htmlFor="findUs"style={{color: "white"}}>How did you hear about us?</label>
//                         <select className="form-select" id="findUs"  style={{minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="" onChange={(e)=>{setFindUs(e.target.value)}}>
//                             <option value="Select One">Select One</option>
//                             <option value="Google" onClick={()=>setFindUs("Google")}>Google</option>
//                             <option value="Mailer" onClick={()=>setFindUs("Mailer")}>Mailer/Flyer</option>
//                             <option value="Email" onClick={()=>setFindUs("Email")}>Email</option>
//                             <option value="Facebook" onClick={()=>setFindUs("Facebook")}>Facebook</option>
//                             <option value="Instagram" onClick={()=>setFindUs("Instagram")}>Instagram</option>
//                             <option value="LinkedIn" onClick={()=>setFindUs("LinkedIn")}>LinkedIn</option>
//                             <option value="Referral" onClick={()=>setFindUs("Referral")}>Referral</option>
                        
//                         </select>
//                     </div>

                

//                 <div className="form-group mx-auto w-100 text-center pt-3" >
//                         <button style={{border: "black 1px solid"}} className="btn btn-primary mb-4 mx-auto" type="button" value="Submit" onClick={submitHandler}>Submit
//                         </button>
//                     </div>
                
//             </div>
//             </div>
//             </div>
//             </div>
            
           
        
//         </div>
//     )
// }




import React, { useState } from "react";
import { Helmet } from "react-helmet";

const services = [
    {
        name: "Crown & Bridge",
        tagline: "Precision-milled zirconia, layered to perfection",
        detail: "Full contour, microlayered PFZ, and PMMA temporaries crafted to exact specifications.",
        icon: "◈"
    },
    {
        name: "Veneers",
        tagline: "Ultra-thin. Lifelike. Unforgettable results.",
        detail: "Microlayered porcelain-fused zirconia veneers with exceptional light transmission.",
        icon: "✦"
    },
    {
        name: "Partial Dentures",
        tagline: "Strength and comfort in every case",
        detail: "TCS Unbreakable partials engineered for long-term performance and patient satisfaction.",
        icon: "◉"
    },
    {
        name: "Complete Dentures",
        tagline: "Restorations that restore confidence",
        detail: "Premium and economy denture options, including try-in and wax rim services.",
        icon: "⬡"
    },
    {
        name: "Implant Restorations",
        tagline: "Digital precision for implant success",
        detail: "Implant crowns and hybrid dentures milled from biocompatible, high-strength materials.",
        icon: "◎"
    },
    {
        name: "Removable Appliances",
        tagline: "Night guards, trays, and more",
        detail: "Custom night guards, occlusal rims, custom trays, and Smile in a Snap solutions.",
        icon: "✧"
    }
];

export const PricingInfo = props => {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [practiceName, setPracticeName] = useState("");
    const [officeNumber, setOfficeNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [findUs, setFindUs] = useState("");
    const [position, setPosition] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const url = process.env.BACKEND_URL;

    function sentToSlack() {
        const message = {
            "msg": `Pricing info requested! Email: ${email}, Name: ${firstName} ${lastName}, Practice: ${practiceName}, Office: ${officeNumber}, Mobile: ${mobileNumber}, Position: ${position}, Found Us: ${findUs}`,
        };
        fetch(`${url}/slack`, {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message)
        }).catch(console.error);
    }

    function submitHandler(e) {
        e.preventDefault();
        const user = { firstName, lastName, email, practiceName, officeNumber, mobileNumber, findUs, position };
        fetch(`${url}/pricing`, {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        })
        .then(res => res.json())
        .then(() => { setSubmitted(true); sentToSlack(); })
        .catch(console.error);
    }

    return (
        <div style={styles.page}>
            <Helmet>
                <title>Pricing | KPD Labs Dental Laboratory Florida</title>
                <meta name="description" content="Request KPD Labs custom dental lab pricing for crowns, veneers, partials, and dentures. Serving Florida dentists with premium restorations and fast turnaround." />
                <link rel="canonical" href="https://kpdlabs.com/pricing" />
            </Helmet>

            {/* Hero */}
            <div style={styles.hero}>
                <div style={styles.heroGlow} />
                <div style={styles.heroContent}>
                    <p style={styles.heroEyebrow}>Kronemeyer Precision Dental Laboratories</p>
                    <h1 style={styles.heroTitle}>Quality Without<br />Compromise</h1>
                    <div style={styles.heroRule} />
                    <p style={styles.heroSub}>
                        We don't compete on price. We compete on results.<br />
                        Request your custom price list and discover what sets KPD apart.
                    </p>
                    <a href="#form" style={styles.heroCta}>Request Pricing →</a>
                </div>
            </div>

            {/* Services Grid */}
            <div style={styles.servicesSection}>
                <p style={styles.eyebrow}>What We Offer</p>
                <h2 style={styles.sectionTitle}>Crafted for the Cases That Matter Most</h2>
                <p style={styles.sectionSub}>Every restoration leaves our lab meeting the standard we'd want for our own patients.</p>
                <div style={styles.servicesGrid}>
                    {services.map((s, i) => (
                        <div key={i} style={styles.serviceCard}>
                            <div style={styles.serviceIcon}>{s.icon}</div>
                            <h3 style={styles.serviceName}>{s.name}</h3>
                            <p style={styles.serviceTagline}>{s.tagline}</p>
                            <p style={styles.serviceDetail}>{s.detail}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Value Props — dark bar matching navbar */}
            <div style={styles.valueSection}>
                <div style={styles.valueProp}>
                    <div style={styles.valueNum}>01</div>
                    <div>
                        <h4 style={styles.valueTitle}>Digital Precision</h4>
                        <p style={styles.valueText}>Every case designed and milled with CAD/CAM technology for consistent, accurate results.</p>
                    </div>
                </div>
                <div style={styles.valueDivider} />
                <div style={styles.valueProp}>
                    <div style={styles.valueNum}>02</div>
                    <div>
                        <h4 style={styles.valueTitle}>Fast Turnaround</h4>
                        <p style={styles.valueText}>Standard and rush production available. We work to your schedule, not ours.</p>
                    </div>
                </div>
                <div style={styles.valueDivider} />
                <div style={styles.valueProp}>
                    <div style={styles.valueNum}>03</div>
                    <div>
                        <h4 style={styles.valueTitle}>Dedicated Support</h4>
                        <p style={styles.valueText}>A real team that picks up the phone. Cases tracked start to finish, every time.</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div id="form" style={styles.formSection}>
                <div style={styles.formLeft}>
                    <p style={styles.eyebrowLight}>Get Started</p>
                    <h2 style={styles.formTitle}>Request Your<br />Price List</h2>
                    <p style={styles.formIntro}>
                        Fill out the form and we'll send you our complete fee schedule.
                        No pressure, no sales call — just transparent pricing from a lab
                        that stands behind its work.
                    </p>
                    <div style={styles.contactLine}>
                        <i className="fas fa-phone" style={styles.contactIcon}></i>
                        <span>863-438-2109</span>
                    </div>
                    <div style={styles.contactLine}>
                        <i className="fas fa-envelope" style={styles.contactIcon}></i>
                        <span>kpdlabs@kpdlabs.com</span>
                    </div>
                    <div style={styles.contactLine}>
                        <i className="fas fa-clock" style={styles.contactIcon}></i>
                        <span>Mon – Fri, 9:00AM – 5:00PM</span>
                    </div>
                </div>

                <div style={styles.formRight}>
                    {submitted ? (
                        <div style={styles.successBox}>
                            <div style={styles.successIcon}>✓</div>
                            <h3 style={styles.successTitle}>Request Received</h3>
                            <p style={styles.successText}>We'll be in touch shortly with your custom price list.</p>
                        </div>
                    ) : (
                        <form onSubmit={submitHandler} style={styles.form}>
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>First Name</label>
                                    <input required style={styles.input} type="text" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Last Name</label>
                                    <input required style={styles.input} type="text" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email Address</label>
                                <input required style={styles.input} type="email" placeholder="jane@practice.com" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Practice Name</label>
                                <input required style={styles.input} type="text" placeholder="Smith Family Dentistry" value={practiceName} onChange={e => setPracticeName(e.target.value)} />
                            </div>
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Office Number</label>
                                    <input style={styles.input} type="text" placeholder="(863) 000-0000" value={officeNumber} onChange={e => setOfficeNumber(e.target.value)} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Mobile Number</label>
                                    <input style={styles.input} type="text" placeholder="(863) 000-0000" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Your Role</label>
                                <select required style={styles.select} value={position} onChange={e => setPosition(e.target.value)}>
                                    <option value="">Select your position</option>
                                    <option value="Dentist">Dentist</option>
                                    <option value="Dental Office Manager">Dental Office Manager</option>
                                    <option value="Dental Assistant">Dental Assistant</option>
                                    <option value="Dental Office Team Member">Dental Office Team Member</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>How did you hear about us?</label>
                                <select style={styles.select} value={findUs} onChange={e => setFindUs(e.target.value)}>
                                    <option value="">Select one</option>
                                    <option value="Google">Google</option>
                                    <option value="Mailer">Mailer / Flyer</option>
                                    <option value="Email">Email</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Referral">Referral</option>
                                </select>
                            </div>
                            <button type="submit" style={styles.submitBtn}>
                                Request Price List →
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const gold = "#ffaa17";       // matches navbar/footer gold exactly
const dark = "#222429";       // matches navbar bg exactly
const darkMid = "#2a2d33";    // slightly lighter for form left panel
const light = "#f8f6f1";
const white = "#ffffff";
const text = "#2c2c2c";
const muted = "#6b7280";
const border = "#e5e0d8";

const styles = {
    page: {
        fontFamily: "'Georgia', 'Times New Roman', serif",
        backgroundColor: light,
        color: text,
        overflowX: "hidden",
    },

    // Hero
    hero: {
        position: "relative",
        minHeight: "92vh",
        background: dark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "160px 40px 100px",
        overflow: "hidden",
    },
    heroGlow: {
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 60%, rgba(255,170,23,0.1) 0%, transparent 65%)`,
        pointerEvents: "none",
    },
    heroContent: {
        position: "relative",
        zIndex: 1,
        maxWidth: "680px",
    },
    heroEyebrow: {
        fontSize: "11px",
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: gold,
        fontFamily: "'Arial', sans-serif",
        fontWeight: "600",
        marginBottom: "28px",
    },
    heroTitle: {
        fontSize: "clamp(52px, 7vw, 88px)",
        fontWeight: "400",
        color: white,
        lineHeight: "1.05",
        marginBottom: "24px",
        letterSpacing: "-1px",
    },
    heroRule: {
        width: "60px",
        height: "2px",
        backgroundColor: gold,
        margin: "0 auto 28px",
    },
    heroSub: {
        fontSize: "17px",
        color: "rgba(255,255,255,0.65)",
        lineHeight: "1.8",
        marginBottom: "48px",
        fontFamily: "'Arial', sans-serif",
        fontWeight: "300",
    },
    heroCta: {
        display: "inline-block",
        padding: "16px 48px",
        backgroundColor: gold,
        color: dark,
        textDecoration: "none",
        fontSize: "12px",
        letterSpacing: "2px",
        textTransform: "uppercase",
        fontFamily: "'Arial', sans-serif",
        fontWeight: "700",
    },

    // Services
    servicesSection: {
        padding: "100px 60px",
        maxWidth: "1200px",
        margin: "0 auto",
        textAlign: "center",
    },
    eyebrow: {
        fontSize: "10px",
        letterSpacing: "4px",
        textTransform: "uppercase",
        color: gold,
        fontFamily: "'Arial', sans-serif",
        fontWeight: "600",
        marginBottom: "16px",
    },
    eyebrowLight: {
        fontSize: "10px",
        letterSpacing: "4px",
        textTransform: "uppercase",
        color: gold,
        fontFamily: "'Arial', sans-serif",
        fontWeight: "600",
        marginBottom: "16px",
    },
    sectionTitle: {
        fontSize: "clamp(30px, 4vw, 48px)",
        fontWeight: "400",
        color: dark,
        marginBottom: "16px",
        letterSpacing: "-0.5px",
    },
    sectionSub: {
        fontSize: "15px",
        color: muted,
        marginBottom: "64px",
        fontFamily: "'Arial', sans-serif",
        maxWidth: "520px",
        margin: "0 auto 64px",
        lineHeight: "1.7",
    },
    servicesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2px",
        backgroundColor: border,
    },
    serviceCard: {
        backgroundColor: white,
        padding: "44px 36px",
        textAlign: "left",
    },
    serviceIcon: {
        fontSize: "22px",
        marginBottom: "18px",
        display: "block",
        color: gold,
    },
    serviceName: {
        fontSize: "19px",
        fontWeight: "400",
        color: dark,
        marginBottom: "6px",
    },
    serviceTagline: {
        fontSize: "10px",
        color: gold,
        fontFamily: "'Arial', sans-serif",
        fontWeight: "700",
        letterSpacing: "1px",
        marginBottom: "12px",
        textTransform: "uppercase",
    },
    serviceDetail: {
        fontSize: "13px",
        color: muted,
        fontFamily: "'Arial', sans-serif",
        lineHeight: "1.7",
        margin: 0,
    },

    // Value bar — matches navbar exactly
    valueSection: {
        backgroundColor: dark,
        padding: "72px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        borderTop: `3px solid ${gold}`,
    },
    valueProp: {
        display: "flex",
        alignItems: "flex-start",
        gap: "20px",
        padding: "32px 52px",
        flex: "1",
        minWidth: "240px",
        maxWidth: "340px",
    },
    valueDivider: {
        width: "1px",
        height: "70px",
        backgroundColor: "rgba(255,170,23,0.25)",
        alignSelf: "center",
    },
    valueNum: {
        fontSize: "32px",
        color: "rgba(255,170,23,0.25)",
        fontWeight: "400",
        lineHeight: "1",
        minWidth: "44px",
        paddingTop: "4px",
    },
    valueTitle: {
        fontSize: "15px",
        color: white,
        fontWeight: "400",
        marginBottom: "8px",
        letterSpacing: "0.3px",
    },
    valueText: {
        fontSize: "13px",
        color: "rgba(255,255,255,0.5)",
        fontFamily: "'Arial', sans-serif",
        lineHeight: "1.7",
        margin: 0,
    },

    // Form
    formSection: {
        display: "flex",
        minHeight: "90vh",
        flexWrap: "wrap",
    },
    formLeft: {
        flex: "1",
        minWidth: "300px",
        backgroundColor: darkMid,
        padding: "100px 60px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    formTitle: {
        fontSize: "clamp(34px, 4vw, 50px)",
        fontWeight: "400",
        color: white,
        lineHeight: "1.1",
        marginBottom: "24px",
        letterSpacing: "-0.5px",
    },
    formIntro: {
        fontSize: "14px",
        color: "rgba(255,255,255,0.6)",
        fontFamily: "'Arial', sans-serif",
        lineHeight: "1.9",
        marginBottom: "44px",
        maxWidth: "380px",
    },
    contactLine: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        color: "rgba(255,255,255,0.65)",
        fontFamily: "'Arial', sans-serif",
        fontSize: "13px",
        marginBottom: "14px",
    },
    contactIcon: {
        color: gold,
        fontSize: "14px",
        width: "18px",
    },
    formRight: {
        flex: "1.3",
        minWidth: "340px",
        backgroundColor: white,
        padding: "80px 60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    form: {
        width: "100%",
        maxWidth: "520px",
    },
    formRow: {
        display: "flex",
        gap: "20px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        marginBottom: "22px",
        flex: "1",
    },
    label: {
        fontSize: "10px",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        color: muted,
        fontFamily: "'Arial', sans-serif",
        fontWeight: "700",
        marginBottom: "7px",
    },
    input: {
        border: `1px solid ${border}`,
        borderRadius: "0",
        padding: "13px 14px",
        fontSize: "14px",
        fontFamily: "'Arial', sans-serif",
        color: text,
        backgroundColor: "#fafaf8",
        outline: "none",
    },
    select: {
        border: `1px solid ${border}`,
        borderRadius: "0",
        padding: "13px 14px",
        fontSize: "14px",
        fontFamily: "'Arial', sans-serif",
        color: text,
        backgroundColor: "#fafaf8",
        outline: "none",
        appearance: "none",
        cursor: "pointer",
    },
    submitBtn: {
        width: "100%",
        padding: "17px",
        backgroundColor: dark,
        color: white,
        border: `2px solid ${dark}`,
        fontSize: "11px",
        letterSpacing: "2px",
        textTransform: "uppercase",
        fontFamily: "'Arial', sans-serif",
        fontWeight: "700",
        cursor: "pointer",
        marginTop: "8px",
        transition: "all 0.2s ease",
    },

    // Success
    successBox: {
        textAlign: "center",
        padding: "60px 40px",
        maxWidth: "380px",
    },
    successIcon: {
        width: "68px",
        height: "68px",
        borderRadius: "50%",
        backgroundColor: dark,
        color: gold,
        fontSize: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 28px",
    },
    successTitle: {
        fontSize: "26px",
        fontWeight: "400",
        color: dark,
        marginBottom: "14px",
    },
    successText: {
        fontSize: "14px",
        color: muted,
        fontFamily: "'Arial', sans-serif",
        lineHeight: "1.7",
    },
};