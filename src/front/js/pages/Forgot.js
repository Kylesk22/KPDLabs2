import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Signup } from "../pages/Signup";

import Intro from "../../img/footer-flip.jpg"


import axios from 'axios';

export const Forgot = props => {
    const [email, setEmail] = useState("")
    const [showCode, setShowCode] = useState(false)
    const [code, setCode] = useState("")

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
        const SENDGRID_API_KEY = 'YOUR_SENDGRID_API_KEY';
        const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
    
        const data = {
            personalizations: [
                {
                    to: [{ email: userEmail }],
                    subject: 'Password Reset Verification Code'
                }
            ],
            from: { email: 'kpdlabs@kpdlabs.com' },
            content: [
                {
                    type: 'text/plain',
                    value: `Your verification code is: ${verificationCode}`
                }
            ]
        };
    
        try {
            const response = await axios.post(SENDGRID_API_URL, data, {
                headers: {
                    Authorization: `Bearer ${SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Email sent: ', response.data);
        } catch (error) {
            console.error('Error sending email: ', error);
        }
    }

    const validateCode = () => {

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
                
                let genCode = generateVerificationCode(6)
                
                sendEmail(email, genCode)

                return res.json()
                .then((body)=>{
                    alert(body.message)
                })
                
            } else {
                return res.json()
                .then((body)=>{
                    console.log(body)
                    alert(body.message);
                    setShowCode(false)
                });
            }
        })
        .catch((err)=> {
            console.log(err);
            alert(err); // Or display a more user-friendly message
        });
    }

    


    return(
        <div style={{paddingTop: "200px", paddingBottom: "500px"}}>
             <div className="form container form container-fluid"  style={{width: "300px"}}>
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
                        <button className="btn btn-primary mb-4 mx-auto" type="button" value="Submit" onClick={()=>{verificationCode(); setShowCode(true)}}>Get Verfication Code
                        </button>
                    </div>
                    <div>
                        {(showCode)?
                        <div>
                        <input placeholder="Enter Verfication Code Here" value={code} onClick={(e)=>{setCode(e.target.value)}}></input>
                        <button onClick={()=>{validateCode()}}></button>
                        </div>
                    :""}
                    </div>
                
            </div>

        </div>


    )}