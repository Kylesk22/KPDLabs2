import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Signup } from "../pages/Signup";

import Intro from "../../img/footer-flip.jpg"




export const Forgot = props => {
    const verificationCode = () => {
        user = {
            email,
        }
        const options = {
            method:"GET",

            
            headers:{
                "Content-Type": "application/json",
                
            },
            body: JSON.stringify(user)
        }
        fetch(`${url}/forgotPassword`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{
                    
                });
            } else {
                return res.json()
                .then((body)=>{
                    console.log(body)
                    alert(body.message);
                });
            }
        })
        .catch((err)=> {
            console.log(err);
            alert(err); // Or display a more user-friendly message
        });
    }

    }


    return(
        <div style={{paddingTop: "200px"}}>
             <div className="form container form container-fluid" onSubmit={submitHandler} style={{width: "300px"}}>
                <div className="form-group">
                <label htmlFor="userEmail" className="form-label mt-4 " style={{color: "white"}}>Email address</label>
                        <input  type="email" className="form-control" id="userEmail" aria-describedby="emailHelp" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                        <small id="emailHelp" className="form-text text-muted">abc@abc.com.</small>
                </div>
                <div className="form-group">
                   <button className="btn btn-primary">Send Verification Code</button>
                </div>
                {/* <Link to="/signup">
                    <button className="btn btn-primary">Signup</button>
                </Link>  */}
                <div className="form-group mx-auto w-100 text-center" >
                        <button className="btn btn-primary mb-4 mx-auto" type="button" value="Submit" onClick={submitHandler}>Submit
                        </button>
                    </div>
                
            </div>

        </div>


    )}