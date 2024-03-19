import React, { useContext, useState, useEffect } from "react";
import SelectUSState from 'react-select-us-states'

import { Link, Navigate } from "react-router-dom";
import Crowns from "../../img/pexels-cottonbro-studio-6502306.jpg"
import { Context } from "../store/appContext";


export const UpdateAccountInfo = props => {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [password, setPassword] = useState("")
    const [streetAddress, setStreetAddress] = useState("")
    const [city, setCity] = useState("")
    const [stateSelect, setStateSelect] = useState("AL")
    const [email, setEmail] = useState("")
    const [loggedIn, setLoggedIn] = useState(props.logState)
    const [ID, setID] = useState("")
    
    
    return(
        <div className="row">
            
            <div className="lg-col-4 sm-col-8 text-center" >
            
                <form className="form container lg-col-4"  style={{borderRadius: "5%", maxWidth: "600px"}} >
                    {/* <div className="form-group mx-3">
                        <label htmlFor="firstName" className="form-label mt-4" style={{textAlign: "center"}} >First Name</label>
                        <input type="text" className="form-control" readOnly id="firstName" placeholder="First Name" value={firstName}  />
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="lastName" className="form-label mt-4 " style={{textAlign: "center"}} >Last Name</label>
                        <input type="text" className="form-control" readOnly id="lastName" placeholder="Last Name" value={lastName}  />
                    </div> */}
                    <div className="form-group mx-3">
                        <label htmlFor="streetAddress" className="form-label mt-4 " style={{textAlign: "center"}} >Street Address</label>
                        <input type="text" className="form-control" readOnly id="streetAddress" placeholder="StreetAddress" value={streetAddress}  />
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="city" className="form-label mt-4 " style={{textAlign: "center"}}>City</label>
                        <input type="text" className="form-control" readOnly id="city" placeholder="City" value={city} />
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="stateSelect" className="form-label mt-4">State</label>
                        <br></br>
                        <SelectUSState id="stateSelect" readOnly className="form-control"  value={stateSelect}>
                        </SelectUSState>
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="userEmail" className="form-label mt-4 ">Email address</label>
                        <input  type="email" className="form-control" id="userEmail" readOnly aria-describedby="emailHelp" placeholder="Enter email" value={email} />
                        <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
                    </div>
                    {/* <div className="form-group mx-3">
                        <label htmlFor="userPassword" className="form-label mt-4">Password</label>
                        <input type="password" className="form-control" readOnly id="userPasswrod" placeholder="Password" value={password} /> 
                    </div> */}
                    <br/>
                    {/* <div className="form-group mx-auto w-100 text-center" >
                        <button className="btn btn-primary mb-4 mx-auto" type="submit" value="Submit">Submit
                        </button>
                    </div> */}
                </form>
            </div>

            
        </div>
    )}