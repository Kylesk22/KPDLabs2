import React, { useContext, useState } from "react";
import SelectUSState from 'react-select-us-states'

import { Link, Navigate } from "react-router-dom";
import Crowns from "../../img/pexels-cottonbro-studio-6502306.jpg"
import { Context } from "../store/appContext";


export const Signup = props => {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [password, setPassword] = useState("")
    const [streetAddress, setStreetAddress] = useState("")
    const [city, setCity] = useState("")
    const [stateSelect, setStateSelect] = useState("AL")
    const [email, setEmail] = useState("")
    const [loggedIn, setLoggedIn] = useState(props.logState)
    const [ID, setID] = useState("")
    const { store, actions } = useContext(Context);
    

    const url = process.env.BACKEND_URL
    let newUser;

    function submitHandler(e){
        e.preventDefault();
        newUser = {
            firstName,
            lastName,
            "address": `${streetAddress} ${city}, ${stateSelect}`,
            email,
            password,
        }
        const options = {
            method:"POST",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUser)
        }
        fetch(`${url}/signup`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{

                    sessionStorage.setItem("email", email);
                    sessionStorage.setItem("firstName", data.fname);
                    sessionStorage.setItem("lastName", data.lname);
                    sessionStorage.setItem("id", data.id)
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
    

    

    return (
        <div className="row">
            <div className="col-8">
                <img src={Crowns} style={{width: "400px", marginTop: "10%", marginLeft: "20%", boxShadow: "7px 7px 7px 7px #158cba"}}/>

            </div>
            {(!loggedIn)?
            <div className="col-4 pe-5 mt-5" >

                <form className="form container bg bg-secondary" style={{borderRadius: "5%"}} onSubmit={submitHandler}>
                    <div className="form-group mx-3">
                        <label htmlFor="firstName" className="form-label mt-4" style={{textAlign: "center"}} >First Name</label>
                        <input type="text" className="form-control" id="firstName" placeholder="First Name" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="lastName" className="form-label mt-4 " style={{textAlign: "center"}} >Last Name</label>
                        <input type="text" className="form-control" id="lastName" placeholder="Last Name" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="streetAddress" className="form-label mt-4 " style={{textAlign: "center"}} >Street Address</label>
                        <input type="text" className="form-control" id="streetAddress" placeholder="StreetAddress" value={streetAddress} onChange={(e)=>setStreetAddress(e.target.value)} />
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="city" className="form-label mt-4 " style={{textAlign: "center"}}>City</label>
                        <input type="text" className="form-control" id="city" placeholder="City" value={city} onChange={(e)=>setCity(e.target.value)}/>
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="stateSelect" className="form-label mt-4">State</label>
                        <br></br>
                        <SelectUSState id="stateSelect" className="form-control" onChange={(e)=>{setStateSelect(e)}} value={stateSelect}>
                        </SelectUSState>
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="userEmail" className="form-label mt-4 ">Email address</label>
                        <input  type="email" className="form-control" id="userEmail" aria-describedby="emailHelp" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                        <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="userPassword" className="form-label mt-4">Password</label>
                        <input type="password" className="form-control" id="userPasswrod" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}/> 
                    </div>
                    <br/>
                    <div className="form-group mx-auto w-100 text-center" >
                        <button className="btn btn-primary mb-4 mx-auto" type="submit" value="Submit">
                        </button>
                    </div>
                </form>
            </div>: 
            <Navigate to= {`/account/${sessionStorage.getItem("id")}`}> </Navigate>
            }
        </div>
    )
}