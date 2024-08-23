import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Signup } from "../pages/Signup";
import CaseyWork from "../../img/CaseyWork.jpg"
import bgbg from "../../img/bgbg.png"
import bgbgprice from "../../img/bg-price.png"
import Intro from "../../img/footer-flip.jpg"




export const PricingInfo = props => {
    const [loggedIn, setLoggedIn] = useState(props.logState);
    const [id, setId] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [practiceName, setPracticeName] = useState("");
    const [officeNumber, setOfficeNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [password, setPassword] = useState("");
    const [findUs, setFindUs] = useState("")
    const [position, setPosition] = useState("")


    const url = process.env.BACKEND_URL
    let user;

    // useEffect(()=>{
    //     if (sessionStorage.getItem("id") === true) {           
    //         <Navigate to= {`/account/${sessionStorage.getItem("id")}`}> </Navigate>
            
    //     }
        
    // });

    function sentToSlack(){

        let message = {
            "msg": `Pricing info requested! Email: ${email}, Name: ${firstName} ${lastName}, Practice: ${practiceName}, Office: ${officeNumber}, Mobile: ${mobileNumber}, Position: ${position}, Found Us:${findUs}`,
        }

        const options = {
            method:"POST",
            withCredntials: true,
            credentials: 'include',
            
            headers:{
                "Content-Type": "application/json",
                
            },
            body: JSON.stringify(message)
            
            
        }
        fetch(`${url}/slack`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{
                    console.log(data)
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
            
        });
        
       

    }

    function submitHandler(e){
        e.preventDefault();
        user = {
            firstName,
            lastName,
            email,
            practiceName,
            officeNumber,
            mobileNumber,
            findUs,
            position
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
        fetch(`${url}/pricing`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{
                   alert(data.message)
                });
                
            } else {
                return res.json()
                .then((body)=>{
                    
                    alert("Error: Please contact KPD");
                });
            }
            
        })
        .then(()=>{window.location.href = "/"})
        .catch((err)=> {
            console.log(err);
            
        });

        sentToSlack()

    }


    return(
        <div className="">
            
            <div style={{paddingTop: "200px", textAlign: "center", justifyContent: "center", backgroundImage: `url(${Intro})`,  backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
            <h2 style={{color: "white"}}>Request Price List</h2> 
            <div className="row" style={{padding: "80px"}}>
            <div className="col-6">
                {/* <img src={CaseyWork}></img> */}
               <img src={bgbg}></img>
            </div>
            <div className="form container form col-6" onSubmit={submitHandler} style={{border: "white 2px solid", borderRadius: "5px", backgroundImage: `url(${bgbgprice})`}}>
            <div style ={{width: "300px", margin: "auto"}}> 
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
                        <label htmlFor="practiceName" className="form-label mt-4 " style={{textAlign: "center", color:"white"}} >Practice Name</label>
                        <input type="text" required className="form-control" id="practiceName" placeholder="Practice Name" value={practiceName} onChange={(e)=>setPracticeName(e.target.value)} />
                </div>
                
                <div className="form-group mx-3">
                    <label htmlFor="officeNumber" className="form-label mt-4 " style={{color: "white"}}>Office Number</label>
                    <input  type="text" className="form-control" id="officeNumber" aria-describedby="phoneHelp" placeholder="Enter office number" value={officeNumber} onChange={(e)=>setOfficeNumber(e.target.value)}/>
                    {/* <small id="phoneHelp" className="form-text text-muted">abc@abc.com.</small> */}
                </div>
                <div className="form-group mx-3">
                    <label htmlFor="mobileNumber" className="form-label mt-4 " style={{color: "white"}}>Mobile Number</label>
                    <input  type="text" className="form-control" id="mobileNumber" aria-describedby="phoneHelp" placeholder="Enter mobile number" value={mobileNumber} onChange={(e)=>setMobileNumber(e.target.value)}/>
                    {/* <small id="phoneHelp" className="form-text text-muted">abc@abc.com.</small> */}
                </div>

                <div className="form-group mx-3">
                    
                        <label  htmlFor="findUs"><h5>Professional Position?</h5></label>
                        <select className="form-select" id="position"  style={{minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="" onChange={(e)=>{setPosition(e.target.value)}}>
                            <option value="Select One">Select One</option>
                            <option value="Dentist" onClick={()=>setPosition("Dentist")}>Dentist</option>
                            <option value="Dental Office Manager" onClick={()=>setPosition("Dental Office Manager")}>Dental Office Manager</option>
                            <option value="Dental Assistant" onClick={()=>setPosition("Dental Assistant")}>Dental Assistant</option>
                            <option value="Dental Office Team Member" onClick={()=>setPosition("Dental Office Team Member")}>Dental Office Team Member</option>

                        
                        </select>
                </div>


                <div className="form-group mx-3">
                    
                        <label  htmlFor="findUs"><h5>How did you hear about us?</h5></label>
                        <select className="form-select" id="findUs"  style={{minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="" onChange={(e)=>{setFindUs(e.target.value)}}>
                            <option value="Select One">Select One</option>
                            <option value="Google" onClick={()=>setFindUs("Google")}>Google</option>
                            <option value="Mailer" onClick={()=>setFindUs("Mailer")}>Mailer/Flyer</option>
                            <option value="Email" onClick={()=>setFindUs("Email")}>Email</option>
                            <option value="Facebook" onClick={()=>setFindUs("Facebook")}>Facebook</option>
                            <option value="Instagram" onClick={()=>setFindUs("Instagram")}>Instagram</option>
                            <option value="LinkedIn" onClick={()=>setFindUs("LinkedIn")}>LinkedIn</option>
                            <option value="Referral" onClick={()=>setFindUs("Referral")}>Referral</option>
                        
                        </select>
                    </div>

                

                <div className="form-group mx-auto w-100 text-center" >
                        <button className="btn btn-primary mb-4 mx-auto" type="button" value="Submit" onClick={submitHandler}>Submit
                        </button>
                    </div>
                
            </div>
            </div>
            </div>
            </div>
            
           
        
        </div>
    )
}