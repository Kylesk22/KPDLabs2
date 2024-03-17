import React, { useState, useEffect } from "react";
import { SideBar } from "../component/SideBar";
import { CreateOrder } from "../component/CreateOrder";
import { UserCases } from "../component/UserCases";
import { Link, Navigate } from "react-router-dom";
import { SingleOrder } from "../component/SingleOrder";




export const UserPage = props => {
    const [page, setPage] = useState("home")
    const [firstName, setFirstName] = useState(sessionStorage.getItem("firstName"))
    const [lastName, setLastName] = useState(sessionStorage.getItem("lastName"))
    const [email, setEmail] = useState(sessionStorage.getItem("email"))
    const [loggedIn, setLoggedIn] = useState(props.logState)
    const [caseId, setCaseId] = useState("")
    const [cases, setCases] = useState([{}])
    const [singleCaseId, setSingleCaseId] = useState("")

    

    let id = sessionStorage.getItem("id");
    const url = `http://127.0.0.1:3001/api`
    
    
    useEffect(()=>{
        if (caseId === ""){
            generateCase();
            
        }
        console.log(page)


       
        
        const options = {
            method:"GET",
            headers:{
                "Content-Type": "application/json",
            },
            
        }
        fetch(`${url}/${id}`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{

                    setEmail(data.email)
                    setFirstName(data.fname.toUpperCase())
                    setLastName(data.lname)
                    setLoggedIn(true);

                    
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
        <div>
            {(sessionStorage.getItem("id"))?
            <div>
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
                ""
                

                }
            </div>
            </div>:<Navigate to= {`/`}> </Navigate>}
        </div>
    )
}