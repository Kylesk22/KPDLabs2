import React, { useState, useEffect } from "react";
import { SideBar } from "../component/SideBar";
import { CreateOrder } from "../component/CreateOrder";
import { UserCases } from "../component/UserCases";
import { Link, Navigate } from "react-router-dom";
import { SingleOrder } from "../component/SingleOrder";
import { ContactUs } from "../component/ContactUs";
import { UpdateAccountInfo } from "../component/UpdateAccountInfo";
import AboutBKG from "../../img/testi-bg.jpg"




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
    const [license, setLicense] = useState("")
    

    let id = sessionStorage.getItem("id");
    const url = process.env.BACKEND_URL

    const logout = () => {
		sessionStorage.clear();
		setLoggedIn(false);
		props.updateLogState(false)
		window.location.href = "/";


	}

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
        setPage(props.userPage)
    },[props.userPage])
    
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
                    
                   

                    
                })}
            return(res.json())
            .then((body)=>{
                if (body.msg=== "Token has expired"){
                    logout()
                }
                alert(body.message)})
            
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
                console.log(res)
                return res.json()
                .then((data)=>{

                    setEmail(data.email)
                    setFirstName(data.fname.toUpperCase())
                    setFirstNameLower(data.fname)
                    setLastName(data.lname)
                    setLoggedIn(true);
                    setAddress(data.address)
                    setLicense(data.license)

                    if (data.msg=== "Token has expired"){
                        logout()
                        console.log(data.msg)
                    }

                    
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
            <div style={{backgroundImage: `url(${AboutBKG})`}}>
            <div className="row" style={{paddingTop: "150px"}}>
                <div className="col-12 user-header" style={{minHeight: "157px"}}>
                    <h3 style={{paddingTop: "50px"}}>Welcome Dr. {firstNameLower} {lastName}</h3>
                </div>
            </div>
            <div  style={{paddingBottom: "500px"}}>
                <SideBar page={page} handleGetPage={getPage} getAllCases={getCaseInfo}/>

                {(page === "home")?
                <UserCases allCases= {cases} handleGetPage={getPage} page={page} setSingleCaseID  ={setSingleCaseID}/>:
                (page === "create")?
                <CreateOrder handleGetPage={getPage}  getCase = {generateCase} caseId = {caseId}/>:
                // (page === "userCases")?
                // <UserCases allCases= {cases} handleGetPage={getPage} page={page} setSingleCaseID  ={setSingleCaseID}/>:
                (page === "singleCase")?
                <SingleOrder firstName={firstNameLower} lastName={lastName} license={license} address={address} singleCaseId = {singleCaseId} handleGetPage={getPage} page={page}/>:
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