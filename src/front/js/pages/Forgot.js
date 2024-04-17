import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Signup } from "../pages/Signup";

import Intro from "../../img/footer-flip.jpg"


import axios from 'axios';

export const Forgot = props => {
    const [email, setEmail] = useState("")
    const [showCode, setShowCode] = useState(false)
    const [code, setCode] = useState("")
    const [security1, setSecurity1] = useState("")
    const [security2, setSecurity2] = useState("")
    const [securityAnswer1, setSecurityAnswer1] = useState("")
    const [securityAnswer2, setSecurityAnswer2] = useState("")
    const [newPW, setNewPW] = useState("")
    const [showNewPW, setShowNewPW] = useState(false)

    const url = process.env.BACKEND_URL
    let user;

    function generateVerificationCode(length) {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let vCode = '';
        for (let i = 0; i < length; i++) {
            vCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return vCode;
    }


    async function sendEmail(userEmail, verificationCode) {
        const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
        const MAILGUN_DOMAIN = 'help.kpdlabs.com';
        const MAILGUN_API_URL = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;
    
        const formData = new FormData();
        formData.append('from', 'kpdlabs@kpdlabs.com');
        formData.append('to', userEmail);
        formData.append('subject', 'Password Reset Verification Code');
        formData.append('text', `Your verification code is: ${verificationCode}`);

        try {
            const response = await fetch(MAILGUN_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`
                },
                body: formData
            });
            const responseData = await response.json();
            console.log('Email sent: ', responseData);
        } catch (error) {
            console.error('Error sending email: ', error);
    }
    }
    

    const verifyAnswers = () => {
        user = {
            email,
            securityAnswer1,
            securityAnswer2
        }
        const options = {
            method:"POST",

            
            headers:{
                "Content-Type": "application/json",
                
            },
            body: JSON.stringify(user)
        }
        fetch(`${url}/validateanswers`, options)
        .then((res)=> {
            if (res.ok) {
                
                // USE THIS FOR EMAIL VERIFICATION

                // let genCode = generateVerificationCode(6)
                
                // sendEmail(email, genCode)

                return res.json()
                .then((body)=>{
                    setShowCode(true)
                    console.log(body)
                    
                    if (body.message === "Success"){
                        setShowNewPW(true)
                        alert(body.message)
                    }
                    else 
                    alert(body.message)
                    
                })
                
            } else {
                return res.json()
                .then((body)=>{
                    
                    alert(body.message);
                    
                });
            }
        })
        .catch((err)=> {
            console.log(err);
            alert("Error has occured please check email is correct and try again"); // Or display a more user-friendly message
            setShowCode(false)
        });
    }

    


    const verificationCode = () => {
        user = {
            email,
        }
        const options = {
            method:"POST",

            
            headers:{
                "Content-Type": "application/json",
                
            },
            body: JSON.stringify(user)
        }
        fetch(`${url}/forgotPassword`, options)
        .then((res)=> {
            if (res.ok) {
                
                // USE THIS FOR EMAIL VERIFICATION

                // let genCode = generateVerificationCode(6)
                
                // sendEmail(email, genCode)

                return res.json()
                .then((body)=>{
                    setShowCode(true)
                    console.log(body)
                    
                    if (body[0].message === "Email found!"){
                        setShowCode(true)
                        setSecurity1(body[1].data["security_question_1"])
                        setSecurity2(body[1].data["security_question_2"])
                    }
                    else setShowCode(false)
                    alert(body[0].message)
                    
                })
                
            } else {
                return res.json()
                .then((body)=>{
                    console.log(body)
                    alert(body[0].message);
                    setShowCode(false)
                });
            }
        })
        .catch((err)=> {
            console.log(err);
            alert("Error has occured please check email is correct and try again"); // Or display a more user-friendly message
            setShowCode(false)
        });
    }

    const submitNewPW = () =>{
        user = {
            email,
            newPW
        }
        const options = {
            method:"PUT",

            
            headers:{
                "Content-Type": "application/json",
                
            },
            body: JSON.stringify(user)
        }
        fetch(`${url}/updatePassword`, options)
        .then((res)=> {
            if (res.ok) {
                
                // USE THIS FOR EMAIL VERIFICATION

                // let genCode = generateVerificationCode(6)
                
                // sendEmail(email, genCode)

                return res.json()
                .then((body)=>{
                    let id = body.id;
                    console.log(body.id);
                    window.location.href = "/login";
                    
                })
                
            } else {
                return res.json()
                .then((body)=>{
                    console.log(body)
                    alert(body[0].message);
                    setShowCode(false)
                });
            }
        })
        .catch((err)=> {
            console.log(err);
            alert("Error has occured please check email is correct and try again"); // Or display a more user-friendly message
            setShowCode(false)
        });

    }


    return(
        <div style={{paddingTop: "200px", paddingBottom: "500px", textAlign: "center", backgroundImage: `url(${Intro})`}}>
            <h2 style={{color: "white"}}>Password Recovery</h2>
             <div className="form container form container-fluid"  style={{width: "400px"}}>
                <div className="form-group">
                <label htmlFor="userEmail" className="form-label mt-4 " style={{color: "white"}}>Email address</label>
                        <input  type="email" className="form-control" id="userEmail" aria-describedby="emailHelp" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                        <small id="emailHelp" className="form-text text-muted">abc@abc.com.</small>
                </div>
                {/* <div className="form-group">
                   <button className="btn btn-primary">Send Verification Code</button>
                </div> */}
                {/* <Link to="/signup">
                    <button className="btn btn-primary">Signup</button>
                </Link>  */}
                <div className="form-group mx-auto w-100 text-center" >
                        {/* this button is for email verification code*/}
                        <button className="btn btn-primary mb-4 mx-auto" type="button" value="Submit" onClick={()=>{verificationCode()}}>Submit Email
                        </button> 
                </div>
                    <div className= "form-group">
                        {(showCode)?
                        <div>
                            <label className="form-label mt-4" htmlFor="security1" style={{color: "white"}}>{security1}</label>
                            <input className="form-control" type="text" id="security1" placeholder="Enter Answer" value={securityAnswer1} onChange={(e)=>setSecurityAnswer1(e.target.value)}></input>
                            
                            <br></br>
                            <label className="form-label mt-4" htmlFor="security2" style={{color: "white"}}>{security2}</label>
                            <input className="form-control" id = "security2" placeholder= "Enter Answer" value={securityAnswer2} onChange={(e)=>setSecurityAnswer2(e.target.value)}></input>
                            <br></br>
                            <button className="btn btn-primary mb-4 mx-auto" onClick={()=>{verifyAnswers()}}>Verify Answers</button>

                            <br></br>
                            
                            {(showNewPW)?
                            <div>
                                <label className="form-label mt-4" htmlFor="newpw" style={{color: "white"}}>Enter New Password</label>
                                <input type = "password" className="form-control" id = "newpw"  value={newPW} onChange={(e)=>setNewPW(e.target.value)}></input>
                                <br></br>
                                <button className="btn btn-primary mb-4 mx-auto" onClick={()=>{submitNewPW()}}>Submit</button>
                                </div>
                            :""}
                            
                        </div>
                        
                    :""}
                    </div>
                
            </div>

        </div>


    )}

    // "security_question_1": "What is the name of your first pet?",
    //         "security_question_2": "What is the city or town where you were born?"