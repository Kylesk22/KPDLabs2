import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import KPDLogo from "../../img/KPD-Logo.png"
import { STLExporter} from 'three/addons/exporters/STLExporter.js';
import {STLLoader} from "../../../../node_modules/three/examples/jsm/loaders/STLLoader"
import { SingleOrder } from "./SingleOrder.js";



export const UserCases = props => {
    const [cases, setCases] = useState([{}])
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

    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState('desc');

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


    const statusFilter = (val) => {
        let filteredCases = new Map();

        originalCases.forEach(item => {
            if (item.status && item.status.toLowerCase().includes(val.toLowerCase())) {
                filteredCases.set(item.id, item);
            }
        })
        filteredCases = Array.from(filteredCases.values());
        setCases(filteredCases)
        return filteredCases;
    }
    const filterCases = (val) => {
        let filteredCases = new Map();
      
        // Filter by name
        originalCases.forEach(item => {
          if (item.name && item.name.toLowerCase().includes(val.toLowerCase())) {
            filteredCases.set(item.id, item);
          }
        });
      
        // Filter by id
        originalCases.forEach(item => {
          if (item.id && item.id.toString().includes(val)) {
            filteredCases.set(item.id, item);
          }
        });
      
        // Filter by user id
        originalCases.forEach(item => {
          if (item["user id"] && users[item["user id"]].toLowerCase().includes(val.toLowerCase())) {
            filteredCases.set(item.id, item);
          }
        });
      
        // Convert Map values back to an array
        filteredCases = Array.from(filteredCases.values());
        setCases(filteredCases)
        return filteredCases;
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
            
          
            const valA = users[a[sortBy]]? users[a[sortBy]].toLowerCase() : users[a[sortBy]]
            const valB = users[b[sortBy]]? users[b[sortBy]].toLowerCase() : users[b[sortBy]]
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

    useEffect(()=>{
        
        props.handleGetPage(singlePage);

    },[singlePage])
    


    useEffect(()=>{
        
        const options = {
            method:"GET",
            credentials: 'include',
            headers:{
                "Content-Type": "application/json",
            },
            
        }
        fetch(`${url}/${id}/cases`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{
                    
                    setCases([...cases, ...data])
                    
                    

                    
                })}
            return(res.json())
            .then((body)=>{alert(body.message)})
            
            })
       
        .catch((err)=> {
            console.log(err);
    })
    },[])

  
        
        return (
        <div className="container">
            <div className = "row justify-content-end" >
                <div className="col-md-10 col-12">
                    <div className="row" >
                    <div className = "col-md-2 col-3 text-center" style={{border: "solid rgba(0, 0, 0, .125) 1px", color:"black", backgroundColor:"white"}}   onClick={()=>{console.log(cases)}} ><strong>Case #</strong></div>
                    <div className = "col-md-5 col-6 text-center" style={{border: "solid rgba(0, 0, 0, .125) 1px", color:"black", backgroundColor:"white"}}><strong>Patient Name</strong></div>
                    <div className = "col-md-3 col-3 text-center" style={{border: "solid rgba(0, 0, 0, .125) 1px", color:"black", backgroundColor:"white"}}><strong>Status</strong></div>
                    <div className = "col-md-2 col-3 text-center" style={{border: "solid rgba(0, 0, 0, .125) 1px", color:"black", backgroundColor:"white"}}><strong>Submitted</strong></div>
                </div>
                <div className = "row justinfy-content-end">
                <div className="col=10">
                
                {/* {cases.slice().reverse().map((item, index) => { */}
                {sortedCases.map((item, index) => {
                        return (
                            <div key={index} className="row" onClick={()=>{setSinglePage("singleCase"), props.setSingleCaseID(item["id"])}}>
                                {(index <= pageMax && index >= pageMin)?
                                <>
                                {(item["name"])?
                                <>
                                    <div className = "col-md-2 col-3  text-center" style={{border: "solid rgba(0, 0, 0, .125) 1px", color:"black", backgroundColor:"white"}} >{item["id"]}</div>
                                    <div className = "col-md-5 col-6 text-center" style={{border: "solid rgba(0, 0, 0, .125) 1px", color:"black", backgroundColor:"white"}}>{item["name"]}</div>
                                    <div className = "col-md-3 col-3 text-center" style={{border: "solid rgba(0, 0, 0, .125) 1px", color:"black", backgroundColor:"white"}}>{item["status"]}</div>
                                    <div className = "col-md-2 col-3 text-center" style={{border: "solid rgba(0, 0, 0, .125) 1px", color:"black", backgroundColor:"white"}}>{(item["update date"])? item["update date"].split(" ")[0] : ""}</div>
                                </>
                                :""}    
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

        </div>)
}
