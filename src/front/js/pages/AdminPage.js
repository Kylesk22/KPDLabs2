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
    const [singlePage, setSinglePage] = useState("")

    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState('asc');

    const handleSort = (columnName) => {
        if (sortBy === columnName) {
        // If already sorting by this column, toggle the sort order
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
        // If sorting by a new column, set the column and default to ascending order
        setSortBy(columnName);
        setSortOrder('asc');
        }
    };

    const sortedCases = cases.sort((a, b) => {
        // Perform sorting based on the selected column and sort order
        

        
        
        if (sortBy && sortBy !== "user id") {
          const valA = typeof a[sortBy] === 'string' ? a[sortBy].toLowerCase() : a[sortBy];
          const valB = typeof b[sortBy] === 'string' ? b[sortBy].toLowerCase() : b[sortBy];
    
          if (valA < valB) {
            return sortOrder === 'asc' ? -1 : 1;
          }
          if (valA > valB) {
            return sortOrder === 'asc' ? 1 : -1;
          }
          return 0;
        } 
        if (sortBy === "user id") {
            const valA = users[a].toLowerCase()
            const valB = users[b].toLowerCase()
            if (valA < valB) {
                return sortOrder === 'asc' ? -1 : 1;
              }
              if (valA > valB) {
                return sortOrder === 'asc' ? 1 : -1;
              }
              return 0;
            } 
            
          
        
        else {
          // If no column is selected for sorting, maintain the original order
          return 0;
        }
      
    });

    
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
                    <div className = "col-1 text-center" onClick={() => handleSort('id')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Case #</div>
                    <div className = "col-3 text-center"  onClick={() => handleSort('user id')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Dr.</div>
                    <div className = "col-3 text-center" onClick={() => handleSort('name')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Patient Name</div>
                    <div className = "col-2 text-center" onClick={() => handleSort('type')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Type</div>
                    <div className = "col-2 text-center" onClick={() => handleSort('creation date')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Creation Date</div>
                    <div className = "col-1 text-center" onClick={() => handleSort('status')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Status</div>
                </div>
                <div className = "row justinfy-content-end">
                <div className="col=10">
                
                {sortedCases.map((item, index) => {
                        return (
                            <Link to = {`/admin/${id}/${item["id"]}`}>
                            <div key={index} className="row" >
                            
                                {(index <= pageMax && index >= pageMin)?
                                
                                    <>
                                    
                                        {/* <div className = "col-2 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}} >{item["id"]}</div>
                                        <div className = "col-5 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>{item["name"]}</div>
                                        <div className = "col-3 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}></div> */}
                                        <div className = "col-1 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}} >{item["id"]}</div>
                                        <div className = "col-3 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}}>{users[`${item["user id"]}`]}</div>
                                        <div className = "col-3 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}}>{item["name"]}</div>
                                        <div className = "col-2 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}}>{item["type"]}</div>
                                        <div className = "col-2 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}}>{item["creation date"]}</div>
                                        <div className = "col-1 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}}>{item["status"]}</div>
                                    </>
                                
                            :""}
                            </div>
                            </Link>
                            
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
