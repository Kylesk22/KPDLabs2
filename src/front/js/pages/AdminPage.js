import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import KPDLogo from "../../img/KPD-Logo.png"
import { STLExporter} from 'three/addons/exporters/STLExporter.js';
import {STLLoader} from "../../../../node_modules/three/examples/jsm/loaders/STLLoader"
import AboutBKG from "../../img/testi-bg.jpg"



export const AdminPage = props => {
    const [cases, setCases] = useState([{}])
    const [users, setUsers] = useState([{}])
    const url = process.env.BACKEND_URL
    let id = sessionStorage.getItem("id");
    const [pageMin, setPageMin]=useState(0)
    const [pageMax, setPageMax]=useState(20)
    const [pageNumber, setPageNumber] = useState(1)
    const [singlePage, setSinglePage] = useState(props.page)
    // const [singleCaseId, setSingleCaseID] = useState("")

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
        const options = {
            method:"GET",
            credentials: 'include',
            headers:{
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },
            
        }
        fetch(`${url}/admin/${id}`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{
                    console.log(data)
                    setCases([...cases, ...data.cases])

                    const newUsers = {};
                    for (let i = 0; i < data.users.length; i++) {
                        const userId = data.users[i].id;
                        const fullName = `${data.users[i].fname} ${data.users[i].lname}`;
                        newUsers[userId] = fullName;
                    }
                    setUsers(newUsers);
                    
                    
                    

                    
                })}
            return(res.json())
            .then((body)=>{alert(body.message)})
            
            })
       
        .catch((err)=> {
            console.log(err);
    })
    },[])

    
    useEffect(()=>{
        console.log(users)
    })
        return (
            <div  style={{backgroundImage: `url(${AboutBKG})`, paddingTop: "180px"}}>
        <div className="container">
            <div  >
                <div >
                    <div className="row" >
                    <div className = "col-1 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}   onClick={()=>{console.log(cases)}} >Case #</div>
                    <div className = "col-3 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>Dr.</div>
                    <div className = "col-3 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>Patient Name</div>
                    <div className = "col-2 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>Type</div>
                    <div className = "col-2 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>Creation Date</div>
                    <div className = "col-1 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>Status</div>
                </div>
                <div className = "row justinfy-content-end">
                <div className="col=10">
                
                {cases.map((item, index) => {
                        return (
                            <div key={index} className="row" onClick={()=>{setSinglePage("singleCase"), props.setSingleCaseID(item["id"])}}>
                                {(index <= pageMax && index >= pageMin)?
                                <>
                                {/* <div className = "col-2 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}} >{item["id"]}</div>
                                <div className = "col-5 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>{item["name"]}</div>
                                <div className = "col-3 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}></div> */}
                                <div className = "col-1 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}} >{item["id"]}</div>
                                <div className = "col-3 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>{users[`${item["user id"]}`]}</div>
                                <div className = "col-3 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>{item["name"]}</div>
                                <div className = "col-2 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>{item["type"]}</div>
                                <div className = "col-2 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>{item["creation date"]}</div>
                                <div className = "col-1 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>{item["status"]}</div>
                                </>
                                
                            :""}
                            </div>
                            
                        );
                    })}
                    <div className="col-10 ">
                        <div className="row justify-content-end" >
                            {(pageNumber === 1)?
                            <button className="btn btn-primary col-2 float-end mt-1" style={{height: "40px", width:"80px"}} onClick={()=>{setPageMin(pageMin + 20); setPageMax(pageMax+20); setPageNumber(pageNumber+1)}}>Next</button>
                            : 
                            <>
                                <button className="btn btn-primary col-2 float-start mt-1" style={{height: "40px", width:"100px"}} onClick={()=>{setPageMin(pageMin - 20); setPageMax(pageMax-20); setPageNumber(pageNumber-1)}}>Previous</button>
                                <button className="btn btn-primary col-2 float-end mt-1" style={{height: "40px", width:"80px"}} onClick={()=>{setPageMin(pageMin + 20); setPageMax(pageMax+20); setPageNumber(pageNumber+1)}}>Next</button>
                            </>
                            }
                            </div>
                    </div>
                    </div>
                </div>

                  
                </div>
            </div>

        </div>
        </div>)
}
