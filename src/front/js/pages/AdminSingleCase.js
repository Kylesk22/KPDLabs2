import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { Link, Navigate } from "react-router-dom";
import KPDLogo from "../../img/KPD-Logo.png"
import { STLExporter} from 'three/addons/exporters/STLExporter.js';
import {STLLoader} from "../../../../node_modules/three/examples/jsm/loaders/STLLoader"
import AboutBKG from "../../img/testi-bg.jpg"
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import "../../styles/adminSingle.css";
import { PrintPDFButton } from "../component/PrintScript";




export const AdminSingleCase = props => {
    const url = process.env.BACKEND_URL
    const [crownTooth, setCrownTooth] = useState([])
    const [toothInput, setToothInput] = useState("")
    const [toothInput2, setToothInput2] = useState("")
    const [patientName, setPatientName] = useState("")
    const [stlFile, setStlFile] = useState([])
    const [fileName, setFileName] = useState([])
    const [photos, setPhotos] = useState([])
    const [photoName, setPhotoName] = useState([])
    const [caseNum, setCaseNum ] = useState(props.caseId)
    const [product, setProduct] = useState("")
    const [finish, setFinish] = useState("")
    const [page, setPage] = useState(props.page)
    const [shade, setShade] = useState("")
    const [price, setPrice] = useState("")
    const [gumShade, setGumShade] = useState("")
    const [bridge, setBridge] = useState('false')
    const[bridgeTooth, setBridgeTooth] = useState([])
    const [note, setNote] = useState("")
    const [type, setType] = useState("")
    const [caseStatus, setCaseStatus] = useState("")
    const [shipping, setShipping] = useState("")
    const [production, setProduction] = useState("")
    const [refId, setRefId] = useState("")
    const [showClone, setShowClone] = useState(false)
    const [clonedCaseId, setClonedCaseId] = useState("")
    const [submissionDate, setSubmissionDate] = useState("")

    const [drId, setDrId] = useState("")
    const [drName, setDrName] = useState("")
    const [drStreet, setDrStreet] = useState("")
    const [drCity, setDrCity] = useState("")
    const [drState, setDrState] = useState("")
    const [drZip, setDrZip] = useState("")
    const [rates, setRates] = useState([])
    const [license, setLicense] = useState([])

    const [labelUrl, setLabelUrl] = useState("")

    const reader = new FileReader();
    let id = sessionStorage.getItem("id");
    let stl_urls = []
    let photo_urls = []
    const { case_id } = useParams()
    
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

  
    function shippoTest(){
        
        const userInfo = {
            "stl_urls" : fileName,
            "photos": photoName,
            "case": caseNum,
            "name": patientName,
            "product": product,
            "teeth": crownTooth,
            "finish": finish,
            "shade": shade,
            "note": note,
            "status": "Created",
            "type": type,
            "gum_shade": gumShade,
            "price": finalPrice,
        }
        
        
        const options = {
            method:"POST",
            withCredntials: true,
            credentials: 'include',
            
            headers:{
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },
            body: JSON.stringify(userInfo)
            
        }
        fetch(`${url}/shippo/create_user`, options)
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
            alert(err); // Or display a more user-friendly message
        });
    }


    function shippoTest2() {
        const userInfo = {
            "name": drName,
            "street": drStreet,
            "city": drCity,
            "state": drState,
            "zip": drZip,
        };
    
        const options = {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },
            body: JSON.stringify(userInfo)
        };
    
        fetch(`${url}/shippo/get_rates`, options)
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .then((data) => {
                // Update rates state
                // setRates(prevRates => [...prevRates, ...data.rates]);
                console.log(data.rates)
                const newRates = [];
                for (let i = 0; i < data.rates.length; i++){
                    console.log(data.rates[i])
                    let thisRate= data.rates[i]
                    newRates[i] = thisRate
                }
                setRates(newRates)
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while fetching rates. Please try again later.');
            });
    }
    
    function getLabel(selectedRate){
        const userInfo = {
            "rate": selectedRate
        };

        const options = {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },
            body: JSON.stringify(userInfo)
        };
    
        fetch(`${url}/shippo/get_label`, options)
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .then((data) => {
                // Update rates state
                // setRates(prevRates => [...prevRates, ...data.rates]);
                console.log(data)
                setLabelUrl(data)
                
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while fetching rates. Please try again later.');
            });
    }
   
    











    ////////////////downloading from DO//////////////////
    const s3Client = new S3Client({
        endpoint: "https://nyc3.digitaloceanspaces.com", // Find your endpoint in the control panel, under Settings. Prepend "https://".
        forcePathStyle: false, // Configures to use subdomain/virtual calling format.
        region: "nyc3", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (for example, nyc3).
        credentials: {
            accessKeyId: process.env.SPACES_KEY, // Access key pair. You can create access key pairs using the control panel or API.
            secretAccessKey: process.env.SPACES_SECRET_KEY // Secret access key defined through an environment variable.
        }
    });

    const downloadObject = async (localFilePath) => {
        try {
            const params = {
                Bucket: "case-scans",
                Key: `${caseNum}`
            };
    
            // Download the object from Spaces
            const data = await s3Client.getObject(params).promise();
    
            // Write the object content to a local file
            // require('fs').writeFileSync(localFilePath, data.Body);
    
            console.log(`Successfully downloaded object: case-scans/${caseNum}`);
            console.log(data)
            return true;
        } catch (err) {
            console.error('Error downloading object:', err);
            return false;
        }
    };
    
    // Example usage
    const bucketName = 'your-bucket-name';
    const objectKey = 'path/to/your/object';
    const localFilePath = '/path/to/save/local/file';
    // useEffect(()=>{

    //     let caseId = props.singleCaseId
        
    //     const url = process.env.BACKEND_URL
    //     console.log(`${url}/${id}/${case_id}`)
    //     const options = {
    //         method:"GET",
    //         credentials: 'include',
    //         headers:{
    //             "Content-Type": "application/json",
    //         },
            
    //     }
    //     fetch(`${url}/${id}/${case_id}`, options)
    //     .then((res)=> {
    //         if (res.ok) {
    //             return res.json()
    //             .then((data)=>{
                    
    //                 console.log(data)
    //                 setPatientName(data.name);
    //                 setCaseNum(data.id);
    //                 setCrownTooth(data.teeth);
    //                 setProduct(data.product)
    //                 setFinish(data.finish);
    //                 setNote(data.notes);
    //                 setShade(data.shade);
    //                 setGumShade(data["gum shade"]);
    //                 setType(data.type)
    //                 setPrice(data.price);
    //                 setDrId(data["user id"])
    //                 for (let tooth in crownTooth){
    //                     const element = document.getElementById(tooth);
    //                     element.style.fill = "#137ea7"
    //                     console.log(tooth)
    //                 }
                    
                    
                    
    //                 console.log(data["case scans"])
    //                 for (let scan in data["case scans"]){
    //                     let add_scan = data["case scans"][scan]["scan"]
    //                     setStlFile([...stlFile, add_scan])
    //                 }

                    
                    
                    

                    
    //             })}
    //                 return(res.json())
    //                 .then((body)=>{alert(body.message)})
            
    //         })
       
    //     .catch((err)=> {
    //         console.log(err);
    // })


    // fetch(`${url}/${drId}`, options)
    //     .then((res)=> {
    //         if (res.ok) {
    //             return res.json()
    //             .then((data)=>{
                    
                    
    //                 setDrName(`${data.fname} ${data.lname}`)
    //                 let add = data.address.split(",")
    //                 setDrStreet(add[0])
    //                 setDrCity(add[1])
    //                 setDrState(add[2])
    //                 setDrZip(add[3])
                   
                    
                    
                  
                    
                    
                    

                    
    //             })}
                    
            
    //         })
       
    //     .catch((err)=> {
    //         console.log(err);
    // })

    // }
    // ,[])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = process.env.BACKEND_URL;
                const options = {
                    method: "GET",
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                };
    
                // Fetch patient data
                const patientResponse = await fetch(`${url}/${id}/${case_id}`, options);
                if (!patientResponse.ok) {
                    const { message } = await patientResponse.json();
                    throw new Error(message);
                }
                const patientData = await patientResponse.json();
    
                setPatientName(patientData.name);
                setCaseNum(patientData.id);
                setRefId(patientData["reference id"])
                setProduct(patientData.product);
                setFinish(patientData.finish);
                setNote(patientData.notes);
                setShade(patientData.shade);
                setGumShade(patientData["gum shade"]);
                setType(patientData.type);
                setPrice(patientData.price);
                setDrId(patientData["user id"]);
                setCaseStatus(patientData.status)
                setShipping(patientData.shipping)
                setProduction(patientData.production)
                setSubmissionDate(patientData["update date"])
                
                let doctorId = patientData["user id"]
                // Update tooth colors
                let returnedTeeth = patientData.teeth
                const numberArray = returnedTeeth.replace(/[^\d,-]/g, '').split(',');;
                setCrownTooth(numberArray);
                for (let tooth in numberArray){
                    const element = document.getElementById(numberArray[tooth]);
                    
                    element.style.fill = "#137ea7"
                    
                }
    
                // Fetch doctor data
                const doctorResponse = await fetch(`${url}/${doctorId}`, options);
                if (!doctorResponse.ok) {
                    const { message } = await doctorResponse.json();
                    throw new Error(message);
                }
                const doctorData = await doctorResponse.json();
    
                setDrName(`${doctorData.fname} ${doctorData.lname}`);
                setLicense(doctorData.license);
                const addressParts = doctorData.address.split(",");
                setDrStreet(addressParts[0]);
                setDrCity(addressParts[1]);
                setDrState(addressParts[2]);
                setDrZip(addressParts[3]);
            } catch (error) {
                console.error(error);
                alert("An error occurred while fetching data. Please try again later.");
            }
        };
    
        fetchData();
    }, []);

    const updateCase = () => {

       
        // uploadObject();
        // uploadPictures();
        
        const url = process.env.BACKEND_URL

       


            const updateCase = {
                
                "admin": true,
                "case": caseNum,
                "name": patientName,
                "product": product,
                "teeth": crownTooth,
                "finish": finish,
                "shade": shade,
                "note": note,
                "status": caseStatus,
                "type": type,
                "gum_shade": gumShade,
                "price": price,
                "shipping": shipping,
                "production": production,
                "reference id": refId,
            }
            
            const options = {
                method:"PUT",
                headers:{
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                },
                body: JSON.stringify(updateCase)
            }
            fetch(`${url}/${id}/new_case`, options)
            .then((res)=> {
                if (res.ok) {
                    return res.json()
                    .then((data)=>{

                        alert("Case Uploaded")
                        setCrownTooth([])
                        setToothInput("")
                        setToothInput2("")
                        setPatientName("")
                        setStlFile([])
                        setFileName([])
                        setPhotos([])
                        setCaseNum("")
                        setProduct("")
                        setFinish("")
                        setBridge("false")
                        setBridgeTooth([])
                        setNote("")
                        setType("")
                        setGumShade("")
                        setRefId("")
                        setDrName("")
                        setSubmissionDate("")
                        // props.handleGetPage("home")
                        // props.generateCase()
                        props.getCase("")
                        
                    })}
                return(res.json())
                .then((body)=>{
                    alert(body.message)
                    
                })
                
                })
              
        
            .catch((err)=> {
                console.log(err);
        })
        
    
        }
      ;
        
        ////cloning remake cases 

        let generateCase = () => {
            const url = process.env.BACKEND_URL

            const options = {
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                },
    
            }
            fetch(`${url}/${drId}/new_case`, options)
            .then((res)=> {
                if (res.ok) {
                    return res.json()
                    .then((data)=>{
    
                        setClonedCaseId(data.id)
    
                        
                    })}
                return(res.json())
                .then((body)=>{alert(body.message)})
                
                })
           
            .catch((err)=> {
                console.log(err);
        })
        }

        const uploadCase = () => {

       
            
            const url = process.env.BACKEND_URL
    
           
    
    
                const updateCase = {
                    
                    "stl_urls" : "",
                    "photos": "",
                    "case": caseNum,
                    "name": patientName,
                    "product": product,
                    "teeth": crownTooth,
                    "finish": finish,
                    "shade": shade,
                    "note": note,
                    "status": "Created",
                    "type": type,
                    "gum_shade": gumShade,
                    "price": finalPrice,
                    "shipping": shipping,
                    "production": production,
                }
                
                const options = {
                    method:"PUT",
                    headers:{
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                    body: JSON.stringify(updateCase)
                }
                fetch(`${url}/${id}/new_case`, options)
                .then((res)=> {
                    if (res.ok) {
                        return res.json()
                        .then((data)=>{
    
                            alert("Case Uploaded")
                            setCrownTooth([])
                            setToothInput("")
                            setToothInput2("")
                            setPatientName("")
                            setStlFile([])
                            setFileName([])
                            setPhotos([])
                            setCaseNum("")
                            setProduct("")
                            setFinish("")
                            setBridge("false")
                            setBridgeTooth([])
                            setNote("")
                            setType("")
                            setGumShade("")
                            // props.handleGetPage("home")
                            // props.generateCase()
                            props.getCase("")
                            props.handleGetPage("home")
                            
                        })}
                    return(res.json())
                    .then((body)=>{alert(body.message)})
                    
                    })
            
                .catch((err)=> {
                    console.log(err);
            })
            
        
            }
    

        const cloneCase = () => {
            generateCase()
            updateCase()
        }

  
        return (
            <>
            <form className="form form-container printable" data-toggle="validator" role="form" style={{paddingTop: "150px", paddingBottom: "30px"}}>
                <div className="row mt-4 no-print"> 
                    <div className="text-center">
                        <Link to = {`/admin/${id}`}>
                            <button className="theme-btn" style={{width: "170px"}}>Back</button>
                        </Link>
                    </div>
                    <div className="text-center pt-2">
                    <PrintPDFButton doctorFirst={drName} shipping={shipping} production={production} license={license} street={drStreet} city={drCity} state={drState} zip={drZip} submittedDate={submittedDate} patientName={patientName} caseNumber={caseNum} product={product} type={type} shade={shade} note={note} gumShade={gumShade} crownTooth={crownTooth}/>
                    </div>
                    
                </div>
                <div className="row mt-3 ">
                    <div className="text-center">
                        <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
                    </div>
                </div>
                <div className="row form-group justify-content-center">
                    
                    <div className= "text-center col-4 pt-3">
                        <label  htmlFor="type"><h5>Reference Id</h5></label>
                        <input className="form-control" required id="refId" type="text" style={{borderRadius: "1rem", minHeight:"40px"}}  value={refId} onChange={(e)=>{setRefId(e.target.value), setShowClone(True)}}></input>
                        {(showClone)?
                            <div>
                                <button className="btn btn-primary" onClick={(e)=>{e.preventDefault(); cloneCase()}}>Clone Case</button>
                            </div>
                            :""}
                    </div>
                </div>
                <div className="row form-group justify-content-center">
                    <div className="text-center col-4 pt-3">
                    <label  htmlFor="status"><h5>Status</h5></label>
                        <select className="form-select" id="status"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Status" onChange={(e)=>{setCaseStatus(e.target.value)}}>
                                <option value={caseStatus}>{caseStatus}</option>
                                <option value="Created" onClick={()=>setCaseStatus("Created")}>Created</option>
                                <option value="Scanning" onClick={()=>setCaseStatus("Scanning")}>Scanning</option>
                                <option value="Design" onClick={()=>setCaseStatus("Design")}>Design</option>
                                <option value="Manufacturing" onClick={()=>setCaseStatus("Manufacturing")}>Manufacturing</option>
                                <option value="Pre-Finish" onClick={()=>setCaseStatus("Pre-Finish")}>Pre-Finish</option>
                                <option value="Finish" onClick={()=>setCaseStatus("Finish")}>Finish</option>
                                <option value="Ready to Ship" onClick={()=>setCaseStatus("Ready to Ship")}>Ready to Ship</option>
                                <option value="Shipped" onClick={()=>setCaseStatus("Shipped")}>Shipped</option>
                                <option value="Billed" onClick={()=>setCaseStatus("Billed")}>Billed</option>
                                <option value="Closed" onClick={()=>setCaseStatus("Closed")}>Closed</option>
                                <option value="Void" onClick={()=>setCaseStatus("Void")}>Void</option>
                            </select>
                    </div>
                </div>
                <div className="row form-group justify-content-center">
                    <div className="text-center col-4 pt-3">
                    <label  htmlFor="submittedDate"><h5>Submitted Date</h5></label>
                    <input className="form-control" required id="submittedDate" readOnly type="text" style={{borderRadius: "1rem", minHeight:"40px"}}  value={submissionDate} ></input>
                    </div>
                </div>
                <div className="row form-group justify-content-center">
                    <div className="text-center col-4 pt-3">
                    <label  htmlFor="type"><h5>Device Type</h5></label>
                    <input className="form-control" required id="type" readOnly type="text" style={{borderRadius: "1rem", minHeight:"40px"}}  value={type} ></input>
                    </div>
                </div>
                <div className="row form-group justify-content-center">
                    <div className="text-center col-4 pt-3">
                    <label  htmlFor="drName"><h5>Dr. Name</h5></label>
                    <input className="form-control" required id="drName" readOnly type="text" style={{borderRadius: "1rem", minHeight:"40px"}}  value={drName} onChange={(e)=>setDrName(e.target.value)}></input>
                    </div>
                </div>
                <div className="row form-group justify-content-center">
                    <div className="text-center col-4 pt-3">
                    <label  htmlFor="patientName"><h5>Patient Name</h5></label>
                    <input className="form-control" required id="patientName" readOnly type="text" style={{borderRadius: "1rem", minHeight:"40px"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
                    </div>
                </div>
                <div className="d-flex row pt-4 justify-content-center" >
                    <div className="col-4 form-group text-center pb-4 ">
                        <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
                        <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px"}} readOnly={true} value={crownTooth} onChange={(e)=>setToothInput(e.target.value)}></input>
                    </div>
                    <div className="col-9 col-lg-3 px-5 no-print" >
                    <svg className="no-print" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                                <path d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                                onClick={(e)=> toothHandler(e)} ></path>
                                <path d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                                <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
                                onClick={(e)=> toothHandler(e)}></path>
                                <path d="M374.43,109.84c3.85-4.81,9.51-7,16.91-6.51l-.14-.34c-7.82-.86-12.82.91-16.73,6.34Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M365.59,129.77l.45.85c-1.13-5.57.12-11.34,4-17.56l-.63.23C365.23,119.77,364.24,124.09,365.59,129.77Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M401.14,102.32c9.66,9.6,19.12,16.14,28.94,20a10.44,10.44,0,0,0,3.76.71,13.19,13.19,0,0,0,9.38-3.82,17.09,17.09,0,0,0,3.69-6.48c.77-2.58.44-5.86.15-8.75-.05-.52-.1-1-.14-1.49a68.75,68.75,0,0,0-3.21-15.61,60.53,60.53,0,0,0-2.11-5.73c-.3-.68-.61-1.32-.93-1.91a8.45,8.45,0,0,0-4.6-3.74v-.07l-.32,0a5.71,5.71,0,0,0-.58-.21,4.59,4.59,0,0,0-1.7-.09c-17.07-1.92-30.7,5.16-35.1,18.5h0a5.89,5.89,0,0,0-.26.7C397.25,97.19,399.28,100.25,401.14,102.32Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="7" 
                                onClick={(e)=> toothHandler(e)}></path>
                                <path d="M432.33,82.75c-11.12,1.48-19.73,5.91-25.61,13.64C412.22,87.21,421,82.84,432.33,82.75Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M444.52,86.59c.28.6.56,1.21.84,1.85a61.43,61.43,0,0,0,18.69,24.47,18.32,18.32,0,0,0,10.6,3.94h0c4.33,0,8.69-1.91,13-5.8l.09-.1c5.7-8.6,9.72-19.06,12.29-32a21.81,21.81,0,0,0,.36-7.89c-.31-1.82-.88-5.21-2.67-6.39a3.4,3.4,0,0,0-.69-.34h0c-20.31-8.75-37.58-6.72-51.34,6a4.86,4.86,0,0,0-1.73,1.36c-1.3,1.66-1.59,3.92-1.71,5.92C442,81.22,443.22,83.83,444.52,86.59Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="8" 
                                onClick={(e)=> toothHandler(e)}></path>
                                <path d="M560.55,78c-.1-2-.38-4.27-1.66-5.94a4.86,4.86,0,0,0-1.72-1.37C543.54,57.8,526.29,55.6,505.9,64.15h0a3.42,3.42,0,0,0-.7.33c-1.8,1.17-2.4,4.55-2.73,6.37a21.88,21.88,0,0,0,.28,7.88c2.44,12.93,6.36,23.43,12,32.09l.09.1c4.23,3.93,8.57,5.92,12.91,5.92h0A18.37,18.37,0,0,0,538.37,113a61.46,61.46,0,0,0,18.92-24.29c.29-.64.58-1.25.87-1.84C559.48,84.13,560.72,81.53,560.55,78Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="9" 
                                onClick={(e)=> toothHandler(e)}></path>
                                <path d="M604.23,94.81c-.08-.25-.17-.48-.26-.71h0c-4.27-13.38-17.83-20.59-34.92-18.84a4.86,4.86,0,0,0-1.7.07l-.58.21-.32,0v.07a8.5,8.5,0,0,0-4.64,3.7c-.32.59-.64,1.23-1,1.9-.82,1.82-1.49,3.74-2.17,5.71a69.17,69.17,0,0,0-3.35,15.58c-.05.47-.1,1-.16,1.49-.32,2.89-.68,6.16.07,8.75a17.14,17.14,0,0,0,3.62,6.51,13.15,13.15,0,0,0,9.34,3.91,10.44,10.44,0,0,0,3.77-.66c9.86-3.8,19.38-10.25,29.13-19.75C603,100.73,605.07,97.68,604.23,94.81Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="10" 
                                onClick={(e)=> toothHandler(e)}></path>
                                <path d="M605.61,146.07a16.23,16.23,0,0,1-3.3-.31c-3.32-.69-7.74-2.45-10-6.86-2.34-4.67-1.57-10.09-.66-14.8,1.66-8.55,6.63-23.51,21.25-27.6,3.61-1,8.36-1.22,14.16-.62a25.46,25.46,0,0,1,10.67,3.23c8.85,5.29,10.05,17.42,8.22,27a23.67,23.67,0,0,1-1.74,5.58,15.73,15.73,0,0,1-2.47,4,12.53,12.53,0,0,1-2.62,2l-.54.33c-4.82,3.06-10.53,4.48-15.51,5.57-3.6.79-7.3,1.42-11,1.89l-1.1.14A42.3,42.3,0,0,1,605.61,146.07Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="11" 
                                onClick={(e)=> toothHandler(e)}></path>
                                <path d="M629.22,186.51h-1.05c-2.44,0-4.23-1.49-6-2.92l-.48-.39c-3.76-3.06-6.18-6.14-7.41-9.42a14.41,14.41,0,0,1-.92-5.54,12.37,12.37,0,0,1,2.69-7.84c.58-.72,1.15-1.46,1.72-2.19,1-1.24,1.92-2.49,2.92-3.7a89.83,89.83,0,0,1,10.39-10.86,42.1,42.1,0,0,1,7.78-5.41,11.8,11.8,0,0,1,5.22-1.39,32.13,32.13,0,0,1,6.47.68l1.17.19a57,57,0,0,1,10.35,2.65c5.52,2,12.54,6,14.62,13.17a17.65,17.65,0,0,1-.11,9.31c-.79,3-2.5,8.53-5.17,11.08a41.62,41.62,0,0,1-15.89,9.27C646.76,186.11,637.7,186.51,629.22,186.51Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="12" 
                            onClick={(e)=> toothHandler(e)}></path>
                                <path d="M698.66,194.17a17.68,17.68,0,0,0-6.19-6.84,48,48,0,0,0-15-6.74c-6-1.51-11.6-1.31-16.21.6-6.53,2.69-12,7.6-15.51,11.06-1.39,1.36-3.2,3.16-5,5.11q-.54.6-1.11,1.2a25,25,0,0,0-2.63,3.08,13,13,0,0,0-1,1.69,14,14,0,0,0-1.1,9.74c1.8,6.84,8.46,12.82,15.17,13.61A48.76,48.76,0,0,0,656,227c1.51,0,3.11,0,5.2-.14a68.32,68.32,0,0,0,9.64-1.22c7-1.38,15.76-3.83,21.87-10.59a28.79,28.79,0,0,0,6.08-10.66C699.74,201.25,700.41,197.84,698.66,194.17Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="13" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M677.34,296.1h0l-.46,0a27.08,27.08,0,0,1-14.66-5.58l-.1-.1c-6.39-8.26-10.68-15.84-13.49-23.83A25.39,25.39,0,0,1,651,245a20.28,20.28,0,0,1,2-2.71c11.2-12.59,25.07-19.81,38.05-19.81a36.27,36.27,0,0,1,9.71,1.33c6.21,1.74,11,6.92,11.81,12.9a79.16,79.16,0,0,0,7.25,24.07c2.15,4.36.58,9.86-.79,13.62-1.86,5.12-6,7.81-9.85,9.77l-1,.51a143.94,143.94,0,0,1-14.29,6.67c-2.77,1.06-5.62,2-8.48,2.79-.6.17-1.26.39-2,.61A21.82,21.82,0,0,1,677.34,296.1Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="14" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M493.62,73.94l-1.09-.34c-14-3.73-28.66-2-42.88,5l.65-.48C464.89,69,479.54,67.89,493.62,73.94Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M728.63,323.7c-.37-1.8-.86-3.57-1.29-5.09a11.77,11.77,0,0,1-.35-2.45c0-.39,0-.8-.1-1.21a29.4,29.4,0,0,1,.05-5.47,23.4,23.4,0,0,0-.26-7.41,18.43,18.43,0,0,0-7.5-10.13,19.3,19.3,0,0,0-10-3.43,9.8,9.8,0,0,0-1.47.1c-10.4,1.62-21.5,5.37-33.94,11.47-4.28,2.4-6.34,6.83-6.12,13.15,0,1.5,0,3,0,4.47a83.19,83.19,0,0,0,1.06,10.89,27.19,27.19,0,0,0,.76,3.08c.09.34.19.68.29,1a11.06,11.06,0,0,1,.28,2.13,14.57,14.57,0,0,0,.24,2,19.36,19.36,0,0,0,10,13.27,23.27,23.27,0,0,0,10.52,2.3l1.41,0a52.7,52.7,0,0,0,11.89-2.26,121,121,0,0,0,15.7-5.77c.4-.18.84-.35,1.29-.53,1.78-.7,3.8-1.5,4.8-3.07a21.2,21.2,0,0,0,2.84-6.57A24.42,24.42,0,0,0,728.63,323.7Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="15" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M697.73,438.53a30.44,30.44,0,0,1-6.6-.77,76.67,76.67,0,0,1-11.51-3.87l-2.8-1.09-1.58-.61c-4.31-1.64-8.78-3.33-12.34-6.38a15.61,15.61,0,0,1-5.13-8.22c-.63-2.75-.21-6.06,1.28-10.12l.14,0a29.43,29.43,0,0,1,3.11-7.28c.7-1.29,1.42-2.62,2.06-4.07.45-1,.9-2.15,1.35-3.28,1.42-3.55,2.9-7.21,5.12-10a28.59,28.59,0,0,1,13.4-9.7c6.75-2.14,14.69-1.29,24.26,2.61s15.47,8.9,18,15.25c2.23,5.61,1.39,11.5.29,15.45-.94,3.36-2.88,6.35-4.75,9.24-.94,1.43-1.9,2.92-2.71,4.41-.54,1-1,2-1.57,3-2.83,5.46-5.76,11.11-11.47,13.69A20.74,20.74,0,0,1,697.73,438.53Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="18" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M704.14,471.94a28.76,28.76,0,0,0-.5-3.77c-.17-.91-.33-1.85-.43-2.77-.22-2.21-.42-4.43-.61-6.64-.07-.86-.1-1.72-.14-2.57-.12-2.8-.24-5.69-1.65-8.37-.28-.52-.6-1-.91-1.48-1.66-2.55-4.54-4.39-6.85-5.87a43.33,43.33,0,0,0-8.35-4.15,41.42,41.42,0,0,0-18.33-2.51c-4.94.47-11.77,1.74-16.31,5.09L650,439a1.48,1.48,0,0,0-.29.22c-6.86,6.28-10.53,16.3-13.76,25.14-1,2.87-2,5.58-3.08,8-2.84,6.55-1.41,16.3,5.84,20.64l.74.44c5.39,3.23,10.48,6.28,16.29,8.55a81.09,81.09,0,0,0,9.37,3c.67.17,1.35.37,2,.56a24,24,0,0,0,6.6,1.25h.13a16.35,16.35,0,0,0,7.7-2.2c4.71-2.58,8.55-6.67,12-10.71a66.52,66.52,0,0,0,7.24-10.45C702.94,479.59,704.34,476.19,704.14,471.94Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="19" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M685,485.33l1.07.54C686.42,486,686,485.73,685,485.33Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M673.29,457.85A17.62,17.62,0,0,1,672,446a.71.71,0,0,1,.84-.53,22.87,22.87,0,0,0,4.11.36c1,0,2.07-.05,3.18-.16a40.17,40.17,0,0,1-14.57-3.93,12.06,12.06,0,0,0,4.92,3.1.72.72,0,0,1,.47.84,18.65,18.65,0,0,0,1.33,12.64,25.57,25.57,0,0,0-10.45,10.34h0v0l0,.05A33.6,33.6,0,0,1,642,464.5c4.17,3.57,10.23,5.37,18,5.37.47,0,1,0,1.44,0a13.22,13.22,0,0,0,.67,10.27,8.93,8.93,0,0,0-1,.41c-3.54,1.81-5.77,5.64-6.83,11.66a19.58,19.58,0,0,0-8-.13,38.89,38.89,0,0,1,17.18,4.78,23.61,23.61,0,0,0-8.08-4.37c.69-5.94,3-9,6.27-11,5.22-3,19.22,2.08,23.37,3.83-7.94-4-15.91-7.13-21.84-5.56-1.63-3-1.81-6.44-.48-10.31l.11-.32c5.46-13.07,23.86-13.08,30.27-13C685.23,455.22,678.67,456,673.29,457.85Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M650.53,546.07c-11.39,0-21.43-4.83-30-14.44h0a14.59,14.59,0,0,1-3.45-11.87,24.49,24.49,0,0,1,10.21-16.22,24.16,24.16,0,0,1,16.54-3.71c6.92.81,13.61,3.71,19.8,6.71a24,24,0,0,1,10.93,11.79,19.1,19.1,0,0,1,.24,15.57,16.1,16.1,0,0,1-4,5.39c-1.44,1.27-5.16,4.33-8.72,5.24A46.22,46.22,0,0,1,650.53,546.07Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="20" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M638.47,514.84c1.73-2.4,4.46-3.91,8.09-4.49,2.64,2,7.41,3.66,13.5,5.31-7.48-2.79-13.62-5.71-15.8-9a4.21,4.21,0,0,0,1.26,2.82,12.44,12.44,0,0,0-7.94,4.77c-.13.19-.23.4-.36.59-1.62-2.26-4.24-3.6-7.44-4.43a15.44,15.44,0,0,1,6.49,4.85,1.11,1.11,0,0,1,.1,1.11c-1.58,3.52-1.85,8.26-.86,14.36a25.51,25.51,0,0,0-7.59-1.16h-.35a65.4,65.4,0,0,1,19,7.18,34.85,34.85,0,0,0-9.84-5.63C635.41,523.74,636,518.28,638.47,514.84Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M624.85,583.59c-12.59,0-20.46-8.39-23.38-24.92-.73-4.07-1.14-9.26,2.11-13.22,3.86-4.7,10.22-5.29,14.66-5.32h.34a50,50,0,0,1,16.91,3c6,2.14,9.94,5,12.12,8.84,2.75,4.78,5.34,10.47,3.69,16.42a16.43,16.43,0,0,1-6.4,8.81,28.27,28.27,0,0,1-7.81,4.23A41.17,41.17,0,0,1,624.85,583.59Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="21" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M612.54,562c2-6.66,6-10.2,12.17-10.79a1.6,1.6,0,0,1,1.12.37c2.55,2,7.39,3.4,11.89,4.48,0,0-9.69-3.68-11.78-5.85a11.37,11.37,0,0,1-1.71-3.68,3.81,3.81,0,0,0-.07,3,.54.54,0,0,1-.44.74c-5.86.85-9.89,4.45-12,10.74a.63.63,0,0,1-.92.35,6.6,6.6,0,0,0-3.16-1.12,42.25,42.25,0,0,1,10.73,12.35c-1.79-4.35-3.64-7.52-5.59-9.56A1,1,0,0,1,612.54,562Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M596.57,610.7c-1.3,0-2.59-.08-3.68-.16a41,41,0,0,1-12-2.69c-3.72-1.56-5.84-4.61-6.49-9.33a67,67,0,0,1-.73-20.39c1.07-7.59,4.75-11.29,11-10.94,10.61,2.54,19.47,6.87,26.45,12.87a17.85,17.85,0,0,1,4.65,6.71,9.29,9.29,0,0,1,.94,3.84,20,20,0,0,1-1.86,6.29l0,.14a29.13,29.13,0,0,1-3,5.44,17.24,17.24,0,0,1-15.3,8.22Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="22" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M582.94,603.71a50.27,50.27,0,0,0,27.26-16.28C605,596.15,595.81,601.63,582.94,603.71Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M575.53,603.58l-.07-.11a86.62,86.62,0,0,0-18.85-19.53,12.47,12.47,0,0,0-1.11-.66,10.34,10.34,0,0,0-12.34,1.62,9,9,0,0,0-2,3,27.39,27.39,0,0,0-1.27,3.62,65.46,65.46,0,0,0-1.5,6.9l0,.29a161,161,0,0,0-2,16.14c.37,4.08,2.28,6.65,5.64,7.61a40.26,40.26,0,0,0,14.8,3.25c7.85,0,14.26-3.52,19.09-10.51C577.49,612.22,577.36,608.32,575.53,603.58Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="23" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M572,608.49a110.93,110.93,0,0,1-27.27,8.29h.12C555.25,616.78,564.39,614,572,608.49Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M535.2,611a10.29,10.29,0,0,0-.73-2.15c-.78-1.65-1.42-3.38-2.17-5a83.78,83.78,0,0,0-4-8,44.15,44.15,0,0,0-4.1-5.94c-.21-.26-.43-.51-.65-.76-5.33-6.08-10.76-5.48-15.71,1.79a52.38,52.38,0,0,0-7.6,19c-.25,1.23-.48,2.5-.67,3.77a10.19,10.19,0,0,0,0,4.15,7.71,7.71,0,0,0,4.71,5.62,33.48,33.48,0,0,0,12.28,3.52c.48,0,1,.05,1.45.05,4,0,7.91-1,12.72-3.27a10,10,0,0,0,3.23-2.2c1.88-2.08,1.84-5.27,1.63-7.88A19.65,19.65,0,0,0,535.2,611Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="24" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M460.8,615.79c-.26,2.61-.35,5.8,1.48,7.91a10.13,10.13,0,0,0,3.2,2.26c4.77,2.35,8.67,3.43,12.66,3.5.48,0,1,0,1.45,0a33.42,33.42,0,0,0,12.34-3.3,7.72,7.72,0,0,0,4.81-5.53,10.09,10.09,0,0,0,.1-4.15c-.17-1.27-.37-2.54-.6-3.78A52.15,52.15,0,0,0,489,593.6c-4.82-7.36-10.24-8.06-15.68-2.08-.23.25-.45.49-.66.74a44.8,44.8,0,0,0-4.2,5.87,81.47,81.47,0,0,0-4.2,7.88c-.78,1.66-1.46,3.37-2.27,5a11,11,0,0,0-.76,2.13A19.86,19.86,0,0,0,460.8,615.79Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="25" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M420.44,616.64c4.7,7.08,11,10.71,18.9,10.86a40.47,40.47,0,0,0,14.85-3c3.37-.9,5.34-3.43,5.78-7.51a157.59,157.59,0,0,0-1.68-16.17l-.05-.29a62.68,62.68,0,0,0-1.37-6.92,27.29,27.29,0,0,0-1.2-3.65,9.26,9.26,0,0,0-1.94-3,10.35,10.35,0,0,0-12.31-1.84c-.38.2-.76.41-1.12.64a86.86,86.86,0,0,0-19.2,19.18l-.07.12C419.11,609.76,418.91,613.66,420.44,616.64Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="26" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M702.2,323.49a9,9,0,0,1-3-.61,8.1,8.1,0,0,1-3-2.77c-.84-1.15-1.79-2.24-2.58-3.42-1.79-2.64-3.32-5.69-3.42-8.94a9.86,9.86,0,0,1,.24-2.54,12.79,12.79,0,0,1,.93-2.48s1-.56,1.21-.67a25.44,25.44,0,0,0,4.55-3.29c-3,1.53-6.05,3.83-12.28,3.89a13.21,13.21,0,0,0,3.13.39,11.35,11.35,0,0,0,2.18-.22c-3.09,7.59,2.49,14.93,8.13,21.26.24.27-.55,2.38-.66,2.75a27,27,0,0,1-1.08,2.88,31.85,31.85,0,0,1-3.13,5.35c-5.74-1.49-16.49-.63-16.5.15a50.78,50.78,0,0,1,16.61,1A35,35,0,0,1,706,341.9a10.35,10.35,0,0,0-4.37,3.59c3.55-3.3,8.39-4.33,14.23-3.61a34.05,34.05,0,0,0-7.22-.6,4.14,4.14,0,0,1-2.63-.72,36,36,0,0,0-11.33-5.2,27.38,27.38,0,0,0,4.83-11.2,25.17,25.17,0,0,0,17.82-3.69,25.55,25.55,0,0,0,4.78-4C719.66,319,711.54,324.41,702.2,323.49Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M694.21,281.74a32.11,32.11,0,0,1-13.51-7.41c1.13-1.33,1.43-3.47,1.67-5.17,0-.37.1-.73.15-1a71.36,71.36,0,0,0,1-9.22,3.39,3.39,0,0,0,.93.12l.52,0a67.76,67.76,0,0,0,7.66-.88,73.85,73.85,0,0,0,7.79-1.79,80.7,80.7,0,0,0,7.85-2.69c.63-.25,1.25-.53,1.88-.77-.64.15-1.32.2-2,.32s-1.34.26-2,.41c-1.33.29-2.65.64-3.95,1-2.18.67-4.32,1.42-6.55,1.95a45.46,45.46,0,0,1-5.68.94c-.79.08-1.58.15-2.38.21s-1.81.17-2.71.17a2.47,2.47,0,0,1-1.4-.18,2.76,2.76,0,0,1-.85-1.27l-.08-.19a11.76,11.76,0,0,0-3.21-4.19,22.23,22.23,0,0,0-2.39-1.66,22.67,22.67,0,0,1-2-1.38,35.55,35.55,0,0,1,2.32-14,2.34,2.34,0,0,1,1.14-1.2c.53-.26,1.05-.53,1.56-.84a10.93,10.93,0,0,0,1.38-1.08,23.55,23.55,0,0,1-9.3,2.65,9.94,9.94,0,0,0,2.49.26,8.24,8.24,0,0,0,2.12-.31c-.1,0-.29.72-.34.83l-.33.89c-.21.59-.41,1.19-.59,1.79a36,36,0,0,0-.89,3.72c-.2,1-.34,2.07-.45,3.11,0,.53-.09,1.05-.13,1.58,0,.26,0,.53,0,.79a4.44,4.44,0,0,1,0,.82,3.36,3.36,0,0,1-.89-.71,7.39,7.39,0,0,1-.82-.86,17.77,17.77,0,0,1-1.82-3.06,24.3,24.3,0,0,0-2.12-3.2q-.3-.41-.63-.78a7.71,7.71,0,0,0,.55,1.79,8.61,8.61,0,0,0,.57,1.28c.34.6.73,1.56,1.17,2.38a12.14,12.14,0,0,0,1.43,2.32,25.76,25.76,0,0,0,3.62,3.15c.48.33,1,.64,1.48,1a22.35,22.35,0,0,1,2.28,1.57,10.71,10.71,0,0,1,2.9,3.8l.08.19a4.7,4.7,0,0,0,.85,1.41h-.06a69.09,69.09,0,0,1-1,9.61c-.06.33-.11.69-.17,1.08-.31,2.22-.69,5-2.75,5.41l-1.3.27c-4.52,1-6.9,1.81-11.5,1.14l-4-.48a21.54,21.54,0,0,0,6.8,1.67,43.41,43.41,0,0,0,8.88-1.26l1.29-.27a3.44,3.44,0,0,0,1.11-.44c3.71,3.35,8.59,5.85,14.85,7.65a37.93,37.93,0,0,1-4.79,1.77l-3,1.2A29.38,29.38,0,0,0,693,284a30.44,30.44,0,0,0,5.87-2.95,16.72,16.72,0,0,0,4.35-3.86c.09-.12.38-.42.34-.55a5.24,5.24,0,0,0-1.41,1.12c-.53.48-1,.78-1.46,1.17a32,32,0,0,1-3,2.08,7.53,7.53,0,0,1-1.36.65A3.63,3.63,0,0,1,694.21,281.74Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M667.72,210.8c.1-4.24-1.89-7.91-5.91-10.94a33.34,33.34,0,0,0,10.43-11.13l-1.76,1.89c-6.31,7.34-10.29,10.42-19.24,12.14l-2.86.36c.63,0,1.25.08,1.87.08a21.43,21.43,0,0,0,10.53-2.72c4.15,3,6.05,6.49,5.81,10.71a17.79,17.79,0,0,0-8.5,7.41l2.22-2a20.77,20.77,0,0,1,7.09-4.84s.27-.05.27-.09c3.13-1.09,6.7-1.14,11.87-.44a6.74,6.74,0,0,0,1,.08l2.31,0C676.91,209.65,671.9,209.47,667.72,210.8Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M646.47,171.6c.42-6-2.6-10.79-9-14.39a43.45,43.45,0,0,0,12.25-9.86l-2.6,1.83c-7.52,5.87-12.44,8.77-21.42,11.42l-1.23.75a37.68,37.68,0,0,0,11.83-3.54c6.72,3.57,9.67,8.26,9,14.3a19.79,19.79,0,0,0-7.81,7l2-1.9c6.34-5.37,11.49-6,20.26-5.81l1.61-.16C655.55,169.84,650.62,170,646.47,171.6Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M628,110c-3.81-4.85-9.45-7.14-16.86-6.67l.15-.34c7.83-.78,12.81,1,16.66,6.51Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M636.67,130.06l-.46.85c1.19-5.56,0-11.35-3.79-17.6l.63.23C637.12,120.06,638.07,124.39,636.67,130.06Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M570.13,82.9C581.24,84.49,589.8,89,595.6,96.79,590.19,87.56,581.46,83.1,570.13,82.9Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M509.18,73.75l1.09-.33c14-3.6,28.68-1.77,42.83,5.43l-.64-.49C538,69,523.32,67.84,509.18,73.75Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M394.12,610.91a18.84,18.84,0,0,1-9.41-7.62,28.72,28.72,0,0,1-2.86-5.49l-.06-.13a20.78,20.78,0,0,1-1.74-6.33,9.23,9.23,0,0,1,1-3.82,17.7,17.7,0,0,1,4.77-6.62c7.09-5.88,16-10,26.68-12.39,6.28-.24,9.89,3.52,10.82,11.13a67.38,67.38,0,0,1-1.1,20.38c-.74,4.7-2.91,7.71-6.66,9.2a40.57,40.57,0,0,1-12,2.47c-1.1.06-2.39.12-3.69.1A18.57,18.57,0,0,1,394.12,610.91Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="27" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M359.88,581.83a28.51,28.51,0,0,1-7.73-4.38,16.43,16.43,0,0,1-6.24-8.92c-1.55-6,1.14-11.62,4-16.36,2.26-3.76,6.28-6.58,12.29-8.61a49.71,49.71,0,0,1,17-2.72h.34c4.44.12,10.78.82,14.55,5.59,3.18,4,2.68,9.19,1.88,13.25-3.22,16.48-11.24,24.72-23.83,24.49A41,41,0,0,1,359.88,581.83Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="28" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M347.81,546.21a45.89,45.89,0,0,1-12.25-1.76c-3.55-1-7.22-4.11-8.63-5.4a16.27,16.27,0,0,1-3.94-5.46,19.19,19.19,0,0,1,.53-15.57,24,24,0,0,1,11.14-11.58c6.25-2.89,13-5.67,19.92-6.36a24.17,24.17,0,0,1,16.47,4,24.48,24.48,0,0,1,9.91,16.4,14.56,14.56,0,0,1-3.66,11.81h0C368.79,541.55,358.9,546.21,347.81,546.21Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="29" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M298,482.61a66.06,66.06,0,0,0,7,10.59c3.37,4.1,7.14,8.26,11.8,10.92a16.49,16.49,0,0,0,7.66,2.34h.13a24,24,0,0,0,6.62-1.12c.69-.19,1.37-.37,2-.53A80.47,80.47,0,0,0,342.7,502c5.86-2.16,11-5.12,16.45-8.25l.74-.43c7.33-4.21,8.93-13.94,6.22-20.53-1-2.41-1.94-5.14-2.94-8-3.07-8.89-6.55-19-13.3-25.39l-.28-.22-.1-.07c-4.47-3.43-11.28-4.82-16.21-5.38a41.55,41.55,0,0,0-18.37,2.17,44.22,44.22,0,0,0-8.42,4c-2.34,1.44-5.25,3.23-7,5.75-.31.46-.64.94-.93,1.46-1.46,2.65-1.63,5.54-1.8,8.34-.05.85-.1,1.71-.19,2.57-.23,2.21-.46,4.42-.73,6.62-.11.92-.29,1.86-.47,2.76a27.27,27.27,0,0,0-.58,3.76C294.55,475.35,295.88,478.78,298,482.61Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="30" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M302.32,437.82a21.06,21.06,0,0,1-9-1.86c-5.66-2.69-8.49-8.39-11.22-13.91-.5-1-1-2-1.51-3-.79-1.51-1.72-3-2.63-4.46-1.82-2.92-3.71-5.94-4.58-9.32-1-4-1.77-9.87.56-15.45,2.64-6.3,8.61-11.18,18.27-14.91s17.59-4.44,24.3-2.17a28.52,28.52,0,0,1,13.23,9.94c2.17,2.81,3.57,6.5,4.93,10.08.43,1.13.86,2.25,1.29,3.3.61,1.46,1.31,2.8,2,4.1a29.53,29.53,0,0,1,3,7.34l.13,0c1.43,4.08,1.79,7.4,1.11,10.14a15.67,15.67,0,0,1-5.28,8.12c-3.63,3-8.13,4.6-12.48,6.16l-1.57.57-2.8,1a76.33,76.33,0,0,1-11.6,3.67A31,31,0,0,1,302.32,437.82Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="31" onClick={(e)=> toothHandler(e)}></path>
                                <path d="M303.3,380.41a8.71,8.71,0,0,0,5.32-1.78,20,20,0,0,1-9.16.86A9.71,9.71,0,0,0,303.3,380.41Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M325.32,425.59a21.4,21.4,0,0,0-7.86,1.18,22.47,22.47,0,0,0-6.84,4C312.72,429,322.25,425.6,325.32,425.59Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M318.71,427.18c.72-6.23-1.51-12-6.62-17.14l-.78.77c4.86,4.9,7,10.37,6.31,16.24Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M286.77,416.71c9.52,0,18-2,25.21-6.15l-.55-1C302.76,415.09,292.48,416.17,286.77,416.71Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M311.77,410.78a6.47,6.47,0,0,0,1.23-6.52c5.77.89,11.79-.34,18.86-3.85-4,1.65-13.56,4.82-19.59,2.61l-1-.2.39.94c1,2.5.78,4.55-.72,6.3Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M311.64,403.72l1.05-.33a23.66,23.66,0,0,0-9-12.68l-.19-.13-.22,0c-8.46,2.08-17.9.51-19.07.38a46.6,46.6,0,0,0,19,.74A22.67,22.67,0,0,1,311.64,403.72Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M303.94,391.08c1.59-2.95,2-6.64,1.15-11.29L304,380c.77,4.41.43,7.87-1,10.59Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M313.68,484.84l-1.08.52C312.28,485.44,312.72,485.22,313.68,484.84Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M325.93,457.58a17.64,17.64,0,0,0,1.49-11.84.72.72,0,0,0-.83-.55,21.43,21.43,0,0,1-4.12.29c-1,0-2.06-.09-3.18-.22a40,40,0,0,0,14.64-3.66,12,12,0,0,1-5,3,.71.71,0,0,0-.48.83,18.68,18.68,0,0,1-1.57,12.62,25.41,25.41,0,0,1,10.26,10.52h0v0l0,.06a33.74,33.74,0,0,0,19.9-3.87c-4.23,3.49-10.33,5.18-18.15,5l-1.43-.06a13.25,13.25,0,0,1-.86,10.26c.32.13.64.26.95.42,3.51,1.88,5.67,5.75,6.62,11.79a19.45,19.45,0,0,1,8,0A38.86,38.86,0,0,0,335,496.73a23.57,23.57,0,0,1,8.15-4.22c-.58-5.95-2.81-9.1-6.07-11.08-5.16-3.12-19.25,1.73-23.43,3.41,8-3.81,16-6.85,21.93-5.16,1.69-2.95,1.93-6.41.67-10.3l-.1-.32c-5.23-13.17-23.62-13.51-30-13.57C314,454.73,320.58,455.61,325.93,457.58Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M359.7,515.19c-1.68-2.43-4.38-4-8-4.63-2.68,2-7.48,3.51-13.6,5.06,7.53-2.66,13.73-5.47,16-8.76a4.21,4.21,0,0,1-1.31,2.79,12.44,12.44,0,0,1,7.85,4.92c.13.18.23.39.35.59,1.66-2.23,4.31-3.52,7.52-4.29a15.34,15.34,0,0,0-6.58,4.73,1.1,1.1,0,0,0-.12,1.11c1.52,3.54,1.7,8.29.6,14.37a25.88,25.88,0,0,1,7.61-1h.35a65.73,65.73,0,0,0-19.08,6.83,34.73,34.73,0,0,1,9.94-5.44C362.6,524.15,362.11,518.67,359.7,515.19Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M384.78,562.83c-1.9-6.7-5.82-10.31-12-11a1.59,1.59,0,0,0-1.13.35c-2.59,2-7.45,3.27-12,4.27,0,0,9.75-3.51,11.88-5.64a11.34,11.34,0,0,0,1.78-3.65,3.78,3.78,0,0,1,0,3,.55.55,0,0,0,.43.74c5.85,1,9.81,4.63,11.81,10.95a.62.62,0,0,0,.91.37,6.75,6.75,0,0,1,3.18-1.06,42.12,42.12,0,0,0-10.95,12.15c1.87-4.31,3.78-7.45,5.75-9.45A1,1,0,0,0,384.78,562.83Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M413.62,605.05a50.19,50.19,0,0,1-27-16.77C391.71,597.09,400.78,602.74,413.62,605.05Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M424.5,610a110.51,110.51,0,0,0,27.12,8.78h-.12C441.06,618.62,432,615.66,424.5,610Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M491.53,617.47a33.16,33.16,0,0,1-12.92,2.64,23.71,23.71,0,0,1-11.39-3.1A49.43,49.43,0,0,0,491.53,617.47Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M697.31,381.1a8.65,8.65,0,0,1-5.28-1.87,20.05,20.05,0,0,0,9.14,1A9.86,9.86,0,0,1,697.31,381.1Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M674.48,425.88a21.27,21.27,0,0,1,7.83,1.32,22.4,22.4,0,0,1,6.76,4.11C687,429.47,677.55,426,674.48,425.88Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M681.05,427.59c-.6-6.24,1.73-12,6.94-17l.76.79c-5,4.81-7.17,10.23-6.6,16.12Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M713.18,417.7c-9.52-.15-18-2.37-25.09-6.61l.56-.94C697.22,415.79,707.48,417.05,713.18,417.7Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M688.29,411.31a6.45,6.45,0,0,1-1.11-6.53c-5.79.78-11.79-.55-18.79-4.19,4,1.72,13.47,5.06,19.54,3l1-.18-.41.94c-1.07,2.47-.87,4.53.61,6.3Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M688.55,404.27l-1-.36a23.68,23.68,0,0,1,9.22-12.52l.18-.12.22,0c8.43,2.24,17.9.84,19.07.73a46.58,46.58,0,0,1-19.05.39A22.63,22.63,0,0,0,688.55,404.27Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M696.47,391.76c-1.53-3-1.84-6.67-.94-11.31l1.08.21c-.85,4.39-.57,7.85.84,10.59Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M504.82,614.72a33.06,33.06,0,0,0,12.86,2.87,23.64,23.64,0,0,0,11.45-2.9A49.27,49.27,0,0,1,504.82,614.72Z" transform="translate(-270.52 -59.04)"></path>
                            </svg>
                    </div>
                </div>
                <div className="row form-group text-center justify-content-center mt-5">
                    <div className= "col-8 col-lg-4">
                        <label  htmlFor="shade"><h5>Shade</h5></label>
                        <input className="form-select" id="shade"  readOnly style={{borderRadius: "1rem", minHeight:"40px"}} value={shade} aria-label="Shade">

                        </input>
                    </div>
                </div>
                {(gumShade)?
                <div className="row form-group text-center justify-content-center mt-5">
                    <div className= "col-8 col-lg-4">
                    <label  htmlFor="gum shade"><h5>Gum Shade</h5></label>
                        <input className="form-select" id="gum shade"  style={{borderRadius: "1rem", minHeight:"40px"}} value={gumShade} aria-label="Gum Shade">

                    </input>
                    </div>
                </div>
                :""}
                
                <div className="row form-group text-center justify-content-center mt-5">
                    <div className= "col-8 col-lg-4">
                        <label  htmlFor="product"><h5>Product</h5></label>
                        <input className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px"}} value={product} aria-label="Product">

                        </input>
                    </div>
                </div>
                
                <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    {(type === "implantHybridDenture")?
                    <label  htmlFor="finish"><h5>MUA Connection</h5></label>
                    :
                    <label  htmlFor="finish"><h5>Finish</h5></label>
                    }
                    <input className="form-select" id="finish"  readOnly style={{borderRadius: "1rem", minHeight:"40px"}} aria-label="Finish" value={finish}>
                        
                        {/* <option value="Polished" onClick={()=>setFinish("Polished")}>Polished</option>
                        <option value="Stain and Glaze" onClick={()=>setFinish("PMMA Temporary")}>Stain and Glaze</option> */}
                    </input>
                </div>
            </div>
                {/* <div className="row form-group justify-content-center mt-5">
                    <div className="text-center col-8 col-lg-4 pt-3">
                    <label  htmlFor="photoUpload"><h5>Upload Photos</h5></label>
                    <input className="form-control" required id="photoUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={photoName} onChange={(e)=>{[...photoName, setPhotoName(e.target.value)]; setPhotos([...photos, e.target.files[0]])}}></input>
                    </div>
                    
                </div>
                <div className="row form-group justify-content-center mt-5">
                    <div className="text-center col-8 col-lg-4 pt-3">
                    <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
                    <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]])}}></input>
                    </div>
                    
                </div> */}
                <div className="row form-group justify-content-center mt-5 no-print">
                    <div className="text-center col-8 col-lg-4">
                        <button className="btn btn-primary" onClick={(e)=>{e.preventDefault();downloadObject()}}>Download Scans/Photos</button>
                    </div>
                </div>
    
                <div className="row form-group justify-content-center mt-3">
                    <div className="text-center col-8 col-lg-4 pt-3">
                    <label htmlFor="Notes" className="form-label" ><h5>Prescription Information</h5></label>
                    <textarea className="form-control" id="Notes" rows="7"  readOnly value={note} onChange={(e)=>setNote(e.target.value)}></textarea>
               
                    </div>
                </div>

                <div className="row form-group justify-content-center mt-3">
                    <div className="text-center col-8 col-lg-4 pt-3">
                    <label htmlFor="Production" className="form-label" ><h5>Production</h5></label>
                    <input className="form-control" id="Production" rows="2"  readOnly value={production} ></input>
               
                    </div>
                </div>

                <div className="row form-group justify-content-center mt-3">
                    <div className="text-center col-8 col-lg-4 pt-3">
                    <label htmlFor="Price" className="form-label" ><h5>Price</h5></label>
                    <input className="form-control" id="Price" rows="3"  readOnly value={price} ></input>
               
                    </div>
                </div>
                <div className="row form-group justify-content-center mt-3 no-print">
                    <div className="text-center col-8 col-lg-4 pt-3">
                    <button className="btn btn-primary" onClick={(e)=>{e.preventDefault(); updateCase(); window.location.href = `/admin/${id}`}}>Update Case</button>
                    </div>
                </div>
                <div className="row form-group justify-content-center mt-3 no-print">
                    <div className="text-center col-8 col-lg-4 pt-3">
                    <button className="btn btn-primary" onClick={(e)=>{e.preventDefault(); shippoTest2()}}>Get Rates</button>
                    </div>
                </div>
                <div className="row justify-content-center mt-3">
                    {rates.map((item, index) => {
                        return (
                            <div className="col-2" style={{border: "black 1px solid"}}key={index} onClick={()=> {console.log(item); getLabel(item)}}>
                                <div>{item.amount}</div>
                                <div>{item.provider}</div>
                                <div>{item.servicelevel.name}</div>
                            </div>
                            
                    )})}
                </div>
                <div className="row form-group justify-content-center mt-3 no-print">
                    {(labelUrl)?
                    <div className="text-center col-8 col-lg-4 pt-3">
                    <button className="btn btn-primary" onClick={(e)=>{e.preventDefault(); window.open(labelUrl, '_blank'); }}>
                        Label
                    </button>
                    </div>
                     :""   }
                </div>
                
               
                
                
            
            </form>
                
            </>)
}
