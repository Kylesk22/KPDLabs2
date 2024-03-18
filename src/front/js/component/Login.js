import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Signup } from "../pages/Signup";




export const Login = props => {
    const [loggedIn, setLoggedIn] = useState(props.logState);
    const [id, setId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const url = process.env.DATABASE_URL
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

                    sessionStorage.setItem("id", data.user.id)
                    setId(data.user.id)
                    setLoggedIn(true);
                    props.updateLogState(true)
                    
                })}
            return(res.json())
            .then((body)=>{alert(body.message)})
            
            })
       
        .catch((err)=> {
            console.log(err);
    })
    }


    return(
        <>
            {(!loggedIn)? 
            <div>
            <h1>Login</h1>
            <div className="form container form container-fluid" onSubmit={submitHandler} >
                <div className="form-group">
                <label htmlFor="userEmail" className="form-label mt-4 ">Email address</label>
                        <input  type="email" className="form-control" id="userEmail" aria-describedby="emailHelp" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                        <small id="emailHelp" className="form-text text-muted">abc@abc.com.</small>
                </div>
                <div className="form-group">
                    <label htmlFor="userPassword" className="form-label mt-4">Password</label>
                    <input type="password" className="form-control" id="userPasswrod" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}/> 
                    <Link to="/">
                        Forgot Password?
                    </Link>
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
            
            : <Navigate to= {`/account/${sessionStorage.getItem("id")}`}> </Navigate>}
        
        </>
    )
}