import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import KPDLogo from "../../img/KPD-Logo.png"
import { STLExporter} from 'three/addons/exporters/STLExporter.js';
import {STLLoader} from "../../../../node_modules/three/examples/jsm/loaders/STLLoader"
import AboutBKG from "../../img/testi-bg.jpg"
import "../../styles/adminPage.css";



export const AdminPage = props => {
    const [cases, setCases] = useState([{}])
    const [users, setUsers] = useState([{}])
    const url = process.env.BACKEND_URL
    let id = sessionStorage.getItem("id");
    const [pageMin, setPageMin]=useState(0)
    const [pageMax, setPageMax]=useState(20)
    const [pageNumber, setPageNumber] = useState(1)
    const [singlePage, setSinglePage] = useState("")
    const [search, setSearch] = useState("")
    const [originalCases, setOriginalCases] = useState("")

    //blog variables
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState("")
    const [info, setInfo] = useState("")
    const [blogModal, setBlogModal] = useState(false)

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

    const productionFilter = () => {
        let filteredCases = new Map();
        let val = ["Manufacturing", "Scanning", "Design", "Pre-Finish", "Finish", "Ready to Ship", "Shipped"]
        val.forEach (vals => {
            originalCases.forEach(item => {
                if (item.status && item.status.toLowerCase().includes(vals.toLowerCase())) {
                    filteredCases.set(item.id, item);
                }
            })
            filteredCases = Array.from(filteredCases.values());
            setCases(...cases, ...filteredCases)
            return filteredCases;
        })

    }

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
    // const filterCases = (val) =>{
    //     let filteredCases = []
        
    //     const nameFilter = cases.filter(item =>{

    //         if (item.name) {
                
    //             return item.name.toLowerCase().includes(val.toLowerCase());
    //         }
    //         return false; // Return false for items with null name
    //     });
    //     const idFilter = cases.filter(item =>{
    //         if (item.id) {
                
    //             return item.id.toString().includes(val);
    //         }
    //         return false
    //      })
        
    //     const drFilter = cases.filter(item =>{
    //         if (users[`${item["user id"]}`]) {
    //             return users[`${item["user id"]}`].toLowerCase().includes(val.toLowerCase())
    //         }
    //         return false
    //     })

        

    //     console.log(nameFilter)
        
    //     filteredCases = [...nameFilter, ...idFilter, ...drFilter];

    //     setCases(filteredCases)
    //     console.log(filteredCases)
        
    //     return filteredCases
    // }

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

  
  


   
    
    function addBlog() {

        let newBlog = {
            "title": title,
            "description": description,
            "date": date,
            "info": info
        }
        const options = {
            method:"POST",
            credentials: 'include',
            headers:{
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },
            body: JSON.stringify(newBlog)
            
        }
        fetch(`${url}/blogs/add`, options)
        .then((res)=> {
            if (res.ok) {
                return res.json()
                .then((data)=>{
                    alert(data.message)
                
                    
                })}
            return(res.json())
            .then((body)=>{alert(body.message)})
            
            })
       
        .catch((err)=> {
            console.log(err);
    })
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
                    if (data.message === "You are not an admin, please log in at kpdlabs.com"){
                        if (id){
                        alert(data.message);
                        window.location.href = `/account/${id}`}
                        else{
                            alert(data.message);
                            window.location.href = '/login'
                        }
                    }
                    console.log(data)
                    setCases([...cases, ...data.cases])
                    setOriginalCases([...originalCases, ...data.cases])

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





    const calculateBusinessDays = (submissionDate, numberOfDays) => {
        // console.log(submissionDate.split(" "))
        
        let split = submissionDate.split(" ")
        let datePart = split[0];
        let datePartSplit = datePart.split("/")
        let month = datePartSplit[0]
        let day = datePartSplit[1]
        let year = datePartSplit[2]
        
        // // const [hours, minutes, seconds] = timePart.split(':')

        let currentDate = new Date(year, month - 1, day);
        console.log(currentDate)
        let daysAdded = 0;
        
      
        while (daysAdded < numberOfDays) {
          currentDate.setDate(currentDate.getDate() + 1);
          // Check if the current date is a weekday
          if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            daysAdded++
            
          }
        }
        console.log(currentDate)
        return currentDate;
      };

     
      
     
        
        const [resultDate, setResultDate] = useState(null);
      
        

  




    
    
        return (
            <div  style={{backgroundImage: `url(${AboutBKG})`, paddingTop: "180px"}}>
        <div className="container" style={{maxWidth: "90%"}}>
            {/* <div>
                <button className="btn btn-primary" onClick={()=>setBlogModal(true)}>Add blog</button>
                {(blogModal)?
                <div>
                    <input type="text" required className="form-control" id="title" placeholder="Blog Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
                    <input type="text" required className="form-control" id="firstName" placeholder="Blog Description (under 500 characters)" value={description} onChange={(e)=>setDescription(e.target.value)} />
                    <input type="text" required className="form-control" id="firstName" placeholder="Date m/d/FullYear" value={date} onChange={(e)=>setDate(e.target.value)} />
                    <input type="text" required className="form-control" id="firstName" placeholder="Full Blog 2500 characters" value={info} onChange={(e)=>setInfo(e.target.value)} />
                    <button className="btn btn-primary" onClick={()=>{addBlog(); setBlogModal(false)}}>Submit Blog</button>
                </div>
                    :""
                }
            </div> */}
            <div>
                Legend: <i className="fa-solid fa-square" style={{color:"orange"}}></i> Rush Production | <i className="fa-solid fa-square" style={{color:"yellow", paddingLeft: "5px"}}></i> Rush Shipping |<i className="fa-solid fa-square" style={{color:"red", paddingLeft: "5px"}}></i> Rush Production and Shipping
            </div>
            
            <div  >
                <input 
                type="text" 
                placeholder="Search..." 
                value={search} 
                onChange={(e)=>{setSearch(e.target.value); filterCases(e.target.value)}} 
                className="p-2"
                style={{border: "1px solid black", marginBottom: "5px"}}
                 />
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>productionFilter()}>Production</button>
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>statusFilter("Created")}>Created</button>
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>statusFilter("Submitted")}>Submitted</button>
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>statusFilter("Scanning")}>Scanning</button>
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>statusFilter("Design")}>Design</button>
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>statusFilter("Manufacturing")}>Manufact</button>
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>statusFilter("Pre-Finish")}>PreFin</button>
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>statusFilter("Finish")}>Fin</button>
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>statusFilter("Ready to Ship")}>Rdy Ship</button>
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>statusFilter("Shipped")}>Shipped</button>
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>statusFilter("Billed")}>Billed</button>
                 <button className="btn btn-primary filter-btn" style ={{marginLeft: "5px"}} onClick={()=>statusFilter("Closed")}>Closed</button>
                <div >
                    <div className="row" >
                    <div className = "col-1 text-center" onClick={() => handleSort('id')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Case #</div>
                    <div className = "col-3 text-center"  onClick={() => handleSort('user id')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Dr.</div>
                    <div className = "col-3 text-center" onClick={() => handleSort('name')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Patient Name</div>
                    <div className = "col-2 text-center" onClick={() => handleSort('type')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Type</div>
                    <div className = "col-1 text-center" onClick={() => handleSort('creation date')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Submit Date</div>
                    <div className = "col-1 text-center" onClick={() => handleSort('due date')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Due Date</div>
                    <div className = "col-1 text-center" onClick={() => handleSort('status')} style={{border: "solid black 1px", color:"black", backgroundColor:"white"}}>Status</div>
                </div>
                <div className = "row justinfy-content-end">
                <div className="col=10">
                
                {sortedCases.map((item, index) => {
                    
                    // if (item["update date"] && item["update date"] !== "undefined" && item["update date"] !== "Invalid Date"){
                    //     const result = calculateBusinessDays(item["update date"], 6)
                    //     console.log(result)
                    //     const resultString = result.toString()

                    //     const resultSplit = resultString.split(" ")
                    //     const finalResult = `${resultSplit[0]} ${resultSplit[1]} ${resultSplit[2]} ${resultSplit[3]}`
                    //     setResultDate(finalResult)
                    //     console.log(`result HERE ${finalResult}`)
                    // }
                    

                        return (
                            
                            <Link to = {(item.status !== "Created")? `/admin/${id}/${item["id"]}` :""}>
                            

                            <div key={index} className="row" >
                                
                            
                                {(index <= pageMax && index >= pageMin)?
                                    
                                
                                    <>
                                    
                                        {/* <div className = "col-2 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}} >{item["id"]}</div>
                                        <div className = "col-5 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}>{item["name"]}</div>
                                        <div className = "col-3 text-center" style={{border: "solid white 1px", color:"white", backgroundColor:"#202020"}}></div> */}
                                        <div className = "col-1 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(item["production"] === "Rush" && item["shipping"] === "Express")? "red":(item["shipping"] === "Express")? "yellow" :(item["production"] === "Rush")? "orange" : (index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}} >{item["id"]}</div>
                                        <div className = "col-3 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(item["production"] === "Rush" && item["shipping"] === "Express")? "red":(item["shipping"] === "Express")? "yellow" :(item["production"] === "Rush")? "orange" : (index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}}>{users[`${item["user id"]}`]}</div>
                                        <div className = "col-3 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(item["production"] === "Rush" && item["shipping"] === "Express")? "red":(item["shipping"] === "Express")? "yellow" :(item["production"] === "Rush")? "orange" : (index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}}>{item["name"]}</div>
                                        <div className = "col-2 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(item["production"] === "Rush" && item["shipping"] === "Express")? "red":(item["shipping"] === "Express")? "yellow" :(item["production"] === "Rush")? "orange" : (index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}}>{item["type"]}</div>
                                        <div className = "col-1 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(item["production"] === "Rush" && item["shipping"] === "Express")? "red":(item["shipping"] === "Express")? "yellow" :(item["production"] === "Rush")? "orange" : (index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}}>{item["update date"] ? 
                                                                                                                                                                                                                                                                                                                                                                        (() => {
                                                                                                                                                                                                                                                                                                                                                                        const [datePart] = item["update date"].split(" ");
                                                                                                                                                                                                                                                                                                                                                                        const [month, day, year] = datePart.split("/");
                                                                                                                                                                                                                                                                                                                                                                        return `${parseInt(month)}/${parseInt(day)}/${year.slice(-2)}`; // Convert to M/D/YY
                                                                                                                                                                                                                                                                                                                                                                        })() 
                                                                                                                                                                                                                                                                                                                                                                        : "N/A"}</div>
                                        <div className = "col-1 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(item["production"] === "Rush" && item["shipping"] === "Express")? "red":(item["shipping"] === "Express")? "yellow" :(item["production"] === "Rush")? "orange" : (index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}}>{item["due date"] ? 
                                                                                                                                                                                                                                                                                                                                                                        (() => {
                                                                                                                                                                                                                                                                                                                                                                        const [datePart] = item["due date"].split(" ");
                                                                                                                                                                                                                                                                                                                                                                        const [month, day, year] = datePart.split("/");
                                                                                                                                                                                                                                                                                                                                                                        return `${parseInt(month)}/${parseInt(day)}/${year.slice(-2)}`; // Convert to M/D/YY
                                                                                                                                                                                                                                                                                                                                                                        })() 
                                                                                                                                                                                                                                                                                                                                                                        : "N/A"}</div>
                                        <div className = "col-1 text-center" style={{border: "solid black 1px", color:"black", backgroundColor:(item["production"] === "Rush" && item["shipping"] === "Express")? "red":(item["shipping"] === "Express")? "yellow" :(item["production"] === "Rush")? "orange" : (index % 2 === 1)? "rgba(0, 0, 0, .125)" : "white"}}>{item["status"]}</div>
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
