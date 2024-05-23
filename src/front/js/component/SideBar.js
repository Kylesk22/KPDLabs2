import React, { useEffect, useState } from "react";



export const SideBar = props => {
    const [currentPage, setCurrentPage] = useState(props.page)
    const [cases, setCases] = useState([{}])
    const url = process.env.BACKEND_URL
    let id = sessionStorage.getItem("id");
  
    
    

    useEffect(()=>{
        
        props.handleGetPage(currentPage);
        console.log(currentPage)
    },[currentPage])

    // const getCases = () => {
           
    //     const options = {
    //         method:"GET",
    //         headers:{
    //             "Content-Type": "application/json",
    //         },
            
    //     }
    //     fetch(`${url}/${id}/cases`, options)
    //     .then((res)=> {
    //         if (res.ok) {
    //             return res.json()
    //             .then((data)=>{
                    
    //                 setCases([...cases, ...data])
    //                 props.getAllCases([...cases, ...data])
                    

                    
    //             })}
    //         return(res.json())
    //         .then((body)=>{alert(body.message)})
            
    //         })
       
    //     .catch((err)=> {
    //         console.log(err);
    // })


    // }
    return (
        <div className="container pt-4 user-sidebar" style={{width: "20%", position: "absolute"}}>
            <nav id="sidebarMenu" className="d-lg-block sidebar bg-white text-break text-nowrap overflow-hidden " >
                <div className="position-sticky">
                <div className="list-group list-group-flush ">
            
                        <a className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "home"  ? "active" : ""}`} onClick={()=>setCurrentPage("home")}>
                            <i className="fas fa-house fa-fw me-3"></i><span>Home</span>
                        </a>
                        <a className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "create" ? "active" : ""}`} onClick={()=>setCurrentPage("create")}>
                            <i className="fas fa-plus fa-fw me-3"></i><span>Create a Case</span>
                        </a>
                        {/* <a href="#" className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "userCases" ? "active" : ""}`} onClick={()=>{setCurrentPage("userCases")}}>
                            <i className="fas fa-lock fa-fw me-3"></i><span>Your Cases</span></a> */}
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "updateAccountInfo" ? "active" : ""}`} onClick={()=>setCurrentPage("updateAccountInfo")}><i
                            className="fas fa-pen-nib fa-fw me-3"></i><span>Update Account</span></a>
                        <a  className={`list-group-item list-group-item-action py-2 ripple ${currentPage === "contactUs" ? "active" : ""}`} onClick={()=>setCurrentPage("contactUs")}>
                            <i className="fas fa-address-book fa-fw me-3"></i><span>Contact Us</span>
                        </a>
                        {/* <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-chart-bar fa-fw me-3"></i><span>Orders</span></a>
                        <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-globe fa-fw me-3"></i><span>International</span></a>
                        <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-building fa-fw me-3"></i><span>Partners</span></a>
                        <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-calendar fa-fw me-3"></i><span>Calendar</span></a>
                        <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-users fa-fw me-3"></i><span>Users</span></a>
                        <a href="#" className="list-group-item list-group-item-action py-2 ripple"><i
                            className="fas fa-money-bill fa-fw me-3"></i><span>Sales</span></a> */}
                </div>
                </div>
            </nav>
        </div>
    )
}
