import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Signup } from "../pages/Signup";

import Intro from "../../img/footer-flip.jpg"




export const Login = props => {
    const [loggedIn, setLoggedIn] = useState(props.logState);
    const [id, setId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);


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
            {(!loggedIn)? 
            <div style={{paddingTop: "200px", textAlign: "center", justifyContent: "center", backgroundImage: `url(${Intro})`}}>
            <h2 style={{color: "white"}}>Login</h2> 
            <div className="form container form container-fluid" onSubmit={submitHandler} style={{width: "300px"}}>
                <div className="form-group">
                <label htmlFor="userEmail" className="form-label mt-4 " style={{color: "white"}}>Email address</label>
                        <input  type="email" className="form-control" id="userEmail" aria-describedby="emailHelp" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                        <small id="emailHelp" className="form-text text-muted">abc@abc.com.</small>
                </div>

                <div className="form-group">
                    <label htmlFor="userPassword" className="form-label mt-4" style={{color: "white"}}>Password</label>
                     <div className="input-group">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    className="form-control" 
                                    id="userPassword" 
                                    placeholder="Password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                                <div className="input-group-append">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary" 
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                    <Link to="/forgot">
                        <span style={{color: "white"}}>Forgot Password?</span>
                        
                    </Link>
                </div>
                {/* <Link to="/signup">
                    <button className="btn btn-primary">Signup</button>
                </Link>  */}
                <br></br>
                <div className="form-group mx-auto w-100 text-center" >
                        <button className="btn btn-primary mb-4 mx-auto" type="button" value="Submit" onClick={submitHandler}>Submit
                        </button>
                    </div>
                
            </div>
            </div>
            
            : <Navigate to= {`/account/${sessionStorage.getItem("id")}`}> </Navigate>}
        
        </div>
    )
}