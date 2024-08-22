import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Signup } from "../pages/Signup";

import Intro from "../../img/footer-flip.jpg"




export const PricingInfo = props => {
    const [loggedIn, setLoggedIn] = useState(props.logState);
    const [id, setId] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [findUs, setFindUs] = useState("")


    const url = process.env.BACKEND_URL
    let user;

    // useEffect(()=>{
    //     if (sessionStorage.getItem("id") === true) {           
    //         <Navigate to= {`/account/${sessionStorage.getItem("id")}`}> </Navigate>
            
    //     }
        
    // });

    function submitHandler(e){
        e.preventDefault();
        user = {
            email,
            password,
        }
        const options = {
            method:"POST",
            withCredntials: true,
            credentials: 'include',
            
            headers:{
                "Content-Type": "application/json",
                
            },
            body: JSON.stringify(user)
        }
        fetch(`${url}/login`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{
                    sessionStorage.setItem("id", data.id)
                    setId(data.id)
                    setLoggedIn(true);
                    props.updateLogState(true)
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


    return(
        <div className="">
            
            <div style={{paddingTop: "200px", textAlign: "center", justifyContent: "center", backgroundImage: `url(${Intro})`}}>
            <h2 style={{color: "white"}}>Request Price List</h2> 
            <div className="form container form container-fluid" onSubmit={submitHandler} style={{width: "300px"}}>
                <div className="form-group">
                <label htmlFor="userEmail" className="form-label mt-4 " style={{color: "white"}}>Email address</label>
                        <input  type="email" className="form-control" id="userEmail" aria-describedby="emailHelp" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                        <small id="emailHelp" className="form-text text-muted">abc@abc.com.</small>
                </div>
                <div className="form-group mx-3">
                        <label htmlFor="firstName" className="form-label mt-4" style={{textAlign: "center", color:"white"}} >First Name</label>
                        <input type="text" required className="form-control" id="firstName" placeholder="First Name" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
                </div>
                <div className="form-group mx-3">
                        <label htmlFor="lastName" className="form-label mt-4 " style={{textAlign: "center", color:"white"}} >Last Name</label>
                        <input type="text" required className="form-control" id="lastName" placeholder="Last Name" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
                </div>
                <div className="form-group mx-3">
                        <label htmlFor="lastName" className="form-label mt-4 " style={{textAlign: "center", color:"white"}} >Practice Name</label>
                        <input type="text" required className="form-control" id="lastName" placeholder="Last Name" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
                </div>
                
                <div className="form-group mx-3">
                    <label htmlFor="userPhone" className="form-label mt-4 " style={{color: "white"}}>Phone Number</label>
                    <input  type="phone" className="form-control" id="userPhone" aria-describedby="phoneHelp" placeholder="Enter phone number" value={phone} onChange={(e)=>setPhone(e.target.value)}/>
                    {/* <small id="phoneHelp" className="form-text text-muted">abc@abc.com.</small> */}
                </div>
                <div className="form-group mx-3">
                    
                        <label  htmlFor="findUs"><h5>How did you hear about us?</h5></label>
                        <select className="form-select" id="findUs"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="" onChange={(e)=>{setFindUs(e.target.value)}}>
                            <option value="Select One">Select One</option>
                            <option value="A1" onClick={()=>setFindUs("Google")}>Google</option>
                            <option value="A2" onClick={()=>setFindUs("Mailer")}>Mailer/Flyer</option>
                            <option value="A3" onClick={()=>setFindUs("Email")}>Email</option>
                            <option value="A3.5" onClick={()=>setFindUs("Facebook")}>Facebook</option>
                            <option value="A4" onClick={()=>setFindUs("Instagram")}>Instagram</option>
                            <option value="B1" onClick={()=>setFindUs("LinkedIn")}>LinkedIn</option>
                            <option value="B2" onClick={()=>setFindUs("Referral")}>Referral</option>
                        
                        </select>
                    </div>

                

                <div className="form-group mx-auto w-100 text-center" >
                        <button className="btn btn-primary mb-4 mx-auto" type="button" value="Submit" onClick={submitHandler}>Submit
                        </button>
                    </div>
                
            </div>
            </div>
            
           
        
        </div>
    )
}