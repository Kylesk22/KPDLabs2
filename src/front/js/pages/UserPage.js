import { useFormLeave } from "../component/FormLeaveGuard";
import { AuthContext } from "../component/AuthProvider";
import React, { useState, useEffect, useContext, useRef } from "react";
import { SideBar } from "../component/SideBar";
import { CreateOrder } from "../component/CreateOrder";
import { UserCases } from "../component/UserCases";
import { Link, Navigate } from "react-router-dom";
import { SingleOrder } from "../component/SingleOrder";
import { ContactUs } from "../component/ContactUs";
import { UpdateAccountInfo } from "../component/UpdateAccountInfo";
import AboutBKG from "../../img/testi-bg.jpg"




export const UserPage = props => {
    const formLeave = useFormLeave();
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
    const [practice, setPractice] = useState("")
    const [accessCookie, setAccessCookie] = useState("")
    const [doctors, setDoctors] = useState([])
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    
    

    let id = sessionStorage.getItem("id");
    const url = process.env.BACKEND_URL

    const { logout, account } = useContext(AuthContext);
    const [loadError, setLoadError] = useState("");
    const [accountLoaded, setAccountLoaded] = useState(false);
    const preparing = useRef(false);

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
        if (props.userPage !== page) formLeave.leave(() => setPage(props.userPage))
    },[props.userPage])
    
    async function readResponse(response) {
        if (response.status === 401 || response.status === 422) {
            logout("expired");
            throw new Error("Sign back in, then retry preparing your case.");
        }
        if (!response.ok) throw new Error("Unable to prepare your case. Please retry.");
        return response.json();
    }
    async function generateCase() {
        if (preparing.current) return;
        preparing.current = true;
        setLoadError("");
        setCaseId("");
        try {
            const data = await readResponse(await fetch(`${url}/${account}/new_case`, {
                method:"POST", credentials:"include", signal:AbortSignal.timeout(15000),
                headers:{"Content-Type":"application/json", "X-CSRF-TOKEN":getCookie("csrf_access_token")}
            }));
            if (!data.id) throw new Error("No case number received. Please retry.");
            setCaseId(data.id);
        } catch (error) { setLoadError(error.message || "Unable to prepare case. Please retry."); }
        finally { preparing.current = false; }
    }
    async function loadAccount() {
        setLoadError("");
        try {
            const data = await readResponse(await fetch(`${url}/${account}`, {
                credentials:"include", signal:AbortSignal.timeout(15000)
            }));
            setDoctors(data.doctors || []);
            if (data.doctors && data.doctors.length === 1) setSelectedDoctor(data.doctors[0]);
            setEmail(data.email); setFirstName(data.fname.toUpperCase()); setFirstNameLower(data.fname);
            setLastName(data.lname); setLoggedIn(true); setAddress(data.address);
            setLicense(data.license); setPractice(data.practice); setAccountLoaded(true);
            if (!caseId) await generateCase();
        } catch (error) { setLoadError(error.message || "Unable to load account. Please retry."); }
    }
    useEffect(()=>{ loadAccount(); }, []);

    function getCaseInfo(info){
        setCases([...cases, ...info])
        
        
    }
    
    function getPage(selected){
        if (selected !== page) formLeave.leave(() => setPage(selected))
    }
    
    function getCase(a){
        setCaseId(a)
    }

    function setSingleCaseID(id){
        setSingleCaseId(id)
        
    }



    
    return(
        <div >
            {loadError && <div role="alert">{loadError} <button onClick={() => accountLoaded ? generateCase() : loadAccount()}>Retry</button></div>}
            {(sessionStorage.getItem("id"))?
            <div style={{backgroundImage: `url(${AboutBKG})`}}>
            <div className="row" style={{paddingTop: "150px"}}>
                <div className="col-12 user-header" style={{minHeight: "157px"}}>
                    <h3 style={{paddingTop: "50px"}}>
                        Welcome {selectedDoctor ? `Dr. ${selectedDoctor.fname} ${selectedDoctor.lname}` : `Dr. ${firstNameLower} ${lastName}`}
                        {doctors.length > 1 && (
                            <span
                                onClick={() => formLeave.leave(() => setSelectedDoctor(null))}
                                style={{fontSize: '0.85rem', marginLeft: '15px', cursor: 'pointer', color: '#137ea7'}}
                            >
                                Switch Doctor
                            </span>
                        )}
                    </h3>
                </div>
            </div>
            
            {(doctors.length > 1 && !selectedDoctor) ? (
                <div className="row justify-content-center" style={{paddingTop: "100px"}}>
                    <div className="col-md-4 text-center">
                        <h3>Select Doctor</h3>
                        {doctors.map((doctor, index) => (
                            <button
                                key={index}
                                className="btn btn-primary d-block w-100 mb-3"
                                onClick={() => setSelectedDoctor(doctor)}
                            >
                                Dr. {doctor.fname} {doctor.lname}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (

            <div  style={{paddingBottom: "500px"}}>
                <SideBar page={page} handleGetPage={getPage} getAllCases={getCaseInfo}/>

                {(page === "home")?
                <UserCases allCases= {cases} handleGetPage={getPage} page={page} setSingleCaseID  ={setSingleCaseID}  updateLogState={setLoggedIn} logouts={logout} />:
                (page === "create")?
                (caseId && accountLoaded ? <CreateOrder handleGetPage={getPage} practice={practice} getCase = {generateCase} caseId = {caseId} selectedDoctor={selectedDoctor} fname={firstNameLower} lname={lastName}/> : <p role="status">Preparing your case…</p>):
                // (page === "userCases")?
                // <UserCases allCases= {cases} handleGetPage={getPage} page={page} setSingleCaseID  ={setSingleCaseID}/>:
                (page === "singleCase")?
                <SingleOrder firstName={firstNameLower} lastName={lastName} license={license} address={address} singleCaseId = {singleCaseId} handleGetPage={getPage} page={page}/>:
                (page === "updateAccountInfo")?
                <UpdateAccountInfo firstName={firstNameLower} lastName ={lastName} address = {address} email={email} doctors={doctors}/>:
                (page === "contactUs")?
                <ContactUs/>:
                ""
                

                }
            </div>)}
            </div>:<Navigate to= {`/`}> </Navigate>}
        </div>
            
    )
}