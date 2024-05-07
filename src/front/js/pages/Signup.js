import React, { useContext, useState } from "react";
import SelectUSState from 'react-select-us-states'

import { Link, Navigate } from "react-router-dom";
import Crowns from "../../img/pexels-cottonbro-studio-6502306.jpg"
import { Context } from "../store/appContext";
import Intro from "../../img/footer-flip.jpg"

export const Signup = props => {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [license, setLicense] = useState("")
    const [password, setPassword] = useState("")
    const [streetAddress, setStreetAddress] = useState("")
    const [city, setCity] = useState("")
    const [zip, setZip] = useState("")
    const [stateSelect, setStateSelect] = useState("AL")
    const [email, setEmail] = useState("")
    const [loggedIn, setLoggedIn] = useState(props.logState)
    const [ID, setID] = useState("")
    const [security1, setSecurity1] = useState("")
    const [security2, setSecurity2] = useState("")
    const [security1Answer, setSecurity1Answer] = useState("")
    const [security2Answer, setSecurity2Answer] = useState("")
    const { store, actions } = useContext(Context);
    

    const url = process.env.BACKEND_URL
    let newUser;

    function submitHandler(e){
        if (security1 === "" || security2 === "")
            {alert("Please select Security Questions!")
            e.preventDefault()}
        else {
        e.preventDefault();
        newUser = {
            firstName,
            lastName,
            license,
            "address": `${streetAddress} ${city}, ${stateSelect}, ${zip}`,
            email,
            password,
            security1,
            security2,
            security1Answer,
            security2Answer
        }
        const options = {
            method:"POST",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.DIGITALOCEAN_TOKEN}`
            },
            body: JSON.stringify(newUser)
        }
        fetch(`${url}/signup`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{

                    // sessionStorage.setItem("email", email);
                    // sessionStorage.setItem("firstName", data.fname);
                    // sessionStorage.setItem("lastName", data.lname);
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
    }}
    

    

    return (
        <div className="row" style={{paddingTop: "170px", backgroundImage: `url(${Intro})`}}>

            {(!loggedIn)?
            
            
            <div className="lg-col-4 sm-col-8 text-center" >
                <h2 style={{color: "white"}}>Signup</h2>
            
                <form className="form container lg-col-4" style={{borderRadius: "5%", maxWidth: "600px"}} onSubmit={submitHandler}>
                    <div className="form-group mx-3">
                        <label htmlFor="firstName" className="form-label mt-4" style={{textAlign: "center", color:"white"}} >First Name</label>
                        <input type="text" required className="form-control" id="firstName" placeholder="First Name" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="lastName" className="form-label mt-4 " style={{textAlign: "center", color:"white"}} >Last Name</label>
                        <input type="text" required className="form-control" id="lastName" placeholder="Last Name" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="license" className="form-label mt-4 " style={{textAlign: "center", color:"white"}} >License Number</label>
                        <input type="text" required className="form-control" id="license" placeholder="License Num" value={license} onChange={(e)=>setLicense(e.target.value)} />
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="streetAddress" className="form-label mt-4 " style={{textAlign: "center", color:"white"}} >Street Address</label>
                        <input type="text" required className="form-control" id="streetAddress" placeholder="StreetAddress" value={streetAddress} onChange={(e)=>setStreetAddress(e.target.value)} />
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="city" className="form-label mt-4 " style={{textAlign: "center", color:"white"}}>City</label>
                        <input type="text" required className="form-control" id="city" placeholder="City" value={city} onChange={(e)=>setCity(e.target.value)}/>
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="stateSelect" className="form-label mt-4" style={{color:"white"}}>State</label>
                        <br></br>
                        <SelectUSState id="stateSelect" required className="form-control" onChange={(e)=>{setStateSelect(e)}} value={stateSelect}>
                        </SelectUSState>
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="zip" className="form-label mt-4 " style={{textAlign: "center", color:"white"}}>Zip Code</label>
                        <input type="text" required className="form-control" id="zip" placeholder="Zip Code" value={zip} onChange={(e)=>setZip(e.target.value)}/>
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="userEmail" className="form-label mt-4 "  style={{color:"white"}}>Email address</label>
                        <input  type="email" required className="form-control" id="userEmail" aria-describedby="emailHelp" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                        <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}>We'll never share your email with anyone else.</small>
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="userPassword" className="form-label mt-4"  style={{color:"white"}}>Password</label>
                        <input type="password" required className="form-control" id="userPasswrod" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}/> 
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="security1" className="form-label mt-4"  style={{color:"white"}}>Security Question 1</label>
                        <select required className="form-select" id="security1"  aria-label="Security" onChange={(e)=>{setSecurity1(e.target.value)}}>   
                            <option value="Please Select" >Please Select</option>
                            <option value="What is the name of your first pet?" onClick={()=>setSecurity1("What is the name of your first pet?")}>What is the name of your first pet?</option>
                            <option value="What is the city or town where you were born?" onClick={()=>setSecurity1("What is the city or town where you were born?")}>What is the city or town where you were born?</option>
                            <option value="What is the name of your favorite childhood teacher?" onClick={()=>setSecurity1("What is the name of your favorite childhood teacher?")}>What is the name of your favorite childhood teacher?</option>
                            <option value="What is the make and model of your first car?" onClick={()=>setSecurity1("What is the make and model of your first car?")}>What is the make and model of your first car?</option>
                            <option value="What is the name of the street you grew up on?" onClick={()=>setSecurity1("What is the name of the street you grew up on?")}>What is the name of the street you grew up on?</option>
                            <option value="What is your favorite book or movie?" onClick={()=>setSecurity1("What is your favorite book or movie?")}>What is your favorite book or movie?</option>
                            <option value="What is your favorite food or restaurant?" onClick={()=>setSecurity1("What is your favorite food or restaurant?")}>What is your favorite food or restaurant?</option>
                            <option value="What is the name of your maternal grandmother?" onClick={()=>setSecurity1("What is the name of your maternal grandmother?")}>What is the name of your maternal grandmother?</option>

                        </select>
                        <br></br>
                        <input required type="text" className="form-control" id="security1" placeholder="Answer" value={security1Answer} onChange={(e)=>setSecurity1Answer(e.target.value)}/>
                        <small id="passRecovery" className="form-text text-muted"  style={{color:"white"}}>Password Recovery</small> 
                    </div>
                    <div className="form-group mx-3">
                        <label htmlFor="security2" className="form-label mt-4"  style={{color:"white"}}>Security Question 2</label>
                        <select required className="form-select" id="security2" aria-label="Security" onChange={(e)=>{setSecurity2(e.target.value)}}>   
                            <option value="Please Select" >Please Select</option>
                            <option value="What is the name of your first pet?" onClick={()=>setSecurity2("What is the name of your first pet?")}>What is the name of your first pet?</option>
                            <option value="What is the city or town where you were born?" onClick={()=>setSecurity2("What is the city or town where you were born?")}>What is the city or town where you were born?</option>
                            <option value="What is the name of your favorite childhood teacher?" onClick={()=>setSecurity2("What is the name of your favorite childhood teacher?")}>What is the name of your favorite childhood teacher?</option>
                            <option value="What is the make and model of your first car?" onClick={()=>setSecurity2("What is the make and model of your first car?")}>What is the make and model of your first car?</option>
                            <option value="What is the name of the street you grew up on?" onClick={()=>setSecurity2("What is the name of the street you grew up on?")}>What is the name of the street you grew up on?</option>
                            <option value="What is your favorite book or movie?" onClick={()=>setSecurity2("What is your favorite book or movie?")}>What is your favorite book or movie?</option>
                            <option value="What is your favorite food or restaurant?" onClick={()=>setSecurity2("What is your favorite food or restaurant?")}>What is your favorite food or restaurant?</option>
                            <option value="What is the name of your maternal grandmother?" onClick={()=>setSecurity2("What is the name of your maternal grandmother?")}>What is the name of your maternal grandmother?</option>

                        </select>
                        <br></br>
                        <input required type="text" className="form-control" id="security2" placeholder="Answer" value={security2Answer} onChange={(e)=>setSecurity2Answer(e.target.value)}/> 
                        <small id="passRecovery" className="form-text text-muted"  style={{color:"white"}}>Password Recovery</small> 
                    </div>
                    <br/>

                    
                    


                    <div className="form-group mx-auto w-100 text-center" >
                        <button className="btn btn-primary mb-4 mx-auto" type="submit" value="Submit">Submit
                        </button>
                    </div> 
                </form>
                {/* <button onClick={()=>console.log(security1, security2)}>TEST</button> */}
            </div>: 
            <Navigate to= {`/account/${sessionStorage.getItem("id")}`}> </Navigate>
            }
        </div>
    )
}