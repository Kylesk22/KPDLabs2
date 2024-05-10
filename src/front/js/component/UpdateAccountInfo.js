import React, { useContext, useState, useEffect } from "react";
import SelectUSState from 'react-select-us-states'

import { Link, Navigate } from "react-router-dom";
import Crowns from "../../img/pexels-cottonbro-studio-6502306.jpg"
import { Context } from "../store/appContext";


export const UpdateAccountInfo = props => {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [password, setPassword] = useState("")
    const [backendAdd, setBackendAdd] = useState(props.address.split(","))
    const [streetAddress, setStreetAddress] = useState(backendAdd[0])
    const [city, setCity] = useState(backendAdd[1])
    const [stateSelect, setStateSelect] = useState(backendAdd[2])
    const [zip, setZip] = useState(backendAdd[3])
    const [email, setEmail] = useState("")
    const [loggedIn, setLoggedIn] = useState(props.logState)
    const [ID, setID] = useState("")
    const [editStreet, setEditStreet] = useState(false)
    const [editCity, setEditCity] = useState(false)
    const [editState, setEditState] = useState(false)
    const [editZip, setEditZip] = useState(false)
    let id = sessionStorage.getItem("id");
    

    function getCookie(name) {
        const cookies = document.cookie.split('; ');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split('=');
            if (cookieName === name) {
                return cookieValue;
            }
        }
        return null; // Return null if cookie not found
    }

    const url = process.env.BACKEND_URL
    let newUser;

    function submitHandler(e){
       
        
        
        e.preventDefault();
        newUser = {
            "address": `${streetAddress} ${city}, ${stateSelect}, ${zip}`,
        }
        const options = {
            method:"PUT",
            credentials: 'include',
            headers:{
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },
            body: JSON.stringify(newUser)
        }
        fetch(`${url}/${id}/updateAccount`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{
                    alert(data.message)
                })}
            
            })
       
        .catch((err)=> {
            console.log(err);
            alert("Error updating address")
    })
    }
     useEffect(()=>{
        console.log(props.address)
        console.log(backendAdd)
    })
    
    return(
        <div className="row">
            
            <div className="lg-col-4 sm-col-8 text-center" >
            
                <form className="form container lg-col-4 update-box"  style={{borderRadius: "5%", maxWidth: "600px"}} onSubmit={submitHandler}>
                <div className="form-group mx-3">
                        <label htmlFor="streetAddress" className="form-label mt-4 " style={{textAlign: "center", color:"black"}} >Street Address</label>
                        <input className="form-control" id="streetAddress" readOnly type="text" style={{borderRadius: "1rem", minHeight:"40px"}}  value={streetAddress} ></input>
                        <button className="btn btn-primary mb-4 mx-auto" onClick={()=>setEditStreet(true)}>Edit</button>
                        {(editStreet)?
                            <input style={{backgroundColor: "white", border: "black 1px solid"}} type="text" required className="form-control" id="streetAddress" placeholder="StreetAddress" value={streetAddress} onChange={(e)=>setStreetAddress(e.target.value)} />
                        :""}
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="city" className="form-label mt-4 " style={{textAlign: "center", color:"black"}}>City</label>
                        <input className="form-control" id="city" readOnly type="text" style={{borderRadius: "1rem", minHeight:"40px"}}  value={city} ></input>
                        <button className="btn btn-primary mb-4 mx-auto" onClick={()=>setEditCity(true)}>Edit</button>
                        {(editCity)?
                            <input type="text" style={{backgroundColor: "white", border: "black 1px solid"}} required className="form-control" id="city" placeholder="City" value={city} onChange={(e)=>setCity(e.target.value)}/>
                        :""}
                        
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="stateSelect" className="form-label mt-4" style={{color:"black"}}>State</label>
                        <br></br>
                        <input className="form-control" id="state" readOnly type="text" style={{borderRadius: "1rem", minHeight:"40px"}}  value={stateSelect} ></input>
                        <button className="btn btn-primary mb-4 mx-auto" onClick={()=>setEditState(true)}>Edit</button>
                        {(editState)?
                            <SelectUSState id="stateSelect"  required className="form-control states" onChange={(e)=>{setStateSelect(e)}} value={stateSelect}>
                            </SelectUSState>
                        :""}
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="zip" className="form-label mt-4 " style={{textAlign: "center", color:"black"}}>Zip Code</label>
                        <input className="form-control" id="city" readOnly type="text" style={{borderRadius: "1rem", minHeight:"40px"}}  value={zip} ></input>
                        <button className="btn btn-primary mb-4 mx-auto" onClick={()=>editZip(true)}>Edit</button>
                        {(editZip)?
                            <input type="text" style={{backgroundColor: "white", border: "black 1px solid"}} required className="form-control" id="zip" placeholder="Zip Code" value={zip} onChange={(e)=>setZip(e.target.value)}/>
                        :""}
                        </div>
                    <div className="form-group mx-auto w-100 text-center mt-4" >
                        <button className="btn btn-primary mb-4 mx-auto" type="submit" value="Submit">Submit
                        </button>
                    </div> 
                </form>
            </div>

            
        </div>
    )}