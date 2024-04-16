import React, { useState, useEffect } from "react";
import { SideBar } from "../component/SideBar";
import { CreateOrder } from "../component/CreateOrder";
import { UserCases } from "../component/UserCases";
import { Link, Navigate } from "react-router-dom";
import { SingleOrder } from "../component/SingleOrder";
import { ContactUs } from "../component/ContactUs";
import { UpdateAccountInfo } from "../component/UpdateAccountInfo";




export const UserPage = props => {
    const [page, setPage] = useState("home")
    const [firstNameLower, setFirstNameLower] =useState("")
    const [firstName, setFirstName] = useState(sessionStorage.getItem("firstName"))
    const [lastName, setLastName] = useState(sessionStorage.getItem("lastName"))
    const [email, setEmail] = useState(sessionStorage.getItem("email"))
    const [loggedIn, setLoggedIn] = useState(props.logState)
    const [caseId, setCaseId] = useState("")
    const [cases, setCases] = useState([{}])
    const [singleCaseId, setSingleCaseId] = useState("")
    const [address, setAddress] = useState("")
    

    let id = sessionStorage.getItem("id");
    const url = process.env.BACKEND_URL

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
    
    
    
    useEffect(()=>{
        if (caseId === ""){
            generateCase();
            
        }
        console.log(page)

        // 
        const options1 = {
            method:"GET",
            credentials: 'include',
            headers:{
                "Content-Type": "application/json",
            },
            
            
        }
        fetch(`${url}token/refresh`, options1)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{
                    console.log(data)
                   

                    
                })}
            return(res.json())
            .then((body)=>{alert(body.message)})
            
            })
       
        .catch((err)=> {
            console.log(err);
    })

        // 
       
        
        const options = {
            method:"GET",
            credentials: 'include',
            headers:{
                "Content-Type": "application/json"
            },
            
        }
        fetch(`${url}/${id}`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{

                    setEmail(data.email)
                    setFirstName(data.fname.toUpperCase())
                    setFirstNameLower(data.fname)
                    setLastName(data.lname)
                    setLoggedIn(true);
                    setAddress(data.address)

                    
                })}
            return(res.json())
            .then((body)=>{alert(body.message)})
            
            })
       
        .catch((err)=> {
            console.log(err);
    })
    }, [])
    
    
    let generateCase = () => {
        const options = {
            method:"POST",
            headers:{
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },

        }
        fetch(`${url}/${id}/new_case`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{

                    setCaseId(data.id)

                    
                })}
            return(res.json())
            .then((body)=>{alert(body.message)})
            
            })
       
        .catch((err)=> {
            console.log(err);
    })
    }

    
    function getCaseInfo(info){
        setCases([...cases, ...info])
        
        
    }
    
    function getPage(selected){
        setPage(selected)
    }
    
    function getCase(a){
        setCaseId(a)
    }

    function setSingleCaseID(id){
        setSingleCaseId(id)
        
    }

    return(
        <div >
            {(sessionStorage.getItem("id"))?
            <div style={{position: "relative", marginTop:"150px", marginBottom: "500px"}}>
            <div className="row">
                <div className="col-12 text-center">
                    <h1>Welcome Dr. {firstName}</h1>
                </div>
            </div>
            <div>
                <SideBar page={page} handleGetPage={getPage} getAllCases={getCaseInfo}/>

                {(page === "home")?
                <div></div>:
                (page === "create")?
                <CreateOrder handleGetPage={getPage} getCase = {generateCase} caseId = {caseId}/>:
                (page === "userCases")?
                <UserCases allCases= {cases} handleGetPage={getPage} page={page} setSingleCaseID  ={setSingleCaseID}/>:
                (page === "singleCase")?
                <SingleOrder singleCaseId = {singleCaseId}/>:
                (page === "updateAccountInfo")?
                <UpdateAccountInfo firstName={firstNameLower} lastName ={lastName} address = {address} email={email} />:
                (page === "contactUs")?
                <ContactUs/>:
                ""
                

                }
            </div>
            </div>:<Navigate to= {`/`}> </Navigate>}
        </div>
    )
}