import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import KPDLogo from "../../img/KPD-Logo.png"
import { STLExporter} from 'three/addons/exporters/STLExporter.js';
import {STLLoader} from "../../../../node_modules/three/examples/jsm/loaders/STLLoader"
import AWS from 'aws-sdk';

import Zirc from "../../img/Crown.png"
import ZircV from "../../img/Veneer.png"
import Partial from "../../img/TCS Unbreakable Partial Denture.png"
import Denture from "../../img/Denture.png"
import Implant from "../../img/Implant.png"
import NightGuard from "../../img/NightGuard.png"
import CustomTray from "../../img/CustomTray.png"
import WaxRim from "../../img/WaxRim.png"
import SIAS from "../../img/SIAS1.png"

import "../../styles/createOrder.css"

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';


export const CreateOrder = props => {


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
    const [shade, setShade] = useState("")
    const [gumShade, setGumShade] = useState("")
    const [finish, setFinish] = useState("N/A")
    const [page, setPage] = useState(props.page)
    const [bridge, setBridge] = useState('false')
    const[bridgeTooth, setBridgeTooth] = useState([])
    const [note, setNote] = useState("")
    const [type, setType] = useState("")
    const [lowerArch, setLowerArch] = useState(false)
    const [upperArch, setUpperArch] = useState(false)
    const [finalPrice, setFinalPrice] = useState(0)
    const [shipping, setShipping] = useState("Standard")
    const [production, setProduction] = useState("Standard")
    const [loading, setLoading] = useState(false);
    const [labelUrl, setLabelUrl] = useState("");
    const [waiting, setWaiting] = useState(false);
    const [model3D, setModel3D] = useState("No")
    const [price3, setPrice3] = useState(0)
    let price = 0;
    let price2 = 0;
    
    const [rates, setRates] = useState([])
    const [selectedRate2, setSelectedRate2] = useState()
    

    let total = price + price2
    const reader = new FileReader();
    let id = sessionStorage.getItem("id");
    let stl_urls = []
    let photo_urls = []
    const url = process.env.BACKEND_URL

    const pricePackage1 = {
        Zirconia : 60,
        PMMATemp : 35,
        StainGlaze: 20,
        CustomTray: 35,
        PartialTryIn: 35,
        DentureTryIn: 50,
        WaxRim: 50,
        TCSUnbreakable: 250,
        Denture: 250,
        PremiumDenture: 100

    }

    function sentToSlack(){

        let message = {
            "msg": `New Case Uploaded #${caseNum} from ${props.practice}!`,
        }

        const options = {
            method:"POST",
            withCredntials: true,
            credentials: 'include',
            
            headers:{
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },
            body: JSON.stringify(message)
            
            
        }
        fetch(`${url}/slack`, options)
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
            
        });
        
       

    }


    async function getUPSRate() {
        const options = {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },
            
        };
        try {
            const response = await fetch(`${url}/shippo/get_rates_kpd_ups/${id}`, options);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Process and update rates state
            const newRates = data.rates.map(rate => rate); // Simplified array copy
            setRates(newRates);
            
            // Return the rates data to use it later
            return data.rates;
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching rates. Please try again later.');
            // Return an empty array or handle as needed if there is an error
            return [];
        }
    }
    
    async function getUPSLabel(rates2) {
        // setSelectedRate2(rates.filter(rate => rate.servicelevel.token === "ups_ground"))
        // console.log(selectedRate2)


        const userInfo = {
            "rate": rates2.find(rate => rate.servicelevel.token === "ups_ground")
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
    
        try {
            const response = await fetch(`${url}/shippo/get_label`, options);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Update label state
            setLabelUrl(data);
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching the label. Please try again later.');
        }
    }
    
    async function UPSLabel() {
        const rates2 = await getUPSRate();  // Ensure this completes before proceeding
        console.log(rates)
        if (rates2.length > 0) { // Only proceed if rates were successfully fetched
            // Assuming you need to select a rate from the rates array
            // const selectedRate = rates[0]; // Example: selecting the first rate
            await getUPSLabel(rates2);  // Fetch the label based on the selected rate
        }
       
    }
    
    // Call executeTasks to start the process
    // executeTasks();
    

    function calculateArches(){
        setUpperArch(false)
        setLowerArch(false)
        for (let i = 0; i < crownTooth.length; i++){
            let tooth = crownTooth[i]
            
            if (tooth < 16){
                setUpperArch(true)
            }
            
            if (tooth> 17){
                setLowerArch(true)
            }
           
    }}


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

//testing new
const s3Client = new S3Client({
    endpoint: "https://nyc3.digitaloceanspaces.com", // Find your endpoint in the control panel, under Settings. Prepend "https://".
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    region: "nyc3", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (for example, nyc3).
    credentials: {
        accessKeyId: process.env.SPACES_KEY, // Access key pair. You can create access key pairs using the control panel or API.
        secretAccessKey: process.env.SPACES_SECRET_KEY // Secret access key defined through an environment variable.
    }
});



const uploadObject = async () => {
    try {
        console.log(stlFile.length);
        const uploadedFiles = [];

        for (let i = 0; i < stlFile.length; i++) {
            const params = {
                Bucket: "case-scans",
                Key: `${caseNum}/${stlFile[i].name}`,
                Body: stlFile[i],
                ACL: "private",
                Metadata: {
                    "x-amz-meta-my-key": `${caseNum}`
                },
                ContentType: "text/plain"
            };

            

            const data = await s3Client.send(new PutObjectCommand(params));
            console.log("Successfully uploaded object: " + params.Bucket + "/" + params.Key);
            uploadedFiles.push(data);
        }

        return uploadedFiles;
    } catch (err) {
        console.log("Error", err);
        return [];
    }
};

const uploadPictures = async () => {
    try {
        console.log(photos.length);
        const uploadedPhotos = [];

        for (let i = 0; i < photos.length; i++) {
            const params = {
                Bucket: "case-scans",
                Key: `${caseNum}/${photos[i].name}`,
                Body: photos[i],
                ACL: "private",
                Metadata: {
                    "x-amz-meta-my-key": `${caseNum}`
                },
                ContentType: "text/plain"
            };

            

            const data = await s3Client.send(new PutObjectCommand(params));
            console.log("Successfully uploaded photo: " + params.Bucket + "/" + params.Key);
            uploadedPhotos.push(data);
        }

        return uploadedPhotos;
    } catch (err) {
        console.log("Error", err);
        return [];
    }
};

  
  
  // Step 5: Call the uploadObject function.
  

    
//////////////////////////////////////////////////////////////////////////
AWS.config.update({
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET_KEY,
  endpoint: 'https://case-scans.nyc3.cdn.digitaloceanspaces.com', // Change to your Space's endpoint
 
});

// Assuming stlFile is an array of file paths to STL files


// Function to upload STL files to DigitalOcean Spaces
// const uploadSTLFilesToSpaces = async () => {
//     try {
//         // Loop through each STL file
//         for (const stlF of stlFile) {
//             // Set up the parameters for uploading to DigitalOcean Spaces
//             const params = {
//                 Bucket: 'case-scans',
//                 Key: `${caseNum}/${stlF.name}`, // Specify the key (path) under which the file will be stored
//                 Body: stlF, // Provide the File object directly
//                 ContentType: 'application/sla', // Specify the content type of the file
//                 ACL: 'public-read' // Optionally, set the ACL (Access Control List) to control access permissions
//             };

//             // Upload the file to DigitalOcean Spaces
//             await s3.putObject(params).promise(); // Using promise to await the upload operation
//             console.log(`${stlF.name} uploaded successfully`);
//         }
//     } catch (err) {
//         console.error('Error uploading files:', err);
//     }
// };

// const s3 = new AWS.S3();

// const uploadFile = (file) => {
//     // Create a FormData object and append the file to it
//     const formData = new FormData();
//     formData.append('file', file);
  
//     // Extract the Blob object from FormData
//     const blob = formData.get('file');
  
//     const params = {
//       Bucket: 'case-scans',
//       Key: caseNum ? `${caseNum}/${file.name}` : file.name,
//       Body: blob,
//       ContentType: file.type, // Set the Content-Type header
//     };
  
//     // Use the putObject method to upload the file
//     s3.putObject(params, (err, data) => {
//       if (err) {
//         console.error('Error uploading file:', err);
//       } else {
//         console.log('File uploaded successfully:', data);
//       }
//     });
//   };

    


    const uploadCase = async () => {

        if (!patientName) {
            alert("Please enter patient name");
            return;
        }
        if (!product) {
            alert("Please select a product");
            return;
        }
        if (!crownTooth) {
            alert("Please select at least one tooth");
            return;
        }

        setLoading(true);
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });
        await uploadObject();
        await uploadPictures();
        setLoading(false);
        
        const url = process.env.BACKEND_URL
            // (type === "crown")?
            // setType("Crown"):
            // (type === "veneer")?
            // setType("Veneer"):
            // (type === "partial")?
            // setType("Partial"):
            // (type === "denture")?
            // setType("Denture"):
            // (type === "implant")?
            // setType("Implant"):
            // (type === "removeableAppliances")?
            // setType("Removeable Appliances"):
            // (type === )
       


            const updateCase = {
                "stl_urls" : fileName,
                "photos": photoName,
                "case": caseNum,
                "name": patientName,
                "product": product,
                "teeth": crownTooth,
                "finish": finish,
                "shade": shade,
                "note": note,
                "status": "Submitted",
                "type": type,
                "gum_shade": gumShade,
                "price": finalPrice,
                "shipping": shipping,
                "production": production,
                "model3D": model3D,
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
        
        sentToSlack()
        }
      ;

      

    // useEffect(()=>{console.log(stlFile)})

    // useEffect(()=> console.log(crownTooth),[crownTooth])
    // useEffect(()=> {
    //     if (stlFile){
    //     reader.readAsDataURL(stlFile)
    //     console.log(reader)}
    //     else {""}
    // })
    
    function toothHandler(e){

        if (type === "denture" || type === "newDenture" || type === "dentureRepair" || type === "copyDenture" || type == "Night Guard"){

            const upperArch = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];
            const lowerArch = ["18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];


            let toothId = e.target.id;
            let archArray = upperArch.includes(toothId) ? upperArch : lowerArch;
            let toothFill = e.target
            // let toothIndex = crownTooth.indexOf(` ${toothId}`);
            // if (toothIndex !== -1){
            //     toothFill.style.fill="white"
            //     setCrownTooth((oldValue)=>{
            //         return oldValue.filter(tooth => tooth !== ` ${toothId}`)
            //     })}
                
            // else {
            //     let toothArray = [...crownTooth, ` ${toothId}`]
            //     toothArray.sort(function(a, b){return a-b})
            //     setCrownTooth(toothArray)
                
            //     toothFill.style.fill = "#137ea7"
            // }

            // Check if arch is already selected (all teeth in arch are in crownTooth)
            let isArchSelected = archArray.every(tooth => crownTooth.includes(` ${tooth}`));

            if (isArchSelected) {
                // Deselect whole arch
                setCrownTooth(oldValue =>
                    oldValue.filter(tooth => !archArray.includes(tooth.trim()))
                );
                archArray.forEach(tooth => {
                    let toothEl = document.getElementById(tooth);
                    if (toothEl) toothEl.style.fill = "white";
                });
            } else {
                // Select whole arch
                let updated = [...new Set([...crownTooth, ...archArray.map(t => ` ${t}`)])];
                updated.sort((a, b) => parseInt(a) - parseInt(b));
                setCrownTooth(updated);

                archArray.forEach(tooth => {
                    let toothEl = document.getElementById(tooth);
                    if (toothEl) toothEl.style.fill = "#137ea7";
                });
            }

        //     const clickedId = parseInt(e.target.id); // string → number
        //     const idsToToggle = Array.from({ length: 16 - clickedId }, (_, i) => clickedId + i);

        //     setCrownTooth((oldValue) => {
        //         const newValue = [...oldValue]; // copy current selection

        //         idsToToggle.forEach((id) => {
        //             const toothStr = ` ${id}`;
        //             const toothElement = document.getElementById(id.toString());
        //             if (!toothElement) return;

        //             if (newValue.includes(toothStr)) {
        //                 // Remove selection
        //                 toothElement.style.fill = "white";
        //                 const index = newValue.indexOf(toothStr);
        //                 newValue.splice(index, 1);
        //             } else {
        //                 // Add selection
        //                 toothElement.style.fill = "#137ea7";
        //                 newValue.push(toothStr);
        //             }
        //         });

        //         // Keep sorted
        //         newValue.sort((a, b) => parseInt(a) - parseInt(b));
        //         return newValue;
        //     });
        }
        else {
        let toothId = e.target.id;
            let toothFill = e.target
            let toothIndex = crownTooth.indexOf(` ${toothId}`);
            if (toothIndex !== -1){
                toothFill.style.fill="white"
                setCrownTooth((oldValue)=>{
                    return oldValue.filter(tooth => tooth !== ` ${toothId}`)
                })}
                
            else {
                let toothArray = [...crownTooth, ` ${toothId}`]
                toothArray.sort(function(a, b){return a-b})
                setCrownTooth(toothArray)
                
                toothFill.style.fill = "#137ea7"
            }}
    }
    function bridgeHandler(e){
        let toothId = e.target.id;
            let toothFill = e.target
            let toothIndex = crownTooth.indexOf(` ${toothId}`);
            if (toothIndex !== -1){
                toothFill.style.fill="white"
                setBridgeTooth((oldValue)=>{
                    return oldValue.filter(tooth => tooth !== ` ${toothId}`)
                })}
                
            else {
                let toothArray = [...bridgeTooth, ` ${toothId}`]
                toothArray.sort(function(a, b){return a-b})
                setBridgeTooth(toothArray)
                
                toothFill.style.fill = "#137ea7"
            }
    }


    useEffect(()=>{
        if (crownTooth){
        calculateArches(); 
        // console.log(lowerArch); 
        // console.log(upperArch)
        }
    }, [crownTooth])

    useEffect(()=>{
        console.log(product)
        }
    )

   

    //Shippo Label 
    function getLabelToKpd(selectedRate){
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
    
        fetch(`${url}/shippo/get_rates/${id}`, options)
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


    useEffect(()=>{
        if (labelUrl) {
        
        window.open(labelUrl, '_blank');
        setWaiting(false);
        
        }
    }, [labelUrl])


    useEffect(()=> { 
        if (model3D === "Yes"){
        (lowerArch && upperArch)? setPrice3(20): setPrice3(10)}})
        

    useEffect(() => {
        (product === "Premium SHT Zirconia")? 
            setFinish("Stain and Glaze")
        :(product === "Ultra Premium UHT Zirconia")?
            setFinish("Stain and Glaze")
        :(product === "PMMA Temporary")?
            setFinish("Polished")
            
        :""
         
        }, [product]);   


    return(
        <>
             {loading ? (
                <div className="row justify-content-center">
                    <div className="mx auto mt-4 text-center justify-content-center col-6 sm-col-4">
                        
                        <h3>
                            Please Wait While We Send Your Case
                        </h3>
                        
                        <div className="spinner text-center mx-auto">
                            
                        </div>
                    </div>
                </div>
        ) :

        waiting ? (
            <div className="row justify-content-center">
                <div className="mx auto mt-4 text-center justify-content-center col-6 sm-col-4">
                    
                    <h3>
                        Please Wait While We Create Your Label
                    </h3>
                    
                    <div className="spinner text-center mx-auto">
                        
                    </div>
                </div>
            </div>
    ) :
            
            <>
            
        
            {(type==="")?
            <div className="col-8 create-order-type" style={{margin:"auto", paddingLeft:"100px"}}>
                <div className="row "> 
                {/* <!-- service-block-two --> */}
                <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="400ms">
                    <div className="inner-box" onClick={()=>setType("crown")}>
                        <div className="image-box" >
                        <figure className="image overlay-animr">
                            
                                <img src={Zirc} alt="" className="product-pic" />
                            
                        </figure>
                        {/* <i className="flaticon-clock-1"></i> */}
                        </div>
                        <div className="content-box text-center">
                        <h4 className="title"><a >Crown and Bridge</a></h4>                 
                        </div>
                    </div>
                </div>
                {/* <!-- service-block-two --> */}
                <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="600ms">
                <div className="inner-box" onClick={()=>setType("veneer")}>
                    <div className="image-box">
                    <figure className="image overlay-anim"><img src={ZircV} alt="" className="product-pic" /></figure>
                    {/* <i className="flaticon-monitor-1"></i> */}
                    </div>
                    <div className="content-box text-center">
                    <h4 className="title"><a >Veneer</a></h4>
                    </div>
                </div>
                </div>
                {/* <!-- service-block-two --> */}
                <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="800ms">
                <div className="inner-box" onClick={()=>setType("partial")}>
                    <div className="image-box">
                    <figure className="image overlay-anim"><img src={Partial} alt="" className="product-pic" /></figure>
                    {/* <i className="flaticon-cog-1"></i> */}
                    </div>
                    <div className="content-box text-center">
                    <h4 className="title"><a >Partial</a></h4>
                    </div>
                </div>
                </div>
                <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="800ms">
                <div className="inner-box" onClick={()=>setType("denture")}>
                    <div className="image-box">
                    <figure className="image overlay-anim"><img src={Denture} alt="" className="product-pic" /></figure>
                    {/* <i className="flaticon-cog-1"></i> */}
                    </div>
                    <div className="content-box text-center">
                    <h4 className="title"><a >Denture</a></h4>
                    </div>
                </div>
                </div>
                <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="800ms">
                <div className="inner-box" onClick={()=>setType("implant")}>
                    <div className="image-box">
                    <figure className="image overlay-anim"><img src={Implant} alt="" className="product-pic" /></figure>
                    
                    </div>
                    <div className="content-box text-center">
                    <h4 className="title"><a >Implant</a></h4>
                    </div>
                </div>
                </div>
                <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="800ms">
                <div className="inner-box" onClick={()=>setType("removableAppliances")}>
                    <div className="image-box">
                    <figure className="image overlay-anim"><img src={NightGuard} alt="" className="product-pic" /></figure>
                    
                    </div>
                    <div className="content-box text-center">
                    <h4 className="title"><a >Removable Appliances</a></h4>
                    </div>
                </div>
                </div>
                <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="800ms">
                <div className="inner-box" onClick={()=>setType("Custom Tray")}>
                    <div className="image-box">
                    <figure className="image overlay-anim"><img src={CustomTray} alt="" className="product-pic" /></figure>
                    
                    </div>
                    <div className="content-box text-center">
                    <h4 className="title"><a >Custom Tray</a></h4>
                    </div>
                </div>
                </div>
                <div className="service-block-two col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="800ms">
                <div className="inner-box" onClick={()=>setType("Wax Rim")}>
                    <div className="image-box">
                    <figure className="image overlay-anim"><img src={WaxRim} alt="" className="product-pic" /></figure>
                    
                    </div>
                    <div className="content-box text-center">
                    <h4 className="title"><a >Wax Rim</a></h4>
                    </div>
                </div>
                </div>
            </div>
            </div>
            :
            (type==="crown")?
                <form className="form form-container" data-toggle="validator" role="form" onSubmit={(e)=>{e.preventDefault(); uploadCase()}}>
                    <div className="row form-group justify-content-center">
                        <div className="text-center col-4">
                            <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
                        </div>
                    </div>
                    <div className="row form-group justify-content-center">
                        <div className="text-center col-4 pt-3">
                        <label  htmlFor="patientName"><h5>Patient Name</h5></label>
                        <input className="form-control" required id="patientName" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
                        </div>
                    </div>
                    <div className="d-flex row pt-4 justify-content-center" >
                        <div className="col-4 form-group text-center pb-4 ">
                            <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
                            <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} readOnly={true} value={crownTooth} onChange={(e)=>setToothInput(e.target.value)}></input>
                        </div>
                        <div className="col-9 col-lg-3 px-5" >
                        <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                                    <path style ={{fill: "white", stroke: "black", strokeWidth:"2px"}} d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                                    onClick={(e)=> toothHandler(e)} ></path>
                                    <path   d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                                    <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                                    <path  d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                                    <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                                    <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                                    <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                                    <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                                    <path  d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
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
                    {/* <div className="row form-group text-center justify-content-center mt-3">
                        <div className="col-9">
                            <button className="btn btn-primary" onClick={()=>(bridge === 'false')?setBridge('true'): setBridge('false')}>Are any of these teeth part of a bridge? If yes click here.</button>
                        </div>
                        {(bridge === "true")?
                            <div className="d-flex row pt-4 justify-content-center" >
                            <div className="col-4 form-group text-center pb-4 ">
                                <label  htmlFor="toothInput"><h5>Bridge Teeth</h5></label>
                                <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px"}} readOnly={true} value={bridgeTooth} onChange={(e)=>setToothInput2(e.target.value)}></input>
                            </div>
                            <div className="col-9 col-lg-3 px-5" >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                                <path d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                                onClick={(e)=> bridgeHandler(e)} ></path>
                                <path d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                                <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M374.43,109.84c3.85-4.81,9.51-7,16.91-6.51l-.14-.34c-7.82-.86-12.82.91-16.73,6.34Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M365.59,129.77l.45.85c-1.13-5.57.12-11.34,4-17.56l-.63.23C365.23,119.77,364.24,124.09,365.59,129.77Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M401.14,102.32c9.66,9.6,19.12,16.14,28.94,20a10.44,10.44,0,0,0,3.76.71,13.19,13.19,0,0,0,9.38-3.82,17.09,17.09,0,0,0,3.69-6.48c.77-2.58.44-5.86.15-8.75-.05-.52-.1-1-.14-1.49a68.75,68.75,0,0,0-3.21-15.61,60.53,60.53,0,0,0-2.11-5.73c-.3-.68-.61-1.32-.93-1.91a8.45,8.45,0,0,0-4.6-3.74v-.07l-.32,0a5.71,5.71,0,0,0-.58-.21,4.59,4.59,0,0,0-1.7-.09c-17.07-1.92-30.7,5.16-35.1,18.5h0a5.89,5.89,0,0,0-.26.7C397.25,97.19,399.28,100.25,401.14,102.32Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="7" 
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M432.33,82.75c-11.12,1.48-19.73,5.91-25.61,13.64C412.22,87.21,421,82.84,432.33,82.75Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M444.52,86.59c.28.6.56,1.21.84,1.85a61.43,61.43,0,0,0,18.69,24.47,18.32,18.32,0,0,0,10.6,3.94h0c4.33,0,8.69-1.91,13-5.8l.09-.1c5.7-8.6,9.72-19.06,12.29-32a21.81,21.81,0,0,0,.36-7.89c-.31-1.82-.88-5.21-2.67-6.39a3.4,3.4,0,0,0-.69-.34h0c-20.31-8.75-37.58-6.72-51.34,6a4.86,4.86,0,0,0-1.73,1.36c-1.3,1.66-1.59,3.92-1.71,5.92C442,81.22,443.22,83.83,444.52,86.59Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="8" 
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M560.55,78c-.1-2-.38-4.27-1.66-5.94a4.86,4.86,0,0,0-1.72-1.37C543.54,57.8,526.29,55.6,505.9,64.15h0a3.42,3.42,0,0,0-.7.33c-1.8,1.17-2.4,4.55-2.73,6.37a21.88,21.88,0,0,0,.28,7.88c2.44,12.93,6.36,23.43,12,32.09l.09.1c4.23,3.93,8.57,5.92,12.91,5.92h0A18.37,18.37,0,0,0,538.37,113a61.46,61.46,0,0,0,18.92-24.29c.29-.64.58-1.25.87-1.84C559.48,84.13,560.72,81.53,560.55,78Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="9" 
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M604.23,94.81c-.08-.25-.17-.48-.26-.71h0c-4.27-13.38-17.83-20.59-34.92-18.84a4.86,4.86,0,0,0-1.7.07l-.58.21-.32,0v.07a8.5,8.5,0,0,0-4.64,3.7c-.32.59-.64,1.23-1,1.9-.82,1.82-1.49,3.74-2.17,5.71a69.17,69.17,0,0,0-3.35,15.58c-.05.47-.1,1-.16,1.49-.32,2.89-.68,6.16.07,8.75a17.14,17.14,0,0,0,3.62,6.51,13.15,13.15,0,0,0,9.34,3.91,10.44,10.44,0,0,0,3.77-.66c9.86-3.8,19.38-10.25,29.13-19.75C603,100.73,605.07,97.68,604.23,94.81Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="10" 
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M605.61,146.07a16.23,16.23,0,0,1-3.3-.31c-3.32-.69-7.74-2.45-10-6.86-2.34-4.67-1.57-10.09-.66-14.8,1.66-8.55,6.63-23.51,21.25-27.6,3.61-1,8.36-1.22,14.16-.62a25.46,25.46,0,0,1,10.67,3.23c8.85,5.29,10.05,17.42,8.22,27a23.67,23.67,0,0,1-1.74,5.58,15.73,15.73,0,0,1-2.47,4,12.53,12.53,0,0,1-2.62,2l-.54.33c-4.82,3.06-10.53,4.48-15.51,5.57-3.6.79-7.3,1.42-11,1.89l-1.1.14A42.3,42.3,0,0,1,605.61,146.07Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="11" 
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M629.22,186.51h-1.05c-2.44,0-4.23-1.49-6-2.92l-.48-.39c-3.76-3.06-6.18-6.14-7.41-9.42a14.41,14.41,0,0,1-.92-5.54,12.37,12.37,0,0,1,2.69-7.84c.58-.72,1.15-1.46,1.72-2.19,1-1.24,1.92-2.49,2.92-3.7a89.83,89.83,0,0,1,10.39-10.86,42.1,42.1,0,0,1,7.78-5.41,11.8,11.8,0,0,1,5.22-1.39,32.13,32.13,0,0,1,6.47.68l1.17.19a57,57,0,0,1,10.35,2.65c5.52,2,12.54,6,14.62,13.17a17.65,17.65,0,0,1-.11,9.31c-.79,3-2.5,8.53-5.17,11.08a41.62,41.62,0,0,1-15.89,9.27C646.76,186.11,637.7,186.51,629.22,186.51Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="12" 
                            onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M698.66,194.17a17.68,17.68,0,0,0-6.19-6.84,48,48,0,0,0-15-6.74c-6-1.51-11.6-1.31-16.21.6-6.53,2.69-12,7.6-15.51,11.06-1.39,1.36-3.2,3.16-5,5.11q-.54.6-1.11,1.2a25,25,0,0,0-2.63,3.08,13,13,0,0,0-1,1.69,14,14,0,0,0-1.1,9.74c1.8,6.84,8.46,12.82,15.17,13.61A48.76,48.76,0,0,0,656,227c1.51,0,3.11,0,5.2-.14a68.32,68.32,0,0,0,9.64-1.22c7-1.38,15.76-3.83,21.87-10.59a28.79,28.79,0,0,0,6.08-10.66C699.74,201.25,700.41,197.84,698.66,194.17Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="13" onClick={(e)=>  bridgeHandler(e)(e)}></path>
                                <path d="M677.34,296.1h0l-.46,0a27.08,27.08,0,0,1-14.66-5.58l-.1-.1c-6.39-8.26-10.68-15.84-13.49-23.83A25.39,25.39,0,0,1,651,245a20.28,20.28,0,0,1,2-2.71c11.2-12.59,25.07-19.81,38.05-19.81a36.27,36.27,0,0,1,9.71,1.33c6.21,1.74,11,6.92,11.81,12.9a79.16,79.16,0,0,0,7.25,24.07c2.15,4.36.58,9.86-.79,13.62-1.86,5.12-6,7.81-9.85,9.77l-1,.51a143.94,143.94,0,0,1-14.29,6.67c-2.77,1.06-5.62,2-8.48,2.79-.6.17-1.26.39-2,.61A21.82,21.82,0,0,1,677.34,296.1Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="14" onClick={(e)=>  bridgeHandler(e)(e)}></path>
                                <path d="M493.62,73.94l-1.09-.34c-14-3.73-28.66-2-42.88,5l.65-.48C464.89,69,479.54,67.89,493.62,73.94Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M728.63,323.7c-.37-1.8-.86-3.57-1.29-5.09a11.77,11.77,0,0,1-.35-2.45c0-.39,0-.8-.1-1.21a29.4,29.4,0,0,1,.05-5.47,23.4,23.4,0,0,0-.26-7.41,18.43,18.43,0,0,0-7.5-10.13,19.3,19.3,0,0,0-10-3.43,9.8,9.8,0,0,0-1.47.1c-10.4,1.62-21.5,5.37-33.94,11.47-4.28,2.4-6.34,6.83-6.12,13.15,0,1.5,0,3,0,4.47a83.19,83.19,0,0,0,1.06,10.89,27.19,27.19,0,0,0,.76,3.08c.09.34.19.68.29,1a11.06,11.06,0,0,1,.28,2.13,14.57,14.57,0,0,0,.24,2,19.36,19.36,0,0,0,10,13.27,23.27,23.27,0,0,0,10.52,2.3l1.41,0a52.7,52.7,0,0,0,11.89-2.26,121,121,0,0,0,15.7-5.77c.4-.18.84-.35,1.29-.53,1.78-.7,3.8-1.5,4.8-3.07a21.2,21.2,0,0,0,2.84-6.57A24.42,24.42,0,0,0,728.63,323.7Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="15" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M697.73,438.53a30.44,30.44,0,0,1-6.6-.77,76.67,76.67,0,0,1-11.51-3.87l-2.8-1.09-1.58-.61c-4.31-1.64-8.78-3.33-12.34-6.38a15.61,15.61,0,0,1-5.13-8.22c-.63-2.75-.21-6.06,1.28-10.12l.14,0a29.43,29.43,0,0,1,3.11-7.28c.7-1.29,1.42-2.62,2.06-4.07.45-1,.9-2.15,1.35-3.28,1.42-3.55,2.9-7.21,5.12-10a28.59,28.59,0,0,1,13.4-9.7c6.75-2.14,14.69-1.29,24.26,2.61s15.47,8.9,18,15.25c2.23,5.61,1.39,11.5.29,15.45-.94,3.36-2.88,6.35-4.75,9.24-.94,1.43-1.9,2.92-2.71,4.41-.54,1-1,2-1.57,3-2.83,5.46-5.76,11.11-11.47,13.69A20.74,20.74,0,0,1,697.73,438.53Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="18" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M704.14,471.94a28.76,28.76,0,0,0-.5-3.77c-.17-.91-.33-1.85-.43-2.77-.22-2.21-.42-4.43-.61-6.64-.07-.86-.1-1.72-.14-2.57-.12-2.8-.24-5.69-1.65-8.37-.28-.52-.6-1-.91-1.48-1.66-2.55-4.54-4.39-6.85-5.87a43.33,43.33,0,0,0-8.35-4.15,41.42,41.42,0,0,0-18.33-2.51c-4.94.47-11.77,1.74-16.31,5.09L650,439a1.48,1.48,0,0,0-.29.22c-6.86,6.28-10.53,16.3-13.76,25.14-1,2.87-2,5.58-3.08,8-2.84,6.55-1.41,16.3,5.84,20.64l.74.44c5.39,3.23,10.48,6.28,16.29,8.55a81.09,81.09,0,0,0,9.37,3c.67.17,1.35.37,2,.56a24,24,0,0,0,6.6,1.25h.13a16.35,16.35,0,0,0,7.7-2.2c4.71-2.58,8.55-6.67,12-10.71a66.52,66.52,0,0,0,7.24-10.45C702.94,479.59,704.34,476.19,704.14,471.94Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="19" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M685,485.33l1.07.54C686.42,486,686,485.73,685,485.33Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M673.29,457.85A17.62,17.62,0,0,1,672,446a.71.71,0,0,1,.84-.53,22.87,22.87,0,0,0,4.11.36c1,0,2.07-.05,3.18-.16a40.17,40.17,0,0,1-14.57-3.93,12.06,12.06,0,0,0,4.92,3.1.72.72,0,0,1,.47.84,18.65,18.65,0,0,0,1.33,12.64,25.57,25.57,0,0,0-10.45,10.34h0v0l0,.05A33.6,33.6,0,0,1,642,464.5c4.17,3.57,10.23,5.37,18,5.37.47,0,1,0,1.44,0a13.22,13.22,0,0,0,.67,10.27,8.93,8.93,0,0,0-1,.41c-3.54,1.81-5.77,5.64-6.83,11.66a19.58,19.58,0,0,0-8-.13,38.89,38.89,0,0,1,17.18,4.78,23.61,23.61,0,0,0-8.08-4.37c.69-5.94,3-9,6.27-11,5.22-3,19.22,2.08,23.37,3.83-7.94-4-15.91-7.13-21.84-5.56-1.63-3-1.81-6.44-.48-10.31l.11-.32c5.46-13.07,23.86-13.08,30.27-13C685.23,455.22,678.67,456,673.29,457.85Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M650.53,546.07c-11.39,0-21.43-4.83-30-14.44h0a14.59,14.59,0,0,1-3.45-11.87,24.49,24.49,0,0,1,10.21-16.22,24.16,24.16,0,0,1,16.54-3.71c6.92.81,13.61,3.71,19.8,6.71a24,24,0,0,1,10.93,11.79,19.1,19.1,0,0,1,.24,15.57,16.1,16.1,0,0,1-4,5.39c-1.44,1.27-5.16,4.33-8.72,5.24A46.22,46.22,0,0,1,650.53,546.07Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="20" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M638.47,514.84c1.73-2.4,4.46-3.91,8.09-4.49,2.64,2,7.41,3.66,13.5,5.31-7.48-2.79-13.62-5.71-15.8-9a4.21,4.21,0,0,0,1.26,2.82,12.44,12.44,0,0,0-7.94,4.77c-.13.19-.23.4-.36.59-1.62-2.26-4.24-3.6-7.44-4.43a15.44,15.44,0,0,1,6.49,4.85,1.11,1.11,0,0,1,.1,1.11c-1.58,3.52-1.85,8.26-.86,14.36a25.51,25.51,0,0,0-7.59-1.16h-.35a65.4,65.4,0,0,1,19,7.18,34.85,34.85,0,0,0-9.84-5.63C635.41,523.74,636,518.28,638.47,514.84Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M624.85,583.59c-12.59,0-20.46-8.39-23.38-24.92-.73-4.07-1.14-9.26,2.11-13.22,3.86-4.7,10.22-5.29,14.66-5.32h.34a50,50,0,0,1,16.91,3c6,2.14,9.94,5,12.12,8.84,2.75,4.78,5.34,10.47,3.69,16.42a16.43,16.43,0,0,1-6.4,8.81,28.27,28.27,0,0,1-7.81,4.23A41.17,41.17,0,0,1,624.85,583.59Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="21" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M612.54,562c2-6.66,6-10.2,12.17-10.79a1.6,1.6,0,0,1,1.12.37c2.55,2,7.39,3.4,11.89,4.48,0,0-9.69-3.68-11.78-5.85a11.37,11.37,0,0,1-1.71-3.68,3.81,3.81,0,0,0-.07,3,.54.54,0,0,1-.44.74c-5.86.85-9.89,4.45-12,10.74a.63.63,0,0,1-.92.35,6.6,6.6,0,0,0-3.16-1.12,42.25,42.25,0,0,1,10.73,12.35c-1.79-4.35-3.64-7.52-5.59-9.56A1,1,0,0,1,612.54,562Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M596.57,610.7c-1.3,0-2.59-.08-3.68-.16a41,41,0,0,1-12-2.69c-3.72-1.56-5.84-4.61-6.49-9.33a67,67,0,0,1-.73-20.39c1.07-7.59,4.75-11.29,11-10.94,10.61,2.54,19.47,6.87,26.45,12.87a17.85,17.85,0,0,1,4.65,6.71,9.29,9.29,0,0,1,.94,3.84,20,20,0,0,1-1.86,6.29l0,.14a29.13,29.13,0,0,1-3,5.44,17.24,17.24,0,0,1-15.3,8.22Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="22" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M582.94,603.71a50.27,50.27,0,0,0,27.26-16.28C605,596.15,595.81,601.63,582.94,603.71Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M575.53,603.58l-.07-.11a86.62,86.62,0,0,0-18.85-19.53,12.47,12.47,0,0,0-1.11-.66,10.34,10.34,0,0,0-12.34,1.62,9,9,0,0,0-2,3,27.39,27.39,0,0,0-1.27,3.62,65.46,65.46,0,0,0-1.5,6.9l0,.29a161,161,0,0,0-2,16.14c.37,4.08,2.28,6.65,5.64,7.61a40.26,40.26,0,0,0,14.8,3.25c7.85,0,14.26-3.52,19.09-10.51C577.49,612.22,577.36,608.32,575.53,603.58Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="23" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M572,608.49a110.93,110.93,0,0,1-27.27,8.29h.12C555.25,616.78,564.39,614,572,608.49Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M535.2,611a10.29,10.29,0,0,0-.73-2.15c-.78-1.65-1.42-3.38-2.17-5a83.78,83.78,0,0,0-4-8,44.15,44.15,0,0,0-4.1-5.94c-.21-.26-.43-.51-.65-.76-5.33-6.08-10.76-5.48-15.71,1.79a52.38,52.38,0,0,0-7.6,19c-.25,1.23-.48,2.5-.67,3.77a10.19,10.19,0,0,0,0,4.15,7.71,7.71,0,0,0,4.71,5.62,33.48,33.48,0,0,0,12.28,3.52c.48,0,1,.05,1.45.05,4,0,7.91-1,12.72-3.27a10,10,0,0,0,3.23-2.2c1.88-2.08,1.84-5.27,1.63-7.88A19.65,19.65,0,0,0,535.2,611Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="24" onClick={(e)=>  bridgeHandler(e)(e)}></path>
                                <path d="M460.8,615.79c-.26,2.61-.35,5.8,1.48,7.91a10.13,10.13,0,0,0,3.2,2.26c4.77,2.35,8.67,3.43,12.66,3.5.48,0,1,0,1.45,0a33.42,33.42,0,0,0,12.34-3.3,7.72,7.72,0,0,0,4.81-5.53,10.09,10.09,0,0,0,.1-4.15c-.17-1.27-.37-2.54-.6-3.78A52.15,52.15,0,0,0,489,593.6c-4.82-7.36-10.24-8.06-15.68-2.08-.23.25-.45.49-.66.74a44.8,44.8,0,0,0-4.2,5.87,81.47,81.47,0,0,0-4.2,7.88c-.78,1.66-1.46,3.37-2.27,5a11,11,0,0,0-.76,2.13A19.86,19.86,0,0,0,460.8,615.79Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="25" onClick={(e)=>  bridgeHandler(e)(e)}></path>
                                <path d="M420.44,616.64c4.7,7.08,11,10.71,18.9,10.86a40.47,40.47,0,0,0,14.85-3c3.37-.9,5.34-3.43,5.78-7.51a157.59,157.59,0,0,0-1.68-16.17l-.05-.29a62.68,62.68,0,0,0-1.37-6.92,27.29,27.29,0,0,0-1.2-3.65,9.26,9.26,0,0,0-1.94-3,10.35,10.35,0,0,0-12.31-1.84c-.38.2-.76.41-1.12.64a86.86,86.86,0,0,0-19.2,19.18l-.07.12C419.11,609.76,418.91,613.66,420.44,616.64Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="26" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M702.2,323.49a9,9,0,0,1-3-.61,8.1,8.1,0,0,1-3-2.77c-.84-1.15-1.79-2.24-2.58-3.42-1.79-2.64-3.32-5.69-3.42-8.94a9.86,9.86,0,0,1,.24-2.54,12.79,12.79,0,0,1,.93-2.48s1-.56,1.21-.67a25.44,25.44,0,0,0,4.55-3.29c-3,1.53-6.05,3.83-12.28,3.89a13.21,13.21,0,0,0,3.13.39,11.35,11.35,0,0,0,2.18-.22c-3.09,7.59,2.49,14.93,8.13,21.26.24.27-.55,2.38-.66,2.75a27,27,0,0,1-1.08,2.88,31.85,31.85,0,0,1-3.13,5.35c-5.74-1.49-16.49-.63-16.5.15a50.78,50.78,0,0,1,16.61,1A35,35,0,0,1,706,341.9a10.35,10.35,0,0,0-4.37,3.59c3.55-3.3,8.39-4.33,14.23-3.61a34.05,34.05,0,0,0-7.22-.6,4.14,4.14,0,0,1-2.63-.72,36,36,0,0,0-11.33-5.2,27.38,27.38,0,0,0,4.83-11.2,25.17,25.17,0,0,0,17.82-3.69,25.55,25.55,0,0,0,4.78-4C719.66,319,711.54,324.41,702.2,323.49Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M694.21,281.74a32.11,32.11,0,0,1-13.51-7.41c1.13-1.33,1.43-3.47,1.67-5.17,0-.37.1-.73.15-1a71.36,71.36,0,0,0,1-9.22,3.39,3.39,0,0,0,.93.12l.52,0a67.76,67.76,0,0,0,7.66-.88,73.85,73.85,0,0,0,7.79-1.79,80.7,80.7,0,0,0,7.85-2.69c.63-.25,1.25-.53,1.88-.77-.64.15-1.32.2-2,.32s-1.34.26-2,.41c-1.33.29-2.65.64-3.95,1-2.18.67-4.32,1.42-6.55,1.95a45.46,45.46,0,0,1-5.68.94c-.79.08-1.58.15-2.38.21s-1.81.17-2.71.17a2.47,2.47,0,0,1-1.4-.18,2.76,2.76,0,0,1-.85-1.27l-.08-.19a11.76,11.76,0,0,0-3.21-4.19,22.23,22.23,0,0,0-2.39-1.66,22.67,22.67,0,0,1-2-1.38,35.55,35.55,0,0,1,2.32-14,2.34,2.34,0,0,1,1.14-1.2c.53-.26,1.05-.53,1.56-.84a10.93,10.93,0,0,0,1.38-1.08,23.55,23.55,0,0,1-9.3,2.65,9.94,9.94,0,0,0,2.49.26,8.24,8.24,0,0,0,2.12-.31c-.1,0-.29.72-.34.83l-.33.89c-.21.59-.41,1.19-.59,1.79a36,36,0,0,0-.89,3.72c-.2,1-.34,2.07-.45,3.11,0,.53-.09,1.05-.13,1.58,0,.26,0,.53,0,.79a4.44,4.44,0,0,1,0,.82,3.36,3.36,0,0,1-.89-.71,7.39,7.39,0,0,1-.82-.86,17.77,17.77,0,0,1-1.82-3.06,24.3,24.3,0,0,0-2.12-3.2q-.3-.41-.63-.78a7.71,7.71,0,0,0,.55,1.79,8.61,8.61,0,0,0,.57,1.28c.34.6.73,1.56,1.17,2.38a12.14,12.14,0,0,0,1.43,2.32,25.76,25.76,0,0,0,3.62,3.15c.48.33,1,.64,1.48,1a22.35,22.35,0,0,1,2.28,1.57,10.71,10.71,0,0,1,2.9,3.8l.08.19a4.7,4.7,0,0,0,.85,1.41h-.06a69.09,69.09,0,0,1-1,9.61c-.06.33-.11.69-.17,1.08-.31,2.22-.69,5-2.75,5.41l-1.3.27c-4.52,1-6.9,1.81-11.5,1.14l-4-.48a21.54,21.54,0,0,0,6.8,1.67,43.41,43.41,0,0,0,8.88-1.26l1.29-.27a3.44,3.44,0,0,0,1.11-.44c3.71,3.35,8.59,5.85,14.85,7.65a37.93,37.93,0,0,1-4.79,1.77l-3,1.2A29.38,29.38,0,0,0,693,284a30.44,30.44,0,0,0,5.87-2.95,16.72,16.72,0,0,0,4.35-3.86c.09-.12.38-.42.34-.55a5.24,5.24,0,0,0-1.41,1.12c-.53.48-1,.78-1.46,1.17a32,32,0,0,1-3,2.08,7.53,7.53,0,0,1-1.36.65A3.63,3.63,0,0,1,694.21,281.74Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M667.72,210.8c.1-4.24-1.89-7.91-5.91-10.94a33.34,33.34,0,0,0,10.43-11.13l-1.76,1.89c-6.31,7.34-10.29,10.42-19.24,12.14l-2.86.36c.63,0,1.25.08,1.87.08a21.43,21.43,0,0,0,10.53-2.72c4.15,3,6.05,6.49,5.81,10.71a17.79,17.79,0,0,0-8.5,7.41l2.22-2a20.77,20.77,0,0,1,7.09-4.84s.27-.05.27-.09c3.13-1.09,6.7-1.14,11.87-.44a6.74,6.74,0,0,0,1,.08l2.31,0C676.91,209.65,671.9,209.47,667.72,210.8Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M646.47,171.6c.42-6-2.6-10.79-9-14.39a43.45,43.45,0,0,0,12.25-9.86l-2.6,1.83c-7.52,5.87-12.44,8.77-21.42,11.42l-1.23.75a37.68,37.68,0,0,0,11.83-3.54c6.72,3.57,9.67,8.26,9,14.3a19.79,19.79,0,0,0-7.81,7l2-1.9c6.34-5.37,11.49-6,20.26-5.81l1.61-.16C655.55,169.84,650.62,170,646.47,171.6Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M628,110c-3.81-4.85-9.45-7.14-16.86-6.67l.15-.34c7.83-.78,12.81,1,16.66,6.51Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M636.67,130.06l-.46.85c1.19-5.56,0-11.35-3.79-17.6l.63.23C637.12,120.06,638.07,124.39,636.67,130.06Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M570.13,82.9C581.24,84.49,589.8,89,595.6,96.79,590.19,87.56,581.46,83.1,570.13,82.9Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M509.18,73.75l1.09-.33c14-3.6,28.68-1.77,42.83,5.43l-.64-.49C538,69,523.32,67.84,509.18,73.75Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M394.12,610.91a18.84,18.84,0,0,1-9.41-7.62,28.72,28.72,0,0,1-2.86-5.49l-.06-.13a20.78,20.78,0,0,1-1.74-6.33,9.23,9.23,0,0,1,1-3.82,17.7,17.7,0,0,1,4.77-6.62c7.09-5.88,16-10,26.68-12.39,6.28-.24,9.89,3.52,10.82,11.13a67.38,67.38,0,0,1-1.1,20.38c-.74,4.7-2.91,7.71-6.66,9.2a40.57,40.57,0,0,1-12,2.47c-1.1.06-2.39.12-3.69.1A18.57,18.57,0,0,1,394.12,610.91Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="27" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M359.88,581.83a28.51,28.51,0,0,1-7.73-4.38,16.43,16.43,0,0,1-6.24-8.92c-1.55-6,1.14-11.62,4-16.36,2.26-3.76,6.28-6.58,12.29-8.61a49.71,49.71,0,0,1,17-2.72h.34c4.44.12,10.78.82,14.55,5.59,3.18,4,2.68,9.19,1.88,13.25-3.22,16.48-11.24,24.72-23.83,24.49A41,41,0,0,1,359.88,581.83Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="28" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M347.81,546.21a45.89,45.89,0,0,1-12.25-1.76c-3.55-1-7.22-4.11-8.63-5.4a16.27,16.27,0,0,1-3.94-5.46,19.19,19.19,0,0,1,.53-15.57,24,24,0,0,1,11.14-11.58c6.25-2.89,13-5.67,19.92-6.36a24.17,24.17,0,0,1,16.47,4,24.48,24.48,0,0,1,9.91,16.4,14.56,14.56,0,0,1-3.66,11.81h0C368.79,541.55,358.9,546.21,347.81,546.21Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="29" onClick={(e)=>  bridgeHandler(e)}></path>
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
                            :""
                        }
                        
                    </div> */}
                    <div className="row form-group justify-content-center mt-3">
                        <div className="text-center col-8 col-lg-4 pt-3">
                        <label htmlFor="Notes" className="form-label"><h5>Prescription Information</h5></label>
                        <textarea className="form-control" style={{backgroundColor:"white", border:"black 1px solid"}} id="Notes" rows="3" value={note} placeholder={"Please include all pertinent case information as well as if any teeth are part of a bridge. Please note any virtual extractions"} onChange={(e)=>setNote(e.target.value)}></textarea>
                
                        </div>
                    </div>
                    
                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>3D Printed Model</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="No"
                            checked={model3D === 'No'}
                            onChange={(e)=>{setModel3D(e.target.value); setPrice3(0)}}
                        />
                        No
                        </label>
                        
                        <small  className="form-text text-muted"  style={{color:"white"}}></small>
                        
                        <label style={{color:"black", paddingLeft: "10px"}}>
                        <input style={{paddingLeft: "10px"}}
                            type="radio"
                            value="Yes"
                            checked={model3D === 'Yes'}
                            onChange={(e)=>{setModel3D(e.target.value)}}
                            
                        />
                         Yes 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>3D Printed Models $10/Arch</small>
                        </div>
                    </div>
                    

                    <div className="row form-group text-center justify-content-center mt-5">
                        <div className= "col-8 col-lg-4">
                            <label  htmlFor="product"><h5>Shade</h5></label>
                            <select className="form-select" id="shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Shade" onChange={(e)=>{setShade(e.target.value)}}>
                                <option value="Select One">Select One</option>
                                <option value="A1" onClick={()=>setShade("A1")}>A1</option>
                                <option value="A2" onClick={()=>setShade("A2")}>A2</option>
                                <option value="A3" onClick={()=>setShade("A3")}>A3</option>
                                <option value="A3.5" onClick={()=>setShade("A3.5")}>A3.5</option>
                                <option value="A4" onClick={()=>setShade("A4")}>A4</option>
                                <option value="B1" onClick={()=>setShade("B1")}>B1</option>
                                <option value="B2" onClick={()=>setShade("B2")}>B2</option>
                                <option value="B3" onClick={()=>setShade("B3")}>B3</option>
                                <option value="B4" onClick={()=>setShade("B4")}>B4</option>
                                <option value="C1" onClick={()=>setShade("C1")}>C1</option>
                                <option value="C2" onClick={()=>setShade("C2")}>C2</option>
                                <option value="C3" onClick={()=>setShade("C3")}>C3</option>
                                <option value="C4" onClick={()=>setShade("C4")}>C4</option>
                                <option value="D2" onClick={()=>setShade("D2")}>D2</option>
                                <option value="D3" onClick={()=>setShade("D3")}>D3</option>
                                <option value="D4" onClick={()=>setShade("D4")}>D4</option>
                                <option value="Bleach" onClick={()=>setShade("Bleach")}>Bleach</option>
                            </select>
                        </div>
                    </div>
                    <div className="row form-group text-center justify-content-center mt-5">
                        <div className= "col-8 col-lg-4">
                            <label  htmlFor="product"><h5>Product</h5></label>
                            <select className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Product" onChange={(e)=>{setProduct(e.target.value)}}>
                                <option value="Select One">Select One</option>
                                {/* <option value="Economy HT Zirconia" onClick={()=>{setProduct("Economy HT Zirconia")}}>Economy HT Zirconia Polished/Glazed(Molars)</option> */}
                                <option value="Standard SHT Zirconia" onClick={()=>{setProduct("Standard SHT Zirconia")}}>Standard SHT Zirconia Polished/Glazed(All Posterior)</option>
                                <option value="Premium SHT Zirconia" onClick={()=>{setProduct("Premium SHT Zirconia")}}>Premium SHT Zirconia Stain and Glaze(Anterior and Posterior)</option>
                                <option value="Ultra Premium UHT Zirconia" onClick={()=>{setProduct("Ultra Premium UHT Zirconia")}}>Ultra Premium UHT Zirconia Stain and Glaze(All Anterior)</option>
                                <option value="PMMA Temporary" onClick={()=>{setProduct("PMMA Temporary")}}>PMMA Temporary</option>
                            </select>
                            <small id="productPrice" className="form-text text-muted" >
                                <strong>
                                    {(product === "Economy HT Zirconia")?
                                        `$${(price += 40)*crownTooth.length}`
                                    
                                    :(product === "Standard SHT Zirconia")?
                                        `$${(price += 60)*crownTooth.length}`

                                    :(product === "Premium SHT Zirconia")?
                                        `$${(price += 80)*crownTooth.length}`
                                        
                                    :(product === "Ultra Premium UHT Zirconia")?
                                        `$${(price += 100)*crownTooth.length}`
                                    
                                    :(product==="PMMA Temporary")?
                                    `$${(price += 35)*crownTooth.length}`
                                    
                                    : ""
                                    }
                                </strong>
                                </small>
                        </div>
                    </div>
                    

                    <div className="row form-group text-center justify-content-center mt-5">
                        <div className= "col-8 col-lg-4">
                            <label  htmlFor="finish"><h5>Finish</h5></label>
                            <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
                                {(product === "Economy HT Zirconia")?
                                <>
                                <option value="Select One">Select One</option>       
                                <option value="Polished" onClick={()=>{setFinish("Polished")}}>Polished</option>
                                <option value="Glazed" onClick={()=>{setFinish("Glazed")}}>Glazed</option>
                                </>
                                :(product === "Standard SHT Zirconia")?
                                <>
                                <option value="Select One">Select One</option>       
                                <option value="Polished" onClick={()=>{setFinish("Polished")}}>Polished</option>
                                <option value="Glazed" onClick={()=>{setFinish("Glazed")}}>Glazed</option>
                                </>
                                :(product === "Premium SHT Zirconia")?
                                <>
                                <option value="Stain and Glaze">Stain and Glaze</option>                                     
                                </>
                                :(product === "Ultra Premium UHT Zirconia")?
                                <>
                                <option value="Stain and Glaze">Stain and Glaze</option>
                                </>
                                :(product === "PMMA Temporary")?
                                <>
                                <option value="Polished">Polished</option>
                                </>
                                :
                                ""}
                            </select>
                        </div>
                    </div>

                    {/* {(product === "SHT Zirconia")?
                    
                    <div className="row form-group text-center justify-content-center mt-5">
                        <div className= "col-8 col-lg-4">
                            <label  htmlFor="finish"><h5>Finish</h5></label>
                            <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
                                <option value="Select One">Select One</option>       
                                <option value="Polished" onClick={()=>{setFinish("Polished")}}>Polished</option>
                                <option value="Stain and Glaze" onClick={()=>{setFinish("Stain and Glaze")}}>Stain and Glaze</option>
                                
                            </select>
                            <small id="productPrice2" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(finish === "Polished")?
                                `$${(price2 += 0)*crownTooth.length}`
                                
                                :(finish==="Stain and Glaze")?
                                `$${(price2 += 20)*crownTooth.length}`
                                
                                : ""
                                }
                                   </strong> </small>
                        </div>
                    </div>
                    :(product === "HT Zirconia")?
                    <div className="row form-group text-center justify-content-center mt-5">
                        <div className= "col-8 col-lg-4">
                            <label  htmlFor="finish"><h5>Finish</h5></label>
                            <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
                                <option value="Select One">Select One</option>       
                                <option value="Polished" onClick={()=>{setFinish("Polished")}}>Polished</option>
                                
                            </select>
                            <small id="productPrice2" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(finish === "Polished")?
                                `$${(price2 += 0)*crownTooth.length}`
                                
                                : ""
                                }
                                   </strong> </small>
                        </div>
                    </div>
                    :(product === "PMMA Temporary")?
                    <div className="row form-group text-center justify-content-center mt-5">
                        <div className= "col-8 col-lg-4">
                            <label  htmlFor="finish"><h5>Finish</h5></label>
                            <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
                                <option value="Select One">Select One</option>       
                                <option value="Polished" onClick={()=>{setFinish("Polished")}}>Polished</option>

                                
                            </select>
                            <small id="productPrice2" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(finish === "Polished")?
                                `$${(price2 += 0)*crownTooth.length}`
                                
                                : ""
                                }
                                   </strong> </small>
                        </div>
                    </div>:""

                    } */}
                    <div className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4 pt-3">
                        <label  htmlFor="picUpload"><h5>Upload Photos</h5></label>
                        <br></br>
                        {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                        <input 
                            className="form-control" 
                            
                            id="picUpload" 
                            type="file" 
                            multiple 
                            style={{ display: 'none' }} // Hide the file input
                            onChange={(e) => {
                                const pics = e.target.files; // Get all selected files
                                const newPics = [...photos]; // Copy the current files in state
                                const newPicName = [...photoName];

                                // Loop through each selected file and add it to the new arrays
                                for (let i = 0; i < pics.length; i++) {
                                    newPics.push(pics[i]);
                                    newPicName.push(pics[i].name);
                                }

                                // Update state with the new arrays of files and file names
                                setPhotos(newPics);
                                setPhotoName(newPicName);
                            }}
                        />
                        <button 
                            className="btn btn-primary"
                            onClick={(e) => {e.preventDefault(); document.getElementById('picUpload').click()}} // Trigger file input click
                        >
                            Select Files
                        </button>
                        
                        <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                            {photoName.join(', ')} {/* Display selected file names */}
                        </div>
                        </div>
                        {/* <div className="text-center col-8 col-lg-4 pt-3">
                        
                        </div> */}
                    </div>
                    <div className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4 pt-3">
                        <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
                        <br></br>
                        {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                        <input 
                            className="form-control" 
                            
                            id="scanUpload" 
                            type="file" 
                            multiple 
                            style={{ display: 'none' }} // Hide the file input
                            onChange={(e) => {
                                const files = e.target.files; // Get all selected files
                                const newFiles = [...stlFile]; // Copy the current files in state
                                const newFileName = [...fileName];

                                // Loop through each selected file and add it to the new arrays
                                for (let i = 0; i < files.length; i++) {
                                    newFiles.push(files[i]);
                                    newFileName.push(files[i].name);
                                }

                                // Update state with the new arrays of files and file names
                                setStlFile(newFiles);
                                setFileName(newFileName);
                            }}
                        />
                        <button 
                            className="btn btn-primary"
                            onClick={(e) =>{ e.preventDefault(); document.getElementById('scanUpload').click()}} // Trigger file input click
                        >
                            Select Files
                        </button>
                        
                        <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                            {fileName.join(', ')} {/* Display selected file names */}
                        </div>
                        </div>
                        {/* <div className="text-center col-8 col-lg-4 pt-3">
                        
                        </div> */}
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping To KPD (Physical Impressions)</h5></label>
                        <br></br>
                        <button className="btn btn-primary" onClick={(e)=> {e.preventDefault(); getLabelToKpd(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print USPS Label</button>
          
          <button className="btn btn-primary" style={{marginLeft: "5px"}}  onClick={(e)=> {e.preventDefault(); UPSLabel(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print UPS Label</button>
                      
                       
                        </div>
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping from KPD</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={shipping === 'Standard'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                         Standard 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Shipping $10/Shipment *Multiple Cases Can be in One Shipment</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Express"
                            checked={shipping === 'Express'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                         Express 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Express Shipping $35 Fee</small>
                        </div>
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Production</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={production === 'Standard'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                         Standard Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Production 4-6 Business Days</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Rush"
                            checked={production === 'Rush'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                         Rush Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Rush Production $50 Fee, 3 Business Days</small>
                        </div>
                    </div>

                
                    <div className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                            <button className="btn btn-primary" type = "submit"  onClick={()=>{setFinalPrice((price+price2)*crownTooth.length+price3)}}>Upload</button>
                            <br></br>
                            <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}><strong>Case Total = ${(price + price2)*crownTooth.length+price3} *Not including Rush Production and/or Shipping</strong></small>
                        </div>
                        
                    </div>
                    
                
                </form>
            :
            (type==="veneer")?
            <form className="form form-container" data-toggle="validator" role="form" onSubmit={(e)=>{e.preventDefault();uploadCase()}}>
                    <div className="row form-group justify-content-center">
                        <div className="text-center col-4">
                            <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
                        </div>
                    </div>
                    <div className="row form-group justify-content-center">
                        <div className="text-center col-4 pt-3">
                        <label  htmlFor="patientName"><h5>Patient Name</h5></label>
                        <input className="form-control" required id="patientName" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
                        </div>
                    </div>
                    <div className="d-flex row pt-4 justify-content-center" >
                        <div className="col-4 form-group text-center pb-4 ">
                            <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
                            <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} readOnly={true} value={crownTooth} onChange={(e)=>setToothInput(e.target.value)}></input>
                        </div>
                        <div className="col-9 col-lg-3 px-5" >
                        <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                                    <path style ={{fill: "white", stroke: "black", strokeWidth:"2px"}} d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                                    onClick={(e)=> toothHandler(e)} ></path>
                                    <path   d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                                    <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                                    <path  d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                                    <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                                    <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                                    <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                                    <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                                    <path  d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
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
                    {/* <div className="row form-group text-center justify-content-center mt-3">
                        <div className="col-9">
                            <button className="btn btn-primary" onClick={()=>(bridge === 'false')?setBridge('true'): setBridge('false')}>Are any of these teeth part of a bridge? If yes click here.</button>
                        </div>
                        {(bridge === "true")?
                            <div className="d-flex row pt-4 justify-content-center" >
                            <div className="col-4 form-group text-center pb-4 ">
                                <label  htmlFor="toothInput"><h5>Bridge Teeth</h5></label>
                                <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px"}} readOnly={true} value={bridgeTooth} onChange={(e)=>setToothInput2(e.target.value)}></input>
                            </div>
                            <div className="col-9 col-lg-3 px-5" >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                                <path d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                                onClick={(e)=> bridgeHandler(e)} ></path>
                                <path d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                                <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M374.43,109.84c3.85-4.81,9.51-7,16.91-6.51l-.14-.34c-7.82-.86-12.82.91-16.73,6.34Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M365.59,129.77l.45.85c-1.13-5.57.12-11.34,4-17.56l-.63.23C365.23,119.77,364.24,124.09,365.59,129.77Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M401.14,102.32c9.66,9.6,19.12,16.14,28.94,20a10.44,10.44,0,0,0,3.76.71,13.19,13.19,0,0,0,9.38-3.82,17.09,17.09,0,0,0,3.69-6.48c.77-2.58.44-5.86.15-8.75-.05-.52-.1-1-.14-1.49a68.75,68.75,0,0,0-3.21-15.61,60.53,60.53,0,0,0-2.11-5.73c-.3-.68-.61-1.32-.93-1.91a8.45,8.45,0,0,0-4.6-3.74v-.07l-.32,0a5.71,5.71,0,0,0-.58-.21,4.59,4.59,0,0,0-1.7-.09c-17.07-1.92-30.7,5.16-35.1,18.5h0a5.89,5.89,0,0,0-.26.7C397.25,97.19,399.28,100.25,401.14,102.32Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="7" 
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M432.33,82.75c-11.12,1.48-19.73,5.91-25.61,13.64C412.22,87.21,421,82.84,432.33,82.75Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M444.52,86.59c.28.6.56,1.21.84,1.85a61.43,61.43,0,0,0,18.69,24.47,18.32,18.32,0,0,0,10.6,3.94h0c4.33,0,8.69-1.91,13-5.8l.09-.1c5.7-8.6,9.72-19.06,12.29-32a21.81,21.81,0,0,0,.36-7.89c-.31-1.82-.88-5.21-2.67-6.39a3.4,3.4,0,0,0-.69-.34h0c-20.31-8.75-37.58-6.72-51.34,6a4.86,4.86,0,0,0-1.73,1.36c-1.3,1.66-1.59,3.92-1.71,5.92C442,81.22,443.22,83.83,444.52,86.59Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="8" 
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M560.55,78c-.1-2-.38-4.27-1.66-5.94a4.86,4.86,0,0,0-1.72-1.37C543.54,57.8,526.29,55.6,505.9,64.15h0a3.42,3.42,0,0,0-.7.33c-1.8,1.17-2.4,4.55-2.73,6.37a21.88,21.88,0,0,0,.28,7.88c2.44,12.93,6.36,23.43,12,32.09l.09.1c4.23,3.93,8.57,5.92,12.91,5.92h0A18.37,18.37,0,0,0,538.37,113a61.46,61.46,0,0,0,18.92-24.29c.29-.64.58-1.25.87-1.84C559.48,84.13,560.72,81.53,560.55,78Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="9" 
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M604.23,94.81c-.08-.25-.17-.48-.26-.71h0c-4.27-13.38-17.83-20.59-34.92-18.84a4.86,4.86,0,0,0-1.7.07l-.58.21-.32,0v.07a8.5,8.5,0,0,0-4.64,3.7c-.32.59-.64,1.23-1,1.9-.82,1.82-1.49,3.74-2.17,5.71a69.17,69.17,0,0,0-3.35,15.58c-.05.47-.1,1-.16,1.49-.32,2.89-.68,6.16.07,8.75a17.14,17.14,0,0,0,3.62,6.51,13.15,13.15,0,0,0,9.34,3.91,10.44,10.44,0,0,0,3.77-.66c9.86-3.8,19.38-10.25,29.13-19.75C603,100.73,605.07,97.68,604.23,94.81Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="10" 
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M605.61,146.07a16.23,16.23,0,0,1-3.3-.31c-3.32-.69-7.74-2.45-10-6.86-2.34-4.67-1.57-10.09-.66-14.8,1.66-8.55,6.63-23.51,21.25-27.6,3.61-1,8.36-1.22,14.16-.62a25.46,25.46,0,0,1,10.67,3.23c8.85,5.29,10.05,17.42,8.22,27a23.67,23.67,0,0,1-1.74,5.58,15.73,15.73,0,0,1-2.47,4,12.53,12.53,0,0,1-2.62,2l-.54.33c-4.82,3.06-10.53,4.48-15.51,5.57-3.6.79-7.3,1.42-11,1.89l-1.1.14A42.3,42.3,0,0,1,605.61,146.07Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="11" 
                                onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M629.22,186.51h-1.05c-2.44,0-4.23-1.49-6-2.92l-.48-.39c-3.76-3.06-6.18-6.14-7.41-9.42a14.41,14.41,0,0,1-.92-5.54,12.37,12.37,0,0,1,2.69-7.84c.58-.72,1.15-1.46,1.72-2.19,1-1.24,1.92-2.49,2.92-3.7a89.83,89.83,0,0,1,10.39-10.86,42.1,42.1,0,0,1,7.78-5.41,11.8,11.8,0,0,1,5.22-1.39,32.13,32.13,0,0,1,6.47.68l1.17.19a57,57,0,0,1,10.35,2.65c5.52,2,12.54,6,14.62,13.17a17.65,17.65,0,0,1-.11,9.31c-.79,3-2.5,8.53-5.17,11.08a41.62,41.62,0,0,1-15.89,9.27C646.76,186.11,637.7,186.51,629.22,186.51Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="12" 
                            onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M698.66,194.17a17.68,17.68,0,0,0-6.19-6.84,48,48,0,0,0-15-6.74c-6-1.51-11.6-1.31-16.21.6-6.53,2.69-12,7.6-15.51,11.06-1.39,1.36-3.2,3.16-5,5.11q-.54.6-1.11,1.2a25,25,0,0,0-2.63,3.08,13,13,0,0,0-1,1.69,14,14,0,0,0-1.1,9.74c1.8,6.84,8.46,12.82,15.17,13.61A48.76,48.76,0,0,0,656,227c1.51,0,3.11,0,5.2-.14a68.32,68.32,0,0,0,9.64-1.22c7-1.38,15.76-3.83,21.87-10.59a28.79,28.79,0,0,0,6.08-10.66C699.74,201.25,700.41,197.84,698.66,194.17Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="13" onClick={(e)=>  bridgeHandler(e)(e)}></path>
                                <path d="M677.34,296.1h0l-.46,0a27.08,27.08,0,0,1-14.66-5.58l-.1-.1c-6.39-8.26-10.68-15.84-13.49-23.83A25.39,25.39,0,0,1,651,245a20.28,20.28,0,0,1,2-2.71c11.2-12.59,25.07-19.81,38.05-19.81a36.27,36.27,0,0,1,9.71,1.33c6.21,1.74,11,6.92,11.81,12.9a79.16,79.16,0,0,0,7.25,24.07c2.15,4.36.58,9.86-.79,13.62-1.86,5.12-6,7.81-9.85,9.77l-1,.51a143.94,143.94,0,0,1-14.29,6.67c-2.77,1.06-5.62,2-8.48,2.79-.6.17-1.26.39-2,.61A21.82,21.82,0,0,1,677.34,296.1Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="14" onClick={(e)=>  bridgeHandler(e)(e)}></path>
                                <path d="M493.62,73.94l-1.09-.34c-14-3.73-28.66-2-42.88,5l.65-.48C464.89,69,479.54,67.89,493.62,73.94Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M728.63,323.7c-.37-1.8-.86-3.57-1.29-5.09a11.77,11.77,0,0,1-.35-2.45c0-.39,0-.8-.1-1.21a29.4,29.4,0,0,1,.05-5.47,23.4,23.4,0,0,0-.26-7.41,18.43,18.43,0,0,0-7.5-10.13,19.3,19.3,0,0,0-10-3.43,9.8,9.8,0,0,0-1.47.1c-10.4,1.62-21.5,5.37-33.94,11.47-4.28,2.4-6.34,6.83-6.12,13.15,0,1.5,0,3,0,4.47a83.19,83.19,0,0,0,1.06,10.89,27.19,27.19,0,0,0,.76,3.08c.09.34.19.68.29,1a11.06,11.06,0,0,1,.28,2.13,14.57,14.57,0,0,0,.24,2,19.36,19.36,0,0,0,10,13.27,23.27,23.27,0,0,0,10.52,2.3l1.41,0a52.7,52.7,0,0,0,11.89-2.26,121,121,0,0,0,15.7-5.77c.4-.18.84-.35,1.29-.53,1.78-.7,3.8-1.5,4.8-3.07a21.2,21.2,0,0,0,2.84-6.57A24.42,24.42,0,0,0,728.63,323.7Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="15" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M697.73,438.53a30.44,30.44,0,0,1-6.6-.77,76.67,76.67,0,0,1-11.51-3.87l-2.8-1.09-1.58-.61c-4.31-1.64-8.78-3.33-12.34-6.38a15.61,15.61,0,0,1-5.13-8.22c-.63-2.75-.21-6.06,1.28-10.12l.14,0a29.43,29.43,0,0,1,3.11-7.28c.7-1.29,1.42-2.62,2.06-4.07.45-1,.9-2.15,1.35-3.28,1.42-3.55,2.9-7.21,5.12-10a28.59,28.59,0,0,1,13.4-9.7c6.75-2.14,14.69-1.29,24.26,2.61s15.47,8.9,18,15.25c2.23,5.61,1.39,11.5.29,15.45-.94,3.36-2.88,6.35-4.75,9.24-.94,1.43-1.9,2.92-2.71,4.41-.54,1-1,2-1.57,3-2.83,5.46-5.76,11.11-11.47,13.69A20.74,20.74,0,0,1,697.73,438.53Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="18" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M704.14,471.94a28.76,28.76,0,0,0-.5-3.77c-.17-.91-.33-1.85-.43-2.77-.22-2.21-.42-4.43-.61-6.64-.07-.86-.1-1.72-.14-2.57-.12-2.8-.24-5.69-1.65-8.37-.28-.52-.6-1-.91-1.48-1.66-2.55-4.54-4.39-6.85-5.87a43.33,43.33,0,0,0-8.35-4.15,41.42,41.42,0,0,0-18.33-2.51c-4.94.47-11.77,1.74-16.31,5.09L650,439a1.48,1.48,0,0,0-.29.22c-6.86,6.28-10.53,16.3-13.76,25.14-1,2.87-2,5.58-3.08,8-2.84,6.55-1.41,16.3,5.84,20.64l.74.44c5.39,3.23,10.48,6.28,16.29,8.55a81.09,81.09,0,0,0,9.37,3c.67.17,1.35.37,2,.56a24,24,0,0,0,6.6,1.25h.13a16.35,16.35,0,0,0,7.7-2.2c4.71-2.58,8.55-6.67,12-10.71a66.52,66.52,0,0,0,7.24-10.45C702.94,479.59,704.34,476.19,704.14,471.94Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="19" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M685,485.33l1.07.54C686.42,486,686,485.73,685,485.33Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M673.29,457.85A17.62,17.62,0,0,1,672,446a.71.71,0,0,1,.84-.53,22.87,22.87,0,0,0,4.11.36c1,0,2.07-.05,3.18-.16a40.17,40.17,0,0,1-14.57-3.93,12.06,12.06,0,0,0,4.92,3.1.72.72,0,0,1,.47.84,18.65,18.65,0,0,0,1.33,12.64,25.57,25.57,0,0,0-10.45,10.34h0v0l0,.05A33.6,33.6,0,0,1,642,464.5c4.17,3.57,10.23,5.37,18,5.37.47,0,1,0,1.44,0a13.22,13.22,0,0,0,.67,10.27,8.93,8.93,0,0,0-1,.41c-3.54,1.81-5.77,5.64-6.83,11.66a19.58,19.58,0,0,0-8-.13,38.89,38.89,0,0,1,17.18,4.78,23.61,23.61,0,0,0-8.08-4.37c.69-5.94,3-9,6.27-11,5.22-3,19.22,2.08,23.37,3.83-7.94-4-15.91-7.13-21.84-5.56-1.63-3-1.81-6.44-.48-10.31l.11-.32c5.46-13.07,23.86-13.08,30.27-13C685.23,455.22,678.67,456,673.29,457.85Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M650.53,546.07c-11.39,0-21.43-4.83-30-14.44h0a14.59,14.59,0,0,1-3.45-11.87,24.49,24.49,0,0,1,10.21-16.22,24.16,24.16,0,0,1,16.54-3.71c6.92.81,13.61,3.71,19.8,6.71a24,24,0,0,1,10.93,11.79,19.1,19.1,0,0,1,.24,15.57,16.1,16.1,0,0,1-4,5.39c-1.44,1.27-5.16,4.33-8.72,5.24A46.22,46.22,0,0,1,650.53,546.07Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="20" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M638.47,514.84c1.73-2.4,4.46-3.91,8.09-4.49,2.64,2,7.41,3.66,13.5,5.31-7.48-2.79-13.62-5.71-15.8-9a4.21,4.21,0,0,0,1.26,2.82,12.44,12.44,0,0,0-7.94,4.77c-.13.19-.23.4-.36.59-1.62-2.26-4.24-3.6-7.44-4.43a15.44,15.44,0,0,1,6.49,4.85,1.11,1.11,0,0,1,.1,1.11c-1.58,3.52-1.85,8.26-.86,14.36a25.51,25.51,0,0,0-7.59-1.16h-.35a65.4,65.4,0,0,1,19,7.18,34.85,34.85,0,0,0-9.84-5.63C635.41,523.74,636,518.28,638.47,514.84Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M624.85,583.59c-12.59,0-20.46-8.39-23.38-24.92-.73-4.07-1.14-9.26,2.11-13.22,3.86-4.7,10.22-5.29,14.66-5.32h.34a50,50,0,0,1,16.91,3c6,2.14,9.94,5,12.12,8.84,2.75,4.78,5.34,10.47,3.69,16.42a16.43,16.43,0,0,1-6.4,8.81,28.27,28.27,0,0,1-7.81,4.23A41.17,41.17,0,0,1,624.85,583.59Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="21" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M612.54,562c2-6.66,6-10.2,12.17-10.79a1.6,1.6,0,0,1,1.12.37c2.55,2,7.39,3.4,11.89,4.48,0,0-9.69-3.68-11.78-5.85a11.37,11.37,0,0,1-1.71-3.68,3.81,3.81,0,0,0-.07,3,.54.54,0,0,1-.44.74c-5.86.85-9.89,4.45-12,10.74a.63.63,0,0,1-.92.35,6.6,6.6,0,0,0-3.16-1.12,42.25,42.25,0,0,1,10.73,12.35c-1.79-4.35-3.64-7.52-5.59-9.56A1,1,0,0,1,612.54,562Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M596.57,610.7c-1.3,0-2.59-.08-3.68-.16a41,41,0,0,1-12-2.69c-3.72-1.56-5.84-4.61-6.49-9.33a67,67,0,0,1-.73-20.39c1.07-7.59,4.75-11.29,11-10.94,10.61,2.54,19.47,6.87,26.45,12.87a17.85,17.85,0,0,1,4.65,6.71,9.29,9.29,0,0,1,.94,3.84,20,20,0,0,1-1.86,6.29l0,.14a29.13,29.13,0,0,1-3,5.44,17.24,17.24,0,0,1-15.3,8.22Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="22" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M582.94,603.71a50.27,50.27,0,0,0,27.26-16.28C605,596.15,595.81,601.63,582.94,603.71Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M575.53,603.58l-.07-.11a86.62,86.62,0,0,0-18.85-19.53,12.47,12.47,0,0,0-1.11-.66,10.34,10.34,0,0,0-12.34,1.62,9,9,0,0,0-2,3,27.39,27.39,0,0,0-1.27,3.62,65.46,65.46,0,0,0-1.5,6.9l0,.29a161,161,0,0,0-2,16.14c.37,4.08,2.28,6.65,5.64,7.61a40.26,40.26,0,0,0,14.8,3.25c7.85,0,14.26-3.52,19.09-10.51C577.49,612.22,577.36,608.32,575.53,603.58Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="23" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M572,608.49a110.93,110.93,0,0,1-27.27,8.29h.12C555.25,616.78,564.39,614,572,608.49Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M535.2,611a10.29,10.29,0,0,0-.73-2.15c-.78-1.65-1.42-3.38-2.17-5a83.78,83.78,0,0,0-4-8,44.15,44.15,0,0,0-4.1-5.94c-.21-.26-.43-.51-.65-.76-5.33-6.08-10.76-5.48-15.71,1.79a52.38,52.38,0,0,0-7.6,19c-.25,1.23-.48,2.5-.67,3.77a10.19,10.19,0,0,0,0,4.15,7.71,7.71,0,0,0,4.71,5.62,33.48,33.48,0,0,0,12.28,3.52c.48,0,1,.05,1.45.05,4,0,7.91-1,12.72-3.27a10,10,0,0,0,3.23-2.2c1.88-2.08,1.84-5.27,1.63-7.88A19.65,19.65,0,0,0,535.2,611Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="24" onClick={(e)=>  bridgeHandler(e)(e)}></path>
                                <path d="M460.8,615.79c-.26,2.61-.35,5.8,1.48,7.91a10.13,10.13,0,0,0,3.2,2.26c4.77,2.35,8.67,3.43,12.66,3.5.48,0,1,0,1.45,0a33.42,33.42,0,0,0,12.34-3.3,7.72,7.72,0,0,0,4.81-5.53,10.09,10.09,0,0,0,.1-4.15c-.17-1.27-.37-2.54-.6-3.78A52.15,52.15,0,0,0,489,593.6c-4.82-7.36-10.24-8.06-15.68-2.08-.23.25-.45.49-.66.74a44.8,44.8,0,0,0-4.2,5.87,81.47,81.47,0,0,0-4.2,7.88c-.78,1.66-1.46,3.37-2.27,5a11,11,0,0,0-.76,2.13A19.86,19.86,0,0,0,460.8,615.79Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="25" onClick={(e)=>  bridgeHandler(e)(e)}></path>
                                <path d="M420.44,616.64c4.7,7.08,11,10.71,18.9,10.86a40.47,40.47,0,0,0,14.85-3c3.37-.9,5.34-3.43,5.78-7.51a157.59,157.59,0,0,0-1.68-16.17l-.05-.29a62.68,62.68,0,0,0-1.37-6.92,27.29,27.29,0,0,0-1.2-3.65,9.26,9.26,0,0,0-1.94-3,10.35,10.35,0,0,0-12.31-1.84c-.38.2-.76.41-1.12.64a86.86,86.86,0,0,0-19.2,19.18l-.07.12C419.11,609.76,418.91,613.66,420.44,616.64Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="26" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M702.2,323.49a9,9,0,0,1-3-.61,8.1,8.1,0,0,1-3-2.77c-.84-1.15-1.79-2.24-2.58-3.42-1.79-2.64-3.32-5.69-3.42-8.94a9.86,9.86,0,0,1,.24-2.54,12.79,12.79,0,0,1,.93-2.48s1-.56,1.21-.67a25.44,25.44,0,0,0,4.55-3.29c-3,1.53-6.05,3.83-12.28,3.89a13.21,13.21,0,0,0,3.13.39,11.35,11.35,0,0,0,2.18-.22c-3.09,7.59,2.49,14.93,8.13,21.26.24.27-.55,2.38-.66,2.75a27,27,0,0,1-1.08,2.88,31.85,31.85,0,0,1-3.13,5.35c-5.74-1.49-16.49-.63-16.5.15a50.78,50.78,0,0,1,16.61,1A35,35,0,0,1,706,341.9a10.35,10.35,0,0,0-4.37,3.59c3.55-3.3,8.39-4.33,14.23-3.61a34.05,34.05,0,0,0-7.22-.6,4.14,4.14,0,0,1-2.63-.72,36,36,0,0,0-11.33-5.2,27.38,27.38,0,0,0,4.83-11.2,25.17,25.17,0,0,0,17.82-3.69,25.55,25.55,0,0,0,4.78-4C719.66,319,711.54,324.41,702.2,323.49Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M694.21,281.74a32.11,32.11,0,0,1-13.51-7.41c1.13-1.33,1.43-3.47,1.67-5.17,0-.37.1-.73.15-1a71.36,71.36,0,0,0,1-9.22,3.39,3.39,0,0,0,.93.12l.52,0a67.76,67.76,0,0,0,7.66-.88,73.85,73.85,0,0,0,7.79-1.79,80.7,80.7,0,0,0,7.85-2.69c.63-.25,1.25-.53,1.88-.77-.64.15-1.32.2-2,.32s-1.34.26-2,.41c-1.33.29-2.65.64-3.95,1-2.18.67-4.32,1.42-6.55,1.95a45.46,45.46,0,0,1-5.68.94c-.79.08-1.58.15-2.38.21s-1.81.17-2.71.17a2.47,2.47,0,0,1-1.4-.18,2.76,2.76,0,0,1-.85-1.27l-.08-.19a11.76,11.76,0,0,0-3.21-4.19,22.23,22.23,0,0,0-2.39-1.66,22.67,22.67,0,0,1-2-1.38,35.55,35.55,0,0,1,2.32-14,2.34,2.34,0,0,1,1.14-1.2c.53-.26,1.05-.53,1.56-.84a10.93,10.93,0,0,0,1.38-1.08,23.55,23.55,0,0,1-9.3,2.65,9.94,9.94,0,0,0,2.49.26,8.24,8.24,0,0,0,2.12-.31c-.1,0-.29.72-.34.83l-.33.89c-.21.59-.41,1.19-.59,1.79a36,36,0,0,0-.89,3.72c-.2,1-.34,2.07-.45,3.11,0,.53-.09,1.05-.13,1.58,0,.26,0,.53,0,.79a4.44,4.44,0,0,1,0,.82,3.36,3.36,0,0,1-.89-.71,7.39,7.39,0,0,1-.82-.86,17.77,17.77,0,0,1-1.82-3.06,24.3,24.3,0,0,0-2.12-3.2q-.3-.41-.63-.78a7.71,7.71,0,0,0,.55,1.79,8.61,8.61,0,0,0,.57,1.28c.34.6.73,1.56,1.17,2.38a12.14,12.14,0,0,0,1.43,2.32,25.76,25.76,0,0,0,3.62,3.15c.48.33,1,.64,1.48,1a22.35,22.35,0,0,1,2.28,1.57,10.71,10.71,0,0,1,2.9,3.8l.08.19a4.7,4.7,0,0,0,.85,1.41h-.06a69.09,69.09,0,0,1-1,9.61c-.06.33-.11.69-.17,1.08-.31,2.22-.69,5-2.75,5.41l-1.3.27c-4.52,1-6.9,1.81-11.5,1.14l-4-.48a21.54,21.54,0,0,0,6.8,1.67,43.41,43.41,0,0,0,8.88-1.26l1.29-.27a3.44,3.44,0,0,0,1.11-.44c3.71,3.35,8.59,5.85,14.85,7.65a37.93,37.93,0,0,1-4.79,1.77l-3,1.2A29.38,29.38,0,0,0,693,284a30.44,30.44,0,0,0,5.87-2.95,16.72,16.72,0,0,0,4.35-3.86c.09-.12.38-.42.34-.55a5.24,5.24,0,0,0-1.41,1.12c-.53.48-1,.78-1.46,1.17a32,32,0,0,1-3,2.08,7.53,7.53,0,0,1-1.36.65A3.63,3.63,0,0,1,694.21,281.74Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M667.72,210.8c.1-4.24-1.89-7.91-5.91-10.94a33.34,33.34,0,0,0,10.43-11.13l-1.76,1.89c-6.31,7.34-10.29,10.42-19.24,12.14l-2.86.36c.63,0,1.25.08,1.87.08a21.43,21.43,0,0,0,10.53-2.72c4.15,3,6.05,6.49,5.81,10.71a17.79,17.79,0,0,0-8.5,7.41l2.22-2a20.77,20.77,0,0,1,7.09-4.84s.27-.05.27-.09c3.13-1.09,6.7-1.14,11.87-.44a6.74,6.74,0,0,0,1,.08l2.31,0C676.91,209.65,671.9,209.47,667.72,210.8Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M646.47,171.6c.42-6-2.6-10.79-9-14.39a43.45,43.45,0,0,0,12.25-9.86l-2.6,1.83c-7.52,5.87-12.44,8.77-21.42,11.42l-1.23.75a37.68,37.68,0,0,0,11.83-3.54c6.72,3.57,9.67,8.26,9,14.3a19.79,19.79,0,0,0-7.81,7l2-1.9c6.34-5.37,11.49-6,20.26-5.81l1.61-.16C655.55,169.84,650.62,170,646.47,171.6Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M628,110c-3.81-4.85-9.45-7.14-16.86-6.67l.15-.34c7.83-.78,12.81,1,16.66,6.51Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M636.67,130.06l-.46.85c1.19-5.56,0-11.35-3.79-17.6l.63.23C637.12,120.06,638.07,124.39,636.67,130.06Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M570.13,82.9C581.24,84.49,589.8,89,595.6,96.79,590.19,87.56,581.46,83.1,570.13,82.9Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M509.18,73.75l1.09-.33c14-3.6,28.68-1.77,42.83,5.43l-.64-.49C538,69,523.32,67.84,509.18,73.75Z" transform="translate(-270.52 -59.04)"></path>
                                <path d="M394.12,610.91a18.84,18.84,0,0,1-9.41-7.62,28.72,28.72,0,0,1-2.86-5.49l-.06-.13a20.78,20.78,0,0,1-1.74-6.33,9.23,9.23,0,0,1,1-3.82,17.7,17.7,0,0,1,4.77-6.62c7.09-5.88,16-10,26.68-12.39,6.28-.24,9.89,3.52,10.82,11.13a67.38,67.38,0,0,1-1.1,20.38c-.74,4.7-2.91,7.71-6.66,9.2a40.57,40.57,0,0,1-12,2.47c-1.1.06-2.39.12-3.69.1A18.57,18.57,0,0,1,394.12,610.91Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="27" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M359.88,581.83a28.51,28.51,0,0,1-7.73-4.38,16.43,16.43,0,0,1-6.24-8.92c-1.55-6,1.14-11.62,4-16.36,2.26-3.76,6.28-6.58,12.29-8.61a49.71,49.71,0,0,1,17-2.72h.34c4.44.12,10.78.82,14.55,5.59,3.18,4,2.68,9.19,1.88,13.25-3.22,16.48-11.24,24.72-23.83,24.49A41,41,0,0,1,359.88,581.83Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="28" onClick={(e)=>  bridgeHandler(e)}></path>
                                <path d="M347.81,546.21a45.89,45.89,0,0,1-12.25-1.76c-3.55-1-7.22-4.11-8.63-5.4a16.27,16.27,0,0,1-3.94-5.46,19.19,19.19,0,0,1,.53-15.57,24,24,0,0,1,11.14-11.58c6.25-2.89,13-5.67,19.92-6.36a24.17,24.17,0,0,1,16.47,4,24.48,24.48,0,0,1,9.91,16.4,14.56,14.56,0,0,1-3.66,11.81h0C368.79,541.55,358.9,546.21,347.81,546.21Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="29" onClick={(e)=>  bridgeHandler(e)}></path>
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
                            :""
                        }
                        
                    </div> */}
                    <div className="row form-group justify-content-center mt-3">
                        <div className="text-center col-8 col-lg-4 pt-3">
                        <label htmlFor="Notes" className="form-label"><h5>Prescription Information</h5></label>
                        <textarea className="form-control" style={{backgroundColor:"white", border:"black 1px solid"}} id="Notes" rows="3" value={note} placeholder={"Please include all pertinent case information as well as if any teeth are part of a bridge. Please note any virtual extractions"} onChange={(e)=>setNote(e.target.value)}></textarea>
                
                        </div>
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>3D Printed Model</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="No"
                            checked={model3D === 'No'}
                            onChange={(e)=>{setModel3D(e.target.value); setPrice3(0)}}
                        />
                        No
                        </label>
                        
                        <small  className="form-text text-muted"  style={{color:"white"}}></small>
                        
                        <label style={{color:"black", paddingLeft: "10px"}}>
                        <input style={{paddingLeft: "10px"}}
                            type="radio"
                            value="Yes"
                            checked={model3D === 'Yes'}
                            onChange={(e)=>{setModel3D(e.target.value)}}
                            
                        />
                         Yes 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>3D Printed Models $10/Arch</small>
                        </div>
                    </div>



                    <div className="row form-group text-center justify-content-center mt-5">
                        <div className= "col-8 col-lg-4">
                            <label  htmlFor="product"><h5>Shade</h5></label>
                            <select className="form-select" id="shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Shade" onChange={(e)=>{setShade(e.target.value)}}>
                                <option value="Select One">Select One</option>
                                <option value="A1" onClick={()=>setShade("A1")}>A1</option>
                                <option value="A2" onClick={()=>setShade("A2")}>A2</option>
                                <option value="A3" onClick={()=>setShade("A3")}>A3</option>
                                <option value="A3.5" onClick={()=>setShade("A3.5")}>A3.5</option>
                                <option value="A4" onClick={()=>setShade("A4")}>A4</option>
                                <option value="B1" onClick={()=>setShade("B1")}>B1</option>
                                <option value="B2" onClick={()=>setShade("B2")}>B2</option>
                                <option value="B3" onClick={()=>setShade("B3")}>B3</option>
                                <option value="B4" onClick={()=>setShade("B4")}>B4</option>
                                <option value="C1" onClick={()=>setShade("C1")}>C1</option>
                                <option value="C2" onClick={()=>setShade("C2")}>C2</option>
                                <option value="C3" onClick={()=>setShade("C3")}>C3</option>
                                <option value="C4" onClick={()=>setShade("C4")}>C4</option>
                                <option value="D2" onClick={()=>setShade("D2")}>D2</option>
                                <option value="D3" onClick={()=>setShade("D3")}>D3</option>
                                <option value="D4" onClick={()=>setShade("D4")}>D4</option>
                                <option value="Bleach" onClick={()=>setShade("Bleach")}>Bleach</option>
                            </select>
                        </div>
                    </div>
                    <div className="row form-group text-center justify-content-center mt-5">
                        <div className= "col-8 col-lg-4">
                            <label  htmlFor="product"><h5>Product</h5></label>
                            <select className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Product" onChange={(e)=>{setProduct(e.target.value)}}>
                                <option value="Select One">Select One</option>
                                <option value="UHT Zirconia Stain and Glaze" onClick={()=>{setProduct("UHT Zirconia Stain and Glaze")}}>Ultra Premium UHT Zirconia Stain and Glaze</option>

                            </select>
                            <small id="productPrice" className="form-text text-muted" >
                                <strong>
                                    {(product === "UHT Zirconia Stain and Glaze")?
                                        `$${(price += 95)*crownTooth.length}`
                                    
                                    
                                    
                                    : ""
                                    }
                                </strong>
                                </small>
                        </div>
                    </div>
                    
                    {/* <div className="row form-group text-center justify-content-center mt-5">
                        <div className= "col-8 col-lg-4">
                            <label  htmlFor="finish"><h5>Finish</h5></label>
                            <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
                                <option value="Select One">Select One</option>
                               
                                <option value="Stain and Glaze" onClick={()=>{setFinish("Stain and Glaze")}}>Stain and Glaze</option>
                                
                            </select>
                           
                        </div>
                    </div> */}
                    <div className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4 pt-3">
                        <label  htmlFor="picUpload"><h5>Upload Photos</h5></label>
                        <br></br>
                        {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                        <input 
                            className="form-control" 
                            
                            id="picUpload" 
                            type="file" 
                            multiple 
                            style={{ display: 'none' }} // Hide the file input
                            onChange={(e) => {
                                const pics = e.target.files; // Get all selected files
                                const newPics = [...photos]; // Copy the current files in state
                                const newPicName = [...photoName];

                                // Loop through each selected file and add it to the new arrays
                                for (let i = 0; i < pics.length; i++) {
                                    newPics.push(pics[i]);
                                    newPicName.push(pics[i].name);
                                }

                                // Update state with the new arrays of files and file names
                                setPhotos(newPics);
                                setPhotoName(newPicName);
                            }}
                        />
                        <button 
                            className="btn btn-primary"
                            onClick={(e) => {e.preventDefault(); document.getElementById('picUpload').click()}} // Trigger file input click
                        >
                            Select Files
                        </button>
                        
                        <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                            {photoName.join(', ')} {/* Display selected file names */}
                        </div>
                        </div>
                        {/* <div className="text-center col-8 col-lg-4 pt-3">
                        
                        </div> */}
                    </div>
                    <div className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4 pt-3">
                        <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
                        <br></br>
                        {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                        <input 
                            className="form-control" 
                            
                            id="scanUpload" 
                            type="file" 
                            multiple 
                            style={{ display: 'none' }} // Hide the file input
                            onChange={(e) => {
                                const files = e.target.files; // Get all selected files
                                const newFiles = [...stlFile]; // Copy the current files in state
                                const newFileName = [...fileName];

                                // Loop through each selected file and add it to the new arrays
                                for (let i = 0; i < files.length; i++) {
                                    newFiles.push(files[i]);
                                    newFileName.push(files[i].name);
                                }

                                // Update state with the new arrays of files and file names
                                setStlFile(newFiles);
                                setFileName(newFileName);
                            }}
                        />
                        <button 
                            className="btn btn-primary"
                            onClick={(e) =>{ e.preventDefault(); document.getElementById('scanUpload').click()}} // Trigger file input click
                        >
                            Select Files
                        </button>
                        
                        <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                            {fileName.join(', ')} {/* Display selected file names */}
                        </div>
                        </div>
                        {/* <div className="text-center col-8 col-lg-4 pt-3">
                        
                        </div> */}
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping To KPD (Physical Impressions)</h5></label>
                        <br></br>
                        <button className="btn btn-primary" onClick={(e)=> {e.preventDefault(); getLabelToKpd(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print USPS Label</button>
          
          <button className="btn btn-primary" style={{marginLeft: "5px"}}  onClick={(e)=> {e.preventDefault(); UPSLabel(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print UPS Label</button>
                      
                       
                        </div>
                    </div>

                    
                        
                        
                       
                        


                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping from KPD</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={shipping === 'Standard'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                         Standard 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Shipping $10/Shipment *Multiple Cases Can be in One Shipment</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Express"
                            checked={shipping === 'Express'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                         Express 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Express Shipping $35 Fee</small>
                        </div>
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Production</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={production === 'Standard'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                         Standard Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Production 4-6 Business Days</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Rush"
                            checked={production === 'Rush'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                         Rush Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Rush Production $50 Fee, 3 Business Days</small>
                        </div>
                    </div>
                
                    <div className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                            <button className="btn btn-primary" type = "submit" onClick={()=>{setFinalPrice((price+price2)*crownTooth.length+price3)}} >Upload</button>
                            <br></br>
                            <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}><strong>Case Total = ${(price + price2)*crownTooth.length+price3} *Not including Rush Production and/or Shipping</strong></small>
                        </div>
                        
                    </div>
                    
                
                </form>


            :
            (type==="partial")?
            <form className="form form-container" data-toggle="validator" role="form" onSubmit={(e)=>{e.preventDefault();uploadCase()}}>
            <div className="row form-group justify-content-center">
                <div className="text-center col-4">
                    <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
                </div>
            </div>
            <div className="row form-group justify-content-center">
                <div className="text-center col-4 pt-3">
                <label  htmlFor="patientName"><h5>Patient Name</h5></label>
                <input className="form-control" required id="patientName" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
                </div>
            </div>
            <div className="d-flex row pt-4 justify-content-center" >
                <div className="col-4 form-group text-center pb-4 ">
                    <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
                    <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} readOnly={true} value={crownTooth} onChange={(e)=>{setToothInput(e.target.value)}}></input>
                </div>
                <div className="col-9 col-lg-3 px-5" >
                <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                            <path style ={{fill: "white", stroke: "black", strokeWidth:"2px"}} d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                            onClick={(e)=> toothHandler(e)} ></path>
                            <path   d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                            <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                            <path  d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                            <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                            <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                            <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                            <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                            <path  d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
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
           
            <div className="row form-group justify-content-center mt-3">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label htmlFor="Notes" className="form-label"><h5>Prescription Information</h5></label>
                <textarea className="form-control" style={{backgroundColor:"white", border:"black 1px solid"}} id="Notes" rows="3" value={note} placeholder={"Please include all pertinent case information as well as if any teeth are part of a bridge. Please note any virtual extractions"} onChange={(e)=>setNote(e.target.value)}></textarea>
        
                </div>
            </div>

            <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>3D Printed Model</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="No"
                            checked={model3D === 'No'}
                            onChange={(e)=>{setModel3D(e.target.value); setPrice3(0)}}
                        />
                        No
                        </label>
                        
                        <small  className="form-text text-muted"  style={{color:"white"}}></small>
                        
                        <label style={{color:"black", paddingLeft: "10px"}}>
                        <input style={{paddingLeft: "10px"}}
                            type="radio"
                            value="Yes"
                            checked={model3D === 'Yes'}
                            onChange={(e)=>{setModel3D(e.target.value)}}
                            
                        />
                         Yes 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>3D Printed Models $10/Arch</small>
                        </div>
                    </div>



            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="product"><h5>Shade</h5></label>
                    <select className="form-select" id="shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Shade" onChange={(e)=>{setShade(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="A1" onClick={()=>setShade("A1")}>A1</option>
                        <option value="A2" onClick={()=>setShade("A2")}>A2</option>
                        <option value="A3" onClick={()=>setShade("A3")}>A3</option>
                        <option value="A3.5" onClick={()=>setShade("A3.5")}>A3.5</option>
                        <option value="A4" onClick={()=>setShade("A4")}>A4</option>
                        <option value="B1" onClick={()=>setShade("B1")}>B1</option>
                        <option value="B2" onClick={()=>setShade("B2")}>B2</option>
                        <option value="B3" onClick={()=>setShade("B3")}>B3</option>
                        <option value="B4" onClick={()=>setShade("B4")}>B4</option>
                        <option value="C1" onClick={()=>setShade("C1")}>C1</option>
                        <option value="C2" onClick={()=>setShade("C2")}>C2</option>
                        <option value="C3" onClick={()=>setShade("C3")}>C3</option>
                        <option value="C4" onClick={()=>setShade("C4")}>C4</option>
                        <option value="D2" onClick={()=>setShade("D2")}>D2</option>
                        <option value="D3" onClick={()=>setShade("D3")}>D3</option>
                        <option value="D4" onClick={()=>setShade("D4")}>D4</option>
                        <option value="Bleach" onClick={()=>setShade("Bleach")}>Bleach</option>
                    </select>
                </div>
            </div>
            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="product"><h5>Product</h5></label>
                    <select className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Product" onChange={(e)=>{setProduct(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        {/* <option value="Custom Tray" onClick={()=>setProduct("Custom Tray")}>Custom Tray</option>
                        <option value="Wax Rim" onClick={()=>setProduct("Wax Rim")}>Wax Rim</option> */}
                        <option value="Try In" onClick={()=>setProduct("Try In")}>Try In</option>
                        {/* <option value="TCS Unbreakable" onClick={()=>setProduct("TCS Unbreakable")}>TCS Unbreakable</option> */}
                        <option value="Acetal" onClick={()=>setProduct("Acetal")}>Acetal</option>
                    </select>
                    <small id="productPrice" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(product === "Custom Tray" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                
                                    `$${(price += 35)}`
                                

                                : (product === "Custom Tray" && lowerArch && upperArch)?    
                                    `$${(price += 70)}`

                                :(product==="Wax Rim" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                `$${(price += 50)}`

                                : (product === "Wax Rim" && lowerArch && upperArch)?    
                                    `$${(price += 100)}`
                                
                                :(product==="Try In" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                `$${(price += 35)}`

                                : (product === "Try In" && lowerArch && upperArch)?    
                                    `$${(price += 70)}`

                                :(product==="TCS Unbreakable" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                `$${(price += 250)}`

                                : (product === "TCS Unbreakable" && lowerArch && upperArch)?    
                                    `$${(price += 500)}`
                                
                                :(product==="Acetal" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                    `$${(price += 250)}`
    
                                : (product === "Acetal" && lowerArch && upperArch)?    
                                        `$${(price += 500)}`
                                    
                                :""
                                
                                    
                                }
                                
                                </strong></small>
                </div>
            </div>
            {(product === "Acetal")?                 
            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="gum-shade"><h5>Gum Shade</h5></label>
                    <select className="form-select" id="gum-shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Gum-Shade" onChange={(e)=>{setGumShade(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="Opaque Pink" onClick={()=>setGumShade("Opaque Pink")}>Opaque Pink (Standard)</option>
                        <option value="100% Clear" onClick={()=>setGumShade("100% Clear")}>100% Clear</option>
                        <option value="Translucent Pink" onClick={()=>setGumShade("Translucent Pink")}>Translucent Pink</option>
                        <option value="Meharry" onClick={()=>setGumShade("Meharry")}>Meharry</option>
                        <option value="Clear with Pink Facial Tissue Composite" onClick={()=>setGumShade("Clear with Pink Facial Tissue Composite")}>Clear with Pink Facial Tissue Composite</option>
                        
                    </select>
                    <small id="productPrice" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(gumShade === "Clear with Pink Facial Tissue Composite" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                
                                    `$${(price2 += 50)}`
                                


                               
                                    
                                : (product === "Clear with Pink Facial Tissue Composite" && lowerArch && upperArch)?    
                                `$${(price2 += 100)}`
                            
                                :""
                                
                                    
                                }
                                
                                </strong></small>
                </div>
            </div>
            :""}
            
            {/* <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="finish"><h5>Finish</h5></label>
                    <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="Polished" onClick={()=>setFinish("Polished")}>Polished</option>
                        <option value="Stain and Glaze" onClick={()=>setFinish("PMMA Temporary")}>Stain and Glaze</option>
                    </select>
                </div>
            </div> */}
            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label  htmlFor="picUpload"><h5>Upload Photos</h5></label>
                <br></br>
                {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                <input 
                    className="form-control" 
                    
                    id="picUpload" 
                    type="file" 
                    multiple 
                    style={{ display: 'none' }} // Hide the file input
                    onChange={(e) => {
                        const pics = e.target.files; // Get all selected files
                        const newPics = [...photos]; // Copy the current files in state
                        const newPicName = [...photoName];

                        // Loop through each selected file and add it to the new arrays
                        for (let i = 0; i < pics.length; i++) {
                            newPics.push(pics[i]);
                            newPicName.push(pics[i].name);
                        }

                        // Update state with the new arrays of files and file names
                        setPhotos(newPics);
                        setPhotoName(newPicName);
                    }}
                />
                <button 
                    className="btn btn-primary"
                    onClick={(e) => {e.preventDefault(); document.getElementById('picUpload').click()}} // Trigger file input click
                >
                    Select Files
                </button>
                
                <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                    {photoName.join(', ')} {/* Display selected file names */}
                </div>
                </div>
                {/* <div className="text-center col-8 col-lg-4 pt-3">
                
                </div> */}
            </div>
            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
                <br></br>
                {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                <input 
                    className="form-control" 
                    
                    id="scanUpload" 
                    type="file" 
                    multiple 
                    style={{ display: 'none' }} // Hide the file input
                    onChange={(e) => {
                        const files = e.target.files; // Get all selected files
                        const newFiles = [...stlFile]; // Copy the current files in state
                        const newFileName = [...fileName];

                        // Loop through each selected file and add it to the new arrays
                        for (let i = 0; i < files.length; i++) {
                            newFiles.push(files[i]);
                            newFileName.push(files[i].name);
                        }

                        // Update state with the new arrays of files and file names
                        setStlFile(newFiles);
                        setFileName(newFileName);
                    }}
                />
                <button 
                    className="btn btn-primary"
                    onClick={(e) =>{ e.preventDefault(); document.getElementById('scanUpload').click()}} // Trigger file input click
                >
                    Select Files
                </button>
                
                <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                    {fileName.join(', ')} {/* Display selected file names */}
                </div>
                </div>
                {/* <div className="text-center col-8 col-lg-4 pt-3">
                
                </div> */}
            </div>

            <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping To KPD (Physical Impressions)</h5></label>
                        <br></br>
                        <button className="btn btn-primary" onClick={(e)=> {e.preventDefault(); getLabelToKpd(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print USPS Label</button>
          
          <button className="btn btn-primary" style={{marginLeft: "5px"}}  onClick={(e)=> {e.preventDefault(); UPSLabel(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print UPS Label</button>
                      
                       
                        </div>
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping from KPD</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={shipping === 'Standard'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                         Standard 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Shipping $10/Shipment *Multiple Cases Can be in One Shipment</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Express"
                            checked={shipping === 'Express'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                         Express 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Express Shipping $35 Fee</small>
                        </div>
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Production</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={production === 'Standard'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                         Standard Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Production 4-6 Business Days</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Rush"
                            checked={production === 'Rush'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                         Rush Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Rush Production $50 Fee, 3 Business Days</small>
                        <small  className="form-text text-muted"  style={{color:"white"}}>*For 1-2 Day Production Times Please Call*</small>
                        </div>
                    </div>

            
        
            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4">
                    <button className="btn btn-primary" type = "submit"  onClick={()=>{setFinalPrice((price+price2+price3))}}>Upload</button>
                    <br></br>
                            <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}><strong>Case Total = ${(price+price2+price3)} *Not including Rush Production and/or Shipping</strong></small>
                </div>
            </div>
            
        
        </form>

            :
            (type==="denture")?

            <div className="col-8 create-order-type" style={{margin:"auto", paddingLeft:"100px"}}>
                <div className="row "> 
                {/* <!-- service-block-two --> */}
                <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp" data-wow-delay="400ms">
                    <div className="inner-box" onClick={()=>setType("newDenture")}>
                        <div className="image-box" >
                        <figure className="image overlay-animr">
                            
                                <img src={Denture} alt="" className="product-pic" />
                            
                        </figure>
                        {/* <i className="flaticon-clock-1"></i> */}
                        </div>
                        <div className="content-box">
                        <h4 className="title"><a >New Denture</a></h4>                 
                        </div>
                    </div>
                </div>
                {/* <!-- service-block-two --> */}
                <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp" data-wow-delay="600ms">
                <div className="inner-box" onClick={()=>setType("dentureRepair")}>
                    <div className="image-box">
                    <figure className="image overlay-anim"><img src={Denture} alt="" className="product-pic" /></figure>
                    {/* <i className="flaticon-monitor-1"></i> */}
                    </div>
                    <div className="content-box">
                    <h4 className="title"><a >Denture Repair</a></h4>
                    </div>
                </div>
                </div>
                {/* <!-- service-block-two --> */}
                <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp" data-wow-delay="800ms">
                <div className="inner-box" onClick={()=>setType("copyDenture")}>
                    <div className="image-box">
                    <figure className="image overlay-anim"><img src={Denture} alt="" className="product-pic" /></figure>
                    {/* <i className="flaticon-cog-1"></i> */}
                    </div>
                    <div className="content-box">
                    <h4 className="title"><a >Copy Denture</a></h4>
                    </div>
                </div>
                </div>
               
            </div>
            </div>
            
            :
            (type==="newDenture")?
            <form className="form form-container" data-toggle="validator" role="form" onSubmit={(e)=>{e.preventDefault(); uploadCase()}}>
            <div className="row form-group justify-content-center">
                <div className="text-center col-4">
                    <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
                </div>
            </div>
            <div className="row form-group justify-content-center">
                <div className="text-center col-4 pt-3">
                <label  htmlFor="patientName"><h5>Patient Name</h5></label>
                <input className="form-control" required id="patientName" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
                </div>
            </div>
            <div className="d-flex row pt-4 justify-content-center" >
                <div className="col-4 form-group text-center pb-4 ">
                    <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
                    <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} readOnly={true} value={crownTooth} onChange={(e)=>setToothInput(e.target.value)}></input>
                </div>
                <div className="col-9 col-lg-3 px-5" >
                <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                            <path style ={{fill: "white", stroke: "black", strokeWidth:"2px"}} d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                            onClick={(e)=> toothHandler(e)} ></path>
                            <path   d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                            <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                            <path  d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                            <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                            <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                            <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                            <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                            <path  d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
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
           
            <div className="row form-group justify-content-center mt-3">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label htmlFor="Notes" className="form-label"><h5>Prescription Information</h5></label>
                <textarea className="form-control" style={{backgroundColor:"white", border:"black 1px solid"}} id="Notes" rows="3" value={note} placeholder={"Please include all pertinent case information as well as if any teeth are part of a bridge. Please note any virtual extractions"} onChange={(e)=>setNote(e.target.value)}></textarea>
        
                </div>
            </div>

            <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>3D Printed Model</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="No"
                            checked={model3D === 'No'}
                            onChange={(e)=>{setModel3D(e.target.value); setPrice3(0)}}
                        />
                        No
                        </label>
                        
                        <small  className="form-text text-muted"  style={{color:"white"}}></small>
                        
                        <label style={{color:"black", paddingLeft: "10px"}}>
                        <input style={{paddingLeft: "10px"}}
                            type="radio"
                            value="Yes"
                            checked={model3D === 'Yes'}
                            onChange={(e)=>{setModel3D(e.target.value)}}
                            
                        />
                         Yes 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>3D Printed Models $10/Arch</small>
                        </div>
                    </div>

            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="shade"><h5>Shade</h5></label>
                    <select className="form-select" id="shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Shade" onChange={(e)=>{setShade(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="A1" onClick={()=>setShade("A1")}>A1</option>
                        <option value="A2" onClick={()=>setShade("A2")}>A2</option>
                        <option value="A3" onClick={()=>setShade("A3")}>A3</option>
                        <option value="A3.5" onClick={()=>setShade("A3.5")}>A3.5</option>
                        <option value="A4" onClick={()=>setShade("A4")}>A4</option>
                        <option value="B1" onClick={()=>setShade("B1")}>B1</option>
                        <option value="B2" onClick={()=>setShade("B2")}>B2</option>
                        <option value="B3" onClick={()=>setShade("B3")}>B3</option>
                        <option value="B4" onClick={()=>setShade("B4")}>B4</option>
                        <option value="C1" onClick={()=>setShade("C1")}>C1</option>
                        <option value="C2" onClick={()=>setShade("C2")}>C2</option>
                        <option value="C3" onClick={()=>setShade("C3")}>C3</option>
                        <option value="C4" onClick={()=>setShade("C4")}>C4</option>
                        <option value="D2" onClick={()=>setShade("D2")}>D2</option>
                        <option value="D3" onClick={()=>setShade("D3")}>D3</option>
                        <option value="D4" onClick={()=>setShade("D4")}>D4</option>
                        <option value="Bleach" onClick={()=>setShade("Bleach")}>Bleach</option>
                    </select>
                </div>
            </div>
            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="gum-shade"><h5>Gum Shade</h5></label>
                    <select className="form-select" id="gum-shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Gum-Shade" onChange={(e)=>{setGumShade(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="Pink" onClick={()=>setGumShade("Pink")}>Pink</option>
                        <option value="Meharry" onClick={()=>setGumShade("Meharry")}>Meharry</option>
                        {/* <option value="Pink Fiber" onClick={()=>setGumShade("Pink Fiber")}>Pink Fiber</option> */}
                    </select>
                </div>
            </div>
            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="product"><h5>Product</h5></label>
                    <select className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Product" onChange={(e)=>{setProduct(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        {/* <option value="Custom Tray" onClick={()=>setProduct("Custom Tray")}>Custom Tray</option>
                        <option value="Wax Rim" onClick={()=>setProduct("Wax Rim")}>Wax Rim</option> */}
                        <option value="Try In" onClick={()=>setProduct("Try In")}>Try In</option>
                        {/* <option value="Standard Final Denture" onClick={()=>setProduct("Standard Final Denture")}>Standard Final Denture</option> */}
                        <option value="KPD Premier Denture" onClick={()=>setProduct("KPD Premier Denture")}>KPD Premier Denture</option>
                    </select>
                    <small id="productPrice" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(product === "Custom Tray" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                
                                    `$${(price += 35)}`
                                

                                : (product === "Custom Tray" && lowerArch && upperArch)?    
                                    `$${(price += 70)}`

                                :(product==="Wax Rim" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                `$${(price += 50)}`

                                : (product === "Wax Rim" && lowerArch && upperArch)?    
                                    `$${(price += 100)}`
                                
                                :(product==="Try In" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                `$${(price += 50)}`

                                : (product === "Try In" && lowerArch && upperArch)?    
                                    `$${(price += 100)}`

                                :(product==="Standard Final Denture" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                `$${(price += 250)}`

                                : (product === "Standard Final Denture" && lowerArch && upperArch)?    
                                    `$${(price += 500)}`

                                :(product==="KPD Premier Denture" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                    `$${(price += 350)}`
    
                                : (product === "KPD Premier Denture" && lowerArch && upperArch)?    
                                        `$${(price += 700)}`
                                
                                :""
                                }
                                
                                </strong></small>
                </div>
            </div>
            {/* {(product === "Final Denture")?
            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="finish"><h5>Finish</h5></label>
                    <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="Standard" onClick={()=>setFinish("Standard")}>Standard</option>
                        <option value="Premium" onClick={()=>setFinish("Premium")}>Premium</option>
                    </select>
                    <small id="productPrice2" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(finish === "Standard")?
                                `$${(price2 += 0)}`
                                
                                :(finish==="Premium" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                `$${(price2 += 100)}`

                                :(finish==="Premium" && lowerArch && upperArch)?
                                `$${(price2 += 200)}`
                                
                                : ""
                                }
                                   </strong> </small>
                </div>
            </div>
            :""} */}
            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label  htmlFor="picUpload"><h5>Upload Photos</h5></label>
                <br></br>
                {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                <input 
                    className="form-control" 
                    
                    id="picUpload" 
                    type="file" 
                    multiple 
                    style={{ display: 'none' }} // Hide the file input
                    onChange={(e) => {
                        const pics = e.target.files; // Get all selected files
                        const newPics = [...photos]; // Copy the current files in state
                        const newPicName = [...photoName];

                        // Loop through each selected file and add it to the new arrays
                        for (let i = 0; i < pics.length; i++) {
                            newPics.push(pics[i]);
                            newPicName.push(pics[i].name);
                        }

                        // Update state with the new arrays of files and file names
                        setPhotos(newPics);
                        setPhotoName(newPicName);
                    }}
                />
                <button 
                    className="btn btn-primary"
                    onClick={(e) => {e.preventDefault(); document.getElementById('picUpload').click()}} // Trigger file input click
                >
                    Select Files
                </button>
                
                <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                    {photoName.join(', ')} {/* Display selected file names */}
                </div>
                </div>
                {/* <div className="text-center col-8 col-lg-4 pt-3">
                
                </div> */}
            </div>
            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
                <br></br>
                {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                <input 
                    className="form-control" 
                    
                    id="scanUpload" 
                    type="file" 
                    multiple 
                    style={{ display: 'none' }} // Hide the file input
                    onChange={(e) => {
                        const files = e.target.files; // Get all selected files
                        const newFiles = [...stlFile]; // Copy the current files in state
                        const newFileName = [...fileName];

                        // Loop through each selected file and add it to the new arrays
                        for (let i = 0; i < files.length; i++) {
                            newFiles.push(files[i]);
                            newFileName.push(files[i].name);
                        }

                        // Update state with the new arrays of files and file names
                        setStlFile(newFiles);
                        setFileName(newFileName);
                    }}
                />
                <button 
                    className="btn btn-primary"
                    onClick={(e) =>{ e.preventDefault(); document.getElementById('scanUpload').click()}} // Trigger file input click
                >
                    Select Files
                </button>
                
                <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                    {fileName.join(', ')} {/* Display selected file names */}
                </div>
                </div>
                {/* <div className="text-center col-8 col-lg-4 pt-3">
                
                </div> */}
            </div>
            

            <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping To KPD (Physical Impressions)</h5></label>
                        <br></br>
                        <button className="btn btn-primary" onClick={(e)=> {e.preventDefault(); getLabelToKpd(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print USPS Label</button>
          
          <button className="btn btn-primary" style={{marginLeft: "5px"}}  onClick={(e)=> {e.preventDefault(); UPSLabel(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print UPS Label</button>
                      
                       
                        </div>
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping from KPD</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={shipping === 'Standard'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                         Standard 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Shipping $10/Shipment *Multiple Cases Can be in One Shipment</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Express"
                            checked={shipping === 'Express'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                         Express 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Express Shipping $35 Fee</small>
                        </div>
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Production</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={production === 'Standard'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                         Standard Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Production 4-6 Business Days</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Rush"
                            checked={production === 'Rush'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                         Rush Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Rush Production $50 Fee, 3 Business Days</small>
                        </div>
                    </div>
            
        
            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4">
                    <button className="btn btn-primary" type = "submit" onClick={()=>{setFinalPrice(price+price2+price3)}} >Upload</button>
                    <br></br>
                    <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}><strong>Case Total = ${(price+price2+price3)} *Not including Rush Production and/or Shipping</strong></small>
                </div>
            </div>
            
        
        </form>
:
(type==="copyDenture")?
<form className="form form-container" data-toggle="validator" role="form" onSubmit={(e)=>{e.preventDefault(); uploadCase()}}>
<div className="row form-group justify-content-center">
    <div className="text-center col-4">
        <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
    </div>
</div>
<div className="row form-group justify-content-center">
    <div className="text-center col-4 pt-3">
    <label  htmlFor="patientName"><h5>Patient Name</h5></label>
    <input className="form-control" required id="patientName" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
    </div>
</div>
<div className="d-flex row pt-4 justify-content-center" >
    <div className="col-4 form-group text-center pb-4 ">
        <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
        <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} readOnly={true} value={crownTooth} onChange={(e)=>setToothInput(e.target.value)}></input>
    </div>
    <div className="col-9 col-lg-3 px-5" >
    <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                <path style ={{fill: "white", stroke: "black", strokeWidth:"2px"}} d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                onClick={(e)=> toothHandler(e)} ></path>
                <path   d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                <path  d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                <path  d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
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

<div className="row form-group justify-content-center mt-3">
    <div className="text-center col-8 col-lg-4 pt-3">
    <label htmlFor="Notes" className="form-label"><h5>Prescription Information</h5></label>
    <textarea className="form-control" style={{backgroundColor:"white", border:"black 1px solid"}} id="Notes" rows="3" value={note} placeholder={"Please include all pertinent case information as well as if any teeth are part of a bridge. Please note any virtual extractions"} onChange={(e)=>setNote(e.target.value)}></textarea>

    </div>
</div>

<div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>3D Printed Model</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="No"
                            checked={model3D === 'No'}
                            onChange={(e)=>{setModel3D(e.target.value); setPrice3(0)}}
                        />
                        No
                        </label>
                        
                        <small  className="form-text text-muted"  style={{color:"white"}}></small>
                        
                        <label style={{color:"black", paddingLeft: "10px"}}>
                        <input style={{paddingLeft: "10px"}}
                            type="radio"
                            value="Yes"
                            checked={model3D === 'Yes'}
                            onChange={(e)=>{setModel3D(e.target.value)}}
                            
                        />
                         Yes 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>3D Printed Models $10/Arch</small>
                        </div>
                    </div>


<div className="row form-group text-center justify-content-center mt-5">
    <div className= "col-8 col-lg-4">
        <label  htmlFor="shade"><h5>Shade</h5></label>
        <select className="form-select" id="shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Shade" onChange={(e)=>{setShade(e.target.value)}}>
            <option value="Select One">Select One</option>
            <option value="A1" onClick={()=>setShade("A1")}>A1</option>
            <option value="A2" onClick={()=>setShade("A2")}>A2</option>
            <option value="A3" onClick={()=>setShade("A3")}>A3</option>
            <option value="A3.5" onClick={()=>setShade("A3.5")}>A3.5</option>
            <option value="A4" onClick={()=>setShade("A4")}>A4</option>
            <option value="B1" onClick={()=>setShade("B1")}>B1</option>
            <option value="B2" onClick={()=>setShade("B2")}>B2</option>
            <option value="B3" onClick={()=>setShade("B3")}>B3</option>
            <option value="B4" onClick={()=>setShade("B4")}>B4</option>
            <option value="C1" onClick={()=>setShade("C1")}>C1</option>
            <option value="C2" onClick={()=>setShade("C2")}>C2</option>
            <option value="C3" onClick={()=>setShade("C3")}>C3</option>
            <option value="C4" onClick={()=>setShade("C4")}>C4</option>
            <option value="D2" onClick={()=>setShade("D2")}>D2</option>
            <option value="D3" onClick={()=>setShade("D3")}>D3</option>
            <option value="D4" onClick={()=>setShade("D4")}>D4</option>
            <option value="Bleach" onClick={()=>setShade("Bleach")}>Bleach</option>
        </select>
    </div>
</div>
<div className="row form-group text-center justify-content-center mt-5">
    <div className= "col-8 col-lg-4">
        <label  htmlFor="gum-shade"><h5>Gum Shade</h5></label>
        <select className="form-select" id="gum-shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Gum-Shade" onChange={(e)=>{setGumShade(e.target.value)}}>
            <option value="Select One">Select One</option>
            <option value="Pink" onClick={()=>setGumShade("Pink")}>Pink</option>
            <option value="Meharry" onClick={()=>setGumShade("Meharry")}>Meharry</option>
            {/* <option value="Pink Fiber" onClick={()=>setGumShade("Pink Fiber")}>Pink Fiber</option> */}
        </select>
    </div>
</div>
<div className="row form-group text-center justify-content-center mt-5">
    <div className= "col-8 col-lg-4">
        <label  htmlFor="product"><h5>Product</h5></label>
        <select className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Product" onChange={(e)=>{setProduct(e.target.value)}}>
            <option value="Select One">Select One</option>
            {/* <option value="Standard Copy Denture" onClick={()=>setProduct("Standard Copy Denture")}>Standard Copy Denture</option> */}
            <option value="KPD Premier Copy Denture" onClick={()=>setProduct("KPD Premier Copy Denture")}>KPD Premier Copy Denture</option>

        </select>
        <small id="productPrice" className="form-text text-muted"  style={{color:"white"}}><strong>
                    {(product === "Custom Tray" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                    
                        `$${(price += 35)}`
                    

                    : (product === "Custom Tray" && lowerArch && upperArch)?    
                        `$${(price += 70)}`

                    :(product==="Wax Rim" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                    `$${(price += 50)}`

                    : (product === "Wax Rim" && lowerArch && upperArch)?    
                        `$${(price += 100)}`
                    
                    :(product==="Try In" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                    `$${(price += 50)}`

                    : (product === "Try In" && lowerArch && upperArch)?    
                        `$${(price += 100)}`

                    :(product==="Standard Copy Denture" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                    `$${(price += 200)}`

                    : (product === "Standard Copy Denture" && lowerArch && upperArch)?    
                        `$${(price += 400)}`

                    :(product==="KPD Premier Copy Denture" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                        `$${(price += 300)}`

                    : (product === "KPD Premier Copy Denture" && lowerArch && upperArch)?    
                            `$${(price += 600)}`
                    
                    :""
                    }
                    
                    </strong></small>
    </div>
</div>

{/* <div className="row form-group text-center justify-content-center mt-5">
    <div className= "col-8 col-lg-4">
        <label  htmlFor="finish"><h5>Finish</h5></label>
        <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
            <option value="Select One">Select One</option>
            <option value="Standard" onClick={()=>setFinish("Standard")}>Standard</option>
            <option value="Premium" onClick={()=>setFinish("Premium")}>Premium</option>
        </select>
        <small id="productPrice2" className="form-text text-muted"  style={{color:"white"}}><strong>
                    {(finish === "Standard")?
                    `$${(price2 += 0)}`
                    
                    :(finish==="Premium" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                    `$${(price2 += 100)}`

                    :(finish==="Premium" && lowerArch && upperArch)?
                    `$${(price2 += 200)}`
                    
                    : ""
                    }
                       </strong> </small>
    </div>
</div> */}

<div className="row form-group justify-content-center mt-5">
    <div className="text-center col-8 col-lg-4 pt-3">
    <label  htmlFor="picUpload"><h5>Upload Photos</h5></label>
    <br></br>
    {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
    <input 
        className="form-control" 
        
        id="picUpload" 
        type="file" 
        multiple 
        style={{ display: 'none' }} // Hide the file input
        onChange={(e) => {
            const pics = e.target.files; // Get all selected files
            const newPics = [...photos]; // Copy the current files in state
            const newPicName = [...photoName];

            // Loop through each selected file and add it to the new arrays
            for (let i = 0; i < pics.length; i++) {
                newPics.push(pics[i]);
                newPicName.push(pics[i].name);
            }

            // Update state with the new arrays of files and file names
            setPhotos(newPics);
            setPhotoName(newPicName);
        }}
    />
    <button 
        className="btn btn-primary"
        onClick={(e) => {e.preventDefault(); document.getElementById('picUpload').click()}} // Trigger file input click
    >
        Select Files
    </button>
    
    <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
        {photoName.join(', ')} {/* Display selected file names */}
    </div>
    </div>
    {/* <div className="text-center col-8 col-lg-4 pt-3">
    
    </div> */}
</div>
<div className="row form-group justify-content-center mt-5">
    <div className="text-center col-8 col-lg-4 pt-3">
    <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
    <br></br>
    {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
    <input 
        className="form-control" 
        
        id="scanUpload" 
        type="file" 
        multiple 
        style={{ display: 'none' }} // Hide the file input
        onChange={(e) => {
            const files = e.target.files; // Get all selected files
            const newFiles = [...stlFile]; // Copy the current files in state
            const newFileName = [...fileName];

            // Loop through each selected file and add it to the new arrays
            for (let i = 0; i < files.length; i++) {
                newFiles.push(files[i]);
                newFileName.push(files[i].name);
            }

            // Update state with the new arrays of files and file names
            setStlFile(newFiles);
            setFileName(newFileName);
        }}
    />
    <button 
        className="btn btn-primary"
        onClick={(e) =>{ e.preventDefault(); document.getElementById('scanUpload').click()}} // Trigger file input click
    >
        Select Files
    </button>
    
    <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
        {fileName.join(', ')} {/* Display selected file names */}
    </div>
    </div>
    {/* <div className="text-center col-8 col-lg-4 pt-3">
    
    </div> */}
</div>


<div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping To KPD (Physical Impressions)</h5></label>
                        <br></br>
                        <button className="btn btn-primary" onClick={(e)=> {e.preventDefault(); getLabelToKpd(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print USPS Label</button>
          
          <button className="btn btn-primary" style={{marginLeft: "5px"}}  onClick={(e)=> {e.preventDefault(); UPSLabel(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print UPS Label</button>
                      
                       
                        </div>
                    </div>

        <div  className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4">
            <label ><h5>Shipping from KPD</h5></label>
            <br></br>
            <label style={{color:"black"}}>
            <input
                type="radio"
                value="Standard"
                checked={shipping === 'Standard'}
                onChange={(e)=>{setShipping(e.target.value)}}
            />
             Standard 
            </label>
            <br></br>
            <small  className="form-text text-muted"  style={{color:"white"}}>Standard Shipping $10/Shipment *Multiple Cases Can be in One Shipment</small>
            <br></br>
            <label style={{color:"black"}}>
            <input
                type="radio"
                value="Express"
                checked={shipping === 'Express'}
                onChange={(e)=>{setShipping(e.target.value)}}
            />
             Express 
            </label>
            <br></br>
            <small  className="form-text text-muted"  style={{color:"white"}}>Express Shipping $35 Fee</small>
            </div>
        </div>

        <div  className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4">
            <label ><h5>Production</h5></label>
            <br></br>
            <label style={{color:"black"}}>
            <input
                type="radio"
                value="Standard"
                checked={production === 'Standard'}
                onChange={(e)=>{setProduction(e.target.value)}}
            />
             Standard Production 
            </label>
            <br></br>
            <small  className="form-text text-muted"  style={{color:"white"}}>Standard Production 4-6 Business Days</small>
            <br></br>
            <label style={{color:"black"}}>
            <input
                type="radio"
                value="Rush"
                checked={production === 'Rush'}
                onChange={(e)=>{setProduction(e.target.value)}}
            />
             Rush Production 
            </label>
            <br></br>
            <small  className="form-text text-muted"  style={{color:"white"}}>Rush Production $50 Fee, 3 Business Days</small>
            </div>
        </div>


<div className="row form-group justify-content-center mt-5">
    <div className="text-center col-8 col-lg-4">
        <button className="btn btn-primary" type = "submit" onClick={()=>{setFinalPrice(price+price2+price3)}} >Upload</button>
        <br></br>
        <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}><strong>Case Total = ${(price+price2+price3)} *Not including Rush Production and/or Shipping</strong></small>
    </div>
</div>


</form>


:
(type ==="dentureRepair")?
<form className="form form-container" data-toggle="validator" role="form" onSubmit={(e)=>{e.preventDefault(); uploadCase()}}>
<div className="row form-group justify-content-center">
    <div className="text-center col-4">
        <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
    </div>
</div>
<div className="row form-group justify-content-center">
    <div className="text-center col-4 pt-3">
    <label  htmlFor="patientName"><h5>Patient Name</h5></label>
    <input className="form-control" required id="patientName" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
    </div>
</div>
<div className="d-flex row pt-4 justify-content-center" >
    <div className="col-4 form-group text-center pb-4 ">
        <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
        <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} readOnly={true} value={crownTooth} onChange={(e)=>setToothInput(e.target.value)}></input>
    </div>
    <div className="col-9 col-lg-3 px-5" >
    <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                <path style ={{fill: "white", stroke: "black", strokeWidth:"2px"}} d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                onClick={(e)=> toothHandler(e)} ></path>
                <path   d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                <path  d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                <path  d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
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

<div className="row form-group justify-content-center mt-3">
    <div className="text-center col-8 col-lg-4 pt-3">
    <label htmlFor="Notes" className="form-label"><h5>Prescription Information</h5></label>
    <textarea className="form-control" style={{backgroundColor:"white", border:"black 1px solid"}} id="Notes" rows="3" value={note} placeholder={"Please include all pertinent case information as well as if any teeth are part of a bridge. Please note any virtual extractions"} onChange={(e)=>setNote(e.target.value)}></textarea>

    </div>
</div>

<div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>3D Printed Model</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="No"
                            checked={model3D === 'No'}
                            onChange={(e)=>{setModel3D(e.target.value); setPrice3(0)}}
                        />
                        No
                        </label>
                        
                        <small  className="form-text text-muted"  style={{color:"white"}}></small>
                        
                        <label style={{color:"black", paddingLeft: "10px"}}>
                        <input style={{paddingLeft: "10px"}}
                            type="radio"
                            value="Yes"
                            checked={model3D === 'Yes'}
                            onChange={(e)=>{setModel3D(e.target.value)}}
                            
                        />
                         Yes 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>3D Printed Models $10/Arch</small>
                        </div>
                    </div>


<div className="row form-group text-center justify-content-center mt-5">
    <div className= "col-8 col-lg-4">
        <label  htmlFor="shade"><h5>Shade</h5></label>
        <select className="form-select" id="shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Shade" onChange={(e)=>{setShade(e.target.value)}}>
            <option value="Select One">Select One</option>
            <option value="A1" onClick={()=>setShade("A1")}>A1</option>
            <option value="A2" onClick={()=>setShade("A2")}>A2</option>
            <option value="A3" onClick={()=>setShade("A3")}>A3</option>
            <option value="A3.5" onClick={()=>setShade("A3.5")}>A3.5</option>
            <option value="A4" onClick={()=>setShade("A4")}>A4</option>
            <option value="B1" onClick={()=>setShade("B1")}>B1</option>
            <option value="B2" onClick={()=>setShade("B2")}>B2</option>
            <option value="B3" onClick={()=>setShade("B3")}>B3</option>
            <option value="B4" onClick={()=>setShade("B4")}>B4</option>
            <option value="C1" onClick={()=>setShade("C1")}>C1</option>
            <option value="C2" onClick={()=>setShade("C2")}>C2</option>
            <option value="C3" onClick={()=>setShade("C3")}>C3</option>
            <option value="C4" onClick={()=>setShade("C4")}>C4</option>
            <option value="D2" onClick={()=>setShade("D2")}>D2</option>
            <option value="D3" onClick={()=>setShade("D3")}>D3</option>
            <option value="D4" onClick={()=>setShade("D4")}>D4</option>
            <option value="Bleach" onClick={()=>setShade("Bleach")}>Bleach</option>
        </select>
    </div>
</div>
<div className="row form-group text-center justify-content-center mt-5">
    <div className= "col-8 col-lg-4">
        <label  htmlFor="gum-shade"><h5>Gum Shade</h5></label>
        <select className="form-select" id="gum-shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Gum-Shade" onChange={(e)=>{setGumShade(e.target.value)}}>
            <option value="Select One">Select One</option>
            <option value="Pink" onClick={()=>setGumShade("Pink")}>Pink</option>
            <option value="Meharry" onClick={()=>setGumShade("Meharry")}>Meharry</option>
            {/* <option value="Pink Fiber" onClick={()=>setGumShade("Pink Fiber")}>Pink Fiber</option> */}
        </select>
    </div>
</div>
<div className="row form-group text-center justify-content-center mt-5">
    <div className= "col-8 col-lg-4">
        <label  htmlFor="product"><h5>Product</h5></label>
        <select className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Product" onChange={(e)=>{setProduct(e.target.value)}}>
            <option value="Select One">Select One</option>
            <option value="Tooth Replacement" onClick={()=>setProduct("Tooth Replacement")}>Tooth Replacement</option>
            <option value="Broken Denture" onClick={()=>setProduct("Broken Denture")}>Broken Denture</option>

        </select>
        <small id="productPrice" className="form-text text-muted"  style={{color:"white"}}><strong>
                    {(product === "Tooth Replacement" )?
                    
                        `$${(price += 50)*crownTooth.length}`
                    
                    :(product==="Broken Denture" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                    `$${(price += 100)}`

                    : (product === "Broken Denture" && lowerArch && upperArch)?    
                        `$${(price += 200)}`
                    
                    :""
                    }
                    
                    </strong></small>
    </div>
</div>

{/* <div className="row form-group text-center justify-content-center mt-5">
    <div className= "col-8 col-lg-4">
        <label  htmlFor="finish"><h5>Finish</h5></label>
        <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
            <option value="Select One">Select One</option>
            <option value="Standard" onClick={()=>setFinish("Standard")}>Standard</option>
            <option value="Premium" onClick={()=>setFinish("Premium")}>Premium</option>
        </select>
        <small id="productPrice2" className="form-text text-muted"  style={{color:"white"}}><strong>
                    {(finish === "Standard")?
                    `$${(price2 += 0)}`
                    
                    :(finish==="Premium" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                    `$${(price2 += 100)}`

                    :(finish==="Premium" && lowerArch && upperArch)?
                    `$${(price2 += 200)}`
                    
                    : ""
                    }
                       </strong> </small>
    </div>
</div> */}

<div className="row form-group justify-content-center mt-5">
    <div className="text-center col-8 col-lg-4 pt-3">
    <label  htmlFor="picUpload"><h5>Upload Photos</h5></label>
    <br></br>
    {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
    <input 
        className="form-control" 
        
        id="picUpload" 
        type="file" 
        multiple 
        style={{ display: 'none' }} // Hide the file input
        onChange={(e) => {
            const pics = e.target.files; // Get all selected files
            const newPics = [...photos]; // Copy the current files in state
            const newPicName = [...photoName];

            // Loop through each selected file and add it to the new arrays
            for (let i = 0; i < pics.length; i++) {
                newPics.push(pics[i]);
                newPicName.push(pics[i].name);
            }

            // Update state with the new arrays of files and file names
            setPhotos(newPics);
            setPhotoName(newPicName);
        }}
    />
    <button 
        className="btn btn-primary"
        onClick={(e) => {e.preventDefault(); document.getElementById('picUpload').click()}} // Trigger file input click
    >
        Select Files
    </button>
    
    <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
        {photoName.join(', ')} {/* Display selected file names */}
    </div>
    </div>
    {/* <div className="text-center col-8 col-lg-4 pt-3">
    
    </div> */}
</div>
<div className="row form-group justify-content-center mt-5">
    <div className="text-center col-8 col-lg-4 pt-3">
    <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
    <br></br>
    {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
    <input 
        className="form-control" 
        
        id="scanUpload" 
        type="file" 
        multiple 
        style={{ display: 'none' }} // Hide the file input
        onChange={(e) => {
            const files = e.target.files; // Get all selected files
            const newFiles = [...stlFile]; // Copy the current files in state
            const newFileName = [...fileName];

            // Loop through each selected file and add it to the new arrays
            for (let i = 0; i < files.length; i++) {
                newFiles.push(files[i]);
                newFileName.push(files[i].name);
            }

            // Update state with the new arrays of files and file names
            setStlFile(newFiles);
            setFileName(newFileName);
        }}
    />
    <button 
        className="btn btn-primary"
        onClick={(e) =>{ e.preventDefault(); document.getElementById('scanUpload').click()}} // Trigger file input click
    >
        Select Files
    </button>
    
    <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
        {fileName.join(', ')} {/* Display selected file names */}
    </div>
    </div>
    {/* <div className="text-center col-8 col-lg-4 pt-3">
    
    </div> */}
</div>


<div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping To KPD (Physical Impressions)</h5></label>
                        <br></br>
                        <button className="btn btn-primary" onClick={(e)=> {e.preventDefault(); getLabelToKpd(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print USPS Label</button>
          
          <button className="btn btn-primary" style={{marginLeft: "5px"}}  onClick={(e)=> {e.preventDefault(); UPSLabel(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print UPS Label</button>
                      
                       
                        </div>
                    </div>

        <div  className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4">
            <label ><h5>Shipping from KPD</h5></label>
            <br></br>
            <label style={{color:"black"}}>
            <input
                type="radio"
                value="Standard"
                checked={shipping === 'Standard'}
                onChange={(e)=>{setShipping(e.target.value)}}
            />
             Standard 
            </label>
            <br></br>
            <small  className="form-text text-muted"  style={{color:"white"}}>Standard Shipping $10/Shipment *Multiple Cases Can be in One Shipment</small>
            <br></br>
            <label style={{color:"black"}}>
            <input
                type="radio"
                value="Express"
                checked={shipping === 'Express'}
                onChange={(e)=>{setShipping(e.target.value)}}
            />
             Express 
            </label>
            <br></br>
            <small  className="form-text text-muted"  style={{color:"white"}}>Express Shipping $35 Fee</small>
            </div>
        </div>

        <div  className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4">
            <label ><h5>Production</h5></label>
            <br></br>
            <label style={{color:"black"}}>
            <input
                type="radio"
                value="Standard"
                checked={production === 'Standard'}
                onChange={(e)=>{setProduction(e.target.value)}}
            />
             Standard Production 
            </label>
            <br></br>
            <small  className="form-text text-muted"  style={{color:"white"}}>Standard Production 4-6 Business Days</small>
            <br></br>
            <label style={{color:"black"}}>
            <input
                type="radio"
                value="Rush"
                checked={production === 'Rush'}
                onChange={(e)=>{setProduction(e.target.value)}}
            />
             Rush Production 
            </label>
            <br></br>
            <small  className="form-text text-muted"  style={{color:"white"}}>Rush Production $50 Fee, 3 Business Days</small>
            </div>
        </div>


<div className="row form-group justify-content-center mt-5">
    <div className="text-center col-8 col-lg-4">
        <button className="btn btn-primary" type = "submit" onClick={()=>{setFinalPrice(price+price2+price3)}} >Upload</button>
        <br></br>
        <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}><strong>Case Total = ${(price+price2+price3)} *Not including Rush Production and/or Shipping</strong></small>
    </div>
</div>


</form>

:
            (type==="implant")?

            <div className="col-8 create-order-type" style={{margin:"auto", paddingLeft:"100px"}}>
                <div className="row "> 
                {/* <!-- service-block-two --> */}
                <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp" data-wow-delay="400ms">
                    <div className="inner-box" onClick={()=>setType("implantHybridDenture")}>
                        <div className="image-box" >
                        <figure className="image overlay-animr">
                            
                                <img src={Implant} alt="" className="product-pic" />
                            
                        </figure>
                        {/* <i className="flaticon-clock-1"></i> */}
                        </div>
                        <div className="content-box">
                        <h4 className="title"><a >Implant Hybrid Denture</a></h4>                 
                        </div>
                    </div>
                </div>
                
                {/* <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp" data-wow-delay="600ms">
                <div className="inner-box" onClick={()=>setType("dentureRepair")}>
                    <div className="image-box">
                    <figure className="image overlay-anim"><img src={Denture} alt="" className="product-pic" /></figure>
                    
                    </div>
                    <div className="content-box">
                    <h4 className="title"><a >Denture Repair</a></h4>
                    </div>
                </div>
                </div>
                
                <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp" data-wow-delay="800ms">
                <div className="inner-box" onClick={()=>setType("copyDenture")}>
                    <div className="image-box">
                    <figure className="image overlay-anim"><img src={Denture} alt="" className="product-pic" /></figure>
                    
                    </div>
                    <div className="content-box">
                    <h4 className="title"><a >Copy Denture</a></h4>
                    </div>
                </div>
                </div> */}
               
            </div>
            </div>

:
            (type==="implantHybridDenture")?
            <form className="form form-container" data-toggle="validator" role="form" onSubmit={(e)=>{e.preventDefault(); uploadCase()}}>
            <div className="row form-group justify-content-center">
                <div className="text-center col-4">
                    <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
                </div>
            </div>
            <div className="row form-group justify-content-center">
                <div className="text-center col-4 pt-3">
                <label  htmlFor="patientName"><h5>Patient Name</h5></label>
                <input className="form-control" required id="patientName" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
                </div>
            </div>
            <div className="d-flex row pt-4 justify-content-center" >
                <div className="col-4 form-group text-center pb-4 ">
                    <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
                    <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} readOnly={true} value={crownTooth} onChange={(e)=>setToothInput(e.target.value)}></input>
                </div>
                <div className="col-9 col-lg-3 px-5" >
                <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                            <path style ={{fill: "white", stroke: "black", strokeWidth:"2px"}} d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                            onClick={(e)=> toothHandler(e)} ></path>
                            <path   d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                            <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                            <path  d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                            <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                            <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                            <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                            <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                            <path  d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
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
           
            <div className="row form-group justify-content-center mt-3">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label htmlFor="Notes" className="form-label"><h5>Implant Manufacturer and Scan Body</h5></label>
                <textarea className="form-control" required style={{backgroundColor:"white", border:"black 1px solid"}} id="Notes" rows="6" value={note} placeholder={"Please include all pertinent case information as well as what implant manufacturer and what scan body."} onChange={(e)=>setNote(e.target.value)}></textarea>
        
                </div>
            </div>

            <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>3D Printed Model</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="No"
                            checked={model3D === 'No'}
                            onChange={(e)=>{setModel3D(e.target.value); setPrice3(0)}}
                        />
                        No
                        </label>
                        
                        <small  className="form-text text-muted"  style={{color:"white"}}></small>
                        
                        <label style={{color:"black", paddingLeft: "10px"}}>
                        <input style={{paddingLeft: "10px"}}
                            type="radio"
                            value="Yes"
                            checked={model3D === 'Yes'}
                            onChange={(e)=>{setModel3D(e.target.value)}}
                            
                        />
                         Yes 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>3D Printed Models $10/Arch</small>
                        </div>
                    </div>


            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="shade"><h5>Shade</h5></label>
                    <select className="form-select" id="shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Shade" onChange={(e)=>{setShade(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="A1" onClick={()=>setShade("A1")}>A1</option>
                        <option value="A2" onClick={()=>setShade("A2")}>A2</option>
                        <option value="A3" onClick={()=>setShade("A3")}>A3</option>
                        <option value="A3.5" onClick={()=>setShade("A3.5")}>A3.5</option>
                        <option value="A4" onClick={()=>setShade("A4")}>A4</option>
                        <option value="B1" onClick={()=>setShade("B1")}>B1</option>
                        <option value="B2" onClick={()=>setShade("B2")}>B2</option>
                        <option value="B3" onClick={()=>setShade("B3")}>B3</option>
                        <option value="B4" onClick={()=>setShade("B4")}>B4</option>
                        <option value="C1" onClick={()=>setShade("C1")}>C1</option>
                        <option value="C2" onClick={()=>setShade("C2")}>C2</option>
                        <option value="C3" onClick={()=>setShade("C3")}>C3</option>
                        <option value="C4" onClick={()=>setShade("C4")}>C4</option>
                        <option value="D2" onClick={()=>setShade("D2")}>D2</option>
                        <option value="D3" onClick={()=>setShade("D3")}>D3</option>
                        <option value="D4" onClick={()=>setShade("D4")}>D4</option>
                        <option value="Bleach" onClick={()=>setShade("Bleach")}>Bleach</option>
                    </select>
                </div>
            </div>
            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="gum-shade"><h5>Gum Shade</h5></label>
                    <select className="form-select" id="gum-shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Gum-Shade" onChange={(e)=>{setGumShade(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="Pink" onClick={()=>setGumShade("Pink")}>Pink</option>
                        <option value="Meharry" onClick={()=>setGumShade("Meharry")}>Meharry</option>
                        {/* <option value="Pink Fiber" onClick={()=>setGumShade("Pink Fiber")}>Pink/Red</option> */}
                    </select>
                </div>
            </div>
            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="product"><h5>Product</h5></label>
                    <select className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Product" onChange={(e)=>{setProduct(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="Temporary PMMA" onClick={()=>setProduct("Temporary PMMA")}>Temporary PMMA</option>
                        <option value="Final Zirconia" onClick={()=>setProduct("Final Zirconia")}>Final Zirconia</option>
                        
                    </select>
                    {/* <small id="productPrice" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(product === "Temporary PMMA" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                
                                    `$${(price += 500)}`
                                

                                : (product === "Temporary PMMA" && lowerArch && upperArch)?    
                                    `$${(price += 1000)}`

                                :(product==="Final Zirconia" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                `$${(price += 1000)}`

                                : (product === "Final Zirconia" && lowerArch && upperArch)?    
                                    `$${(price += 2000)}`
                                
                                
                                :""
                                }
                                
                                </strong></small> */}
                </div>
            </div>
            
            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="finish"><h5>MUA Connection</h5></label>
                    <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="Direct to MUA" onClick={()=>setFinish("Direct to MUA")}>Direct to MUA (Dess 19.018)</option>
                        <option value="Titanium Bases" onClick={()=>setFinish("Titanium Bases")}>Titanium Bases (Up to 5 included)</option>
                        {/* <option value="Dr Provides Copings" onClick={()=>setFinish("Dr Provides Copings")}>Dr Provides Titanium Copings</option> */}
                    </select>
                    {/* <small id="productPrice2" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(finish === "Standard")?
                                `$${(price2 += 0)}`
                                
                                :(finish==="Premium" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                `$${(price2 += 100)}`

                                :(finish==="Premium" && lowerArch && upperArch)?
                                `$${(price2 += 200)}`
                                
                                : ""
                                }
                                   </strong> </small> */}
                    <small id="productPrice" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(product === "Temporary PMMA" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                
                                    `$${(price += 500)}`
                                

                                : (product === "Temporary PMMA" && lowerArch && upperArch)?    
                                    `$${(price += 1000)}`

                                :(product==="Final Zirconia" && finish === "Direct to MUA" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                `$${(price += 1500)}`

                                : (product === "Final Zirconia" && lowerArch && upperArch)?    
                                    `$${(price += 3000)}`

                                :(product==="Final Zirconia" && finish === "Titanium Bases" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                    `$${(price += 2500)}`

                                : (product === "Final Zirconia" && finish === "Titanium Bases" && lowerArch && upperArch)?    
                                    `$${(price += 5000)}`
                                
                                
                                :""
                                }

                                </strong></small>
                                
                                <strong><small>
                                {(crownTooth.length > 5)?
                                
                                ` + $${(crownTooth.length - 5) * 160} for ${crownTooth.length - 5} additional implants`
                                   
                                :""
                            }
                                </small></strong>
                                
                </div>
            </div>
            
            

            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label  htmlFor="picUpload"><h5>Upload Photos</h5></label>
                <br></br>
                {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                <input 
                    className="form-control" 
                    
                    id="picUpload" 
                    type="file" 
                    multiple 
                    style={{ display: 'none' }} // Hide the file input
                    onChange={(e) => {
                        const pics = e.target.files; // Get all selected files
                        const newPics = [...photos]; // Copy the current files in state
                        const newPicName = [...photoName];

                        // Loop through each selected file and add it to the new arrays
                        for (let i = 0; i < pics.length; i++) {
                            newPics.push(pics[i]);
                            newPicName.push(pics[i].name);
                        }

                        // Update state with the new arrays of files and file names
                        setPhotos(newPics);
                        setPhotoName(newPicName);
                    }}
                />
                <button 
                    className="btn btn-primary"
                    onClick={(e) => {e.preventDefault(); document.getElementById('picUpload').click()}} // Trigger file input click
                >
                    Select Files
                </button>
                
                <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                    {photoName.join(', ')} {/* Display selected file names */}
                </div>
                </div>
                {/* <div className="text-center col-8 col-lg-4 pt-3">
                
                </div> */}
            </div>
            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
                <br></br>
                {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                <input 
                    className="form-control" 
                    
                    id="scanUpload" 
                    type="file" 
                    multiple 
                    style={{ display: 'none' }} // Hide the file input
                    onChange={(e) => {
                        const files = e.target.files; // Get all selected files
                        const newFiles = [...stlFile]; // Copy the current files in state
                        const newFileName = [...fileName];

                        // Loop through each selected file and add it to the new arrays
                        for (let i = 0; i < files.length; i++) {
                            newFiles.push(files[i]);
                            newFileName.push(files[i].name);
                        }

                        // Update state with the new arrays of files and file names
                        setStlFile(newFiles);
                        setFileName(newFileName);
                    }}
                />
                <button 
                    className="btn btn-primary"
                    onClick={(e) =>{ e.preventDefault(); document.getElementById('scanUpload').click()}} // Trigger file input click
                >
                    Select Files
                </button>
                
                <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                    {fileName.join(', ')} {/* Display selected file names */}
                </div>
                </div>
                {/* <div className="text-center col-8 col-lg-4 pt-3">
                
                </div> */}
            </div>
            

            <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping To KPD (Physical Impressions)</h5></label>
                        <br></br>
                        <button className="btn btn-primary" onClick={(e)=> {e.preventDefault(); getLabelToKpd(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print USPS Label</button>
          
          <button className="btn btn-primary" style={{marginLeft: "5px"}}  onClick={(e)=> {e.preventDefault(); UPSLabel(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print UPS Label</button>
                      
                       
                        </div>
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping from KPD</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={shipping === 'Standard'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                         Standard 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Shipping $10/Shipment *Multiple Cases Can be in One Shipment</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Express"
                            checked={shipping === 'Express'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                         Express 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Express Shipping $35 Fee</small>
                        </div>
                    </div>

                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Production</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={production === 'Standard'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                         Standard Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Production 4-6 Business Days</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Rush"
                            checked={production === 'Rush'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                         Rush Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Rush Production $50 Fee, 3 Business Days</small>
                        </div>
                    </div>
            
        
            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4">
                    <button className="btn btn-primary" type = "submit" onClick={()=>{setFinalPrice(price+price2+price3)}} >Upload</button>
                    <br></br>
                    <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}><strong>Case Total = ${(price+price2+price3)} *Not including Rush Production and/or Shipping</strong></small>
                </div>
            </div>
            
        
        </form>

        :
        (type==="removableAppliances")?

        <div className="col-8 create-order-type" style={{margin:"auto", paddingLeft:"100px"}}>
            <div className="row "> 
            {/* <!-- service-block-two --> */}
            <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp" data-wow-delay="400ms">
                <div className="inner-box" onClick={()=>setType("Night Guard")}>
                    <div className="image-box" >
                    <figure className="image overlay-animr">
                        
                            <img src={NightGuard} alt="" className="product-pic" />
                        
                    </figure>
                    {/* <i className="flaticon-clock-1"></i> */}
                    </div>
                    <div className="content-box text-center">
                    <h4 className="title"><a >Night Guard</a></h4>                 
                    </div>
                </div>
            </div>
            <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp" data-wow-delay="400ms">
                <div className="inner-box" onClick={()=>setType("Smile in a Snap")}>
                    <div className="image-box" >
                    <figure className="image overlay-animr">
                        
                            <img src={SIAS} alt="" className="product-pic" />
                        
                    </figure>
                    {/* <i className="flaticon-clock-1"></i> */}
                    </div>
                    <div className="content-box text-center">
                    <h4 className="title"><a >Smile in a Snap</a></h4>                 
                    </div>
                </div>
            </div>
            
            {/* <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp" data-wow-delay="600ms">
            <div className="inner-box" onClick={()=>setType("dentureRepair")}>
                <div className="image-box">
                <figure className="image overlay-anim"><img src={Denture} alt="" className="product-pic" /></figure>
                
                </div>
                <div className="content-box">
                <h4 className="title"><a >Denture Repair</a></h4>
                </div>
            </div>
            </div>
            
            <div className="service-block-two col-lg-4 col-sm-6 wow fadeInUp" data-wow-delay="800ms">
            <div className="inner-box" onClick={()=>setType("copyDenture")}>
                <div className="image-box">
                <figure className="image overlay-anim"><img src={Denture} alt="" className="product-pic" /></figure>
                
                </div>
                <div className="content-box">
                <h4 className="title"><a >Copy Denture</a></h4>
                </div>
            </div>
            </div> */}
        
        </div>
        </div>

        :
        (type==="Night Guard")?
        <form className="form form-container" data-toggle="validator" role="form" onSubmit={(e)=>{e.preventDefault(); uploadCase()}}>
        <div className="row form-group justify-content-center">
            <div className="text-center col-4">
                <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
            </div>
        </div>
        <div className="row form-group justify-content-center">
            <div className="text-center col-4 pt-3">
            <label  htmlFor="patientName"><h5>Patient Name</h5></label>
            <input className="form-control" required id="patientName" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
            </div>
        </div>
        <div className="d-flex row pt-4 justify-content-center" >
            <div className="col-4 form-group text-center pb-4 ">
                <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
                <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} readOnly={true} value={crownTooth} onChange={(e)=>setToothInput(e.target.value)}></input>
            </div>
            <div className="col-9 col-lg-3 px-5" >
            <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                        <path style ={{fill: "white", stroke: "black", strokeWidth:"2px"}} d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                        onClick={(e)=> toothHandler(e)} ></path>
                        <path   d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                        <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                        <path  d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                        <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                        <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                        <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                        <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                        <path  d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
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

        <div className="row form-group justify-content-center mt-3">
            <div className="text-center col-8 col-lg-4 pt-3">
            <label htmlFor="Notes" className="form-label"><h5>Prescription Information</h5></label>
            <textarea className="form-control" required style={{backgroundColor:"white", border:"black 1px solid"}} id="Notes" rows="6" value={note} placeholder={"Please include all pertinent case information."} onChange={(e)=>setNote(e.target.value)}></textarea>

            </div>
        </div>

        <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>3D Printed Model</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="No"
                            checked={model3D === 'No'}
                            onChange={(e)=>{setModel3D(e.target.value); setPrice3(0)}}
                        />
                        No
                        </label>
                        
                        <small  className="form-text text-muted"  style={{color:"white"}}></small>
                        
                        <label style={{color:"black", paddingLeft: "10px"}}>
                        <input style={{paddingLeft: "10px"}}
                            type="radio"
                            value="Yes"
                            checked={model3D === 'Yes'}
                            onChange={(e)=>{setModel3D(e.target.value)}}
                            
                        />
                         Yes 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>3D Printed Models $10/Arch</small>
                        </div>
                    </div>
        {/* <div className="row form-group text-center justify-content-center mt-5">
            <div className= "col-8 col-lg-4">
                <label  htmlFor="shade"><h5>Shade</h5></label>
                <select className="form-select" id="shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Shade" onChange={(e)=>{setShade(e.target.value)}}>
                    <option value="Select One">Select One</option>
                    <option value="A1" onClick={()=>setShade("A1")}>A1</option>
                    <option value="A2" onClick={()=>setShade("A2")}>A2</option>
                    <option value="A3" onClick={()=>setShade("A3")}>A3</option>
                    <option value="A3.5" onClick={()=>setShade("A3.5")}>A3.5</option>
                    <option value="A4" onClick={()=>setShade("A4")}>A4</option>
                    <option value="B1" onClick={()=>setShade("B1")}>B1</option>
                    <option value="B2" onClick={()=>setShade("B2")}>B2</option>
                    <option value="B3" onClick={()=>setShade("B3")}>B3</option>
                    <option value="B4" onClick={()=>setShade("B4")}>B4</option>
                    <option value="C1" onClick={()=>setShade("C1")}>C1</option>
                    <option value="C2" onClick={()=>setShade("C2")}>C2</option>
                    <option value="C3" onClick={()=>setShade("C3")}>C3</option>
                    <option value="C4" onClick={()=>setShade("C4")}>C4</option>
                    <option value="D2" onClick={()=>setShade("D2")}>D2</option>
                    <option value="D3" onClick={()=>setShade("D3")}>D3</option>
                    <option value="D4" onClick={()=>setShade("D4")}>D4</option>
                    <option value="Bleach" onClick={()=>setShade("Bleach")}>Bleach</option>
                </select>
            </div>
        </div> */}
        {/* <div className="row form-group text-center justify-content-center mt-5">
            <div className= "col-8 col-lg-4">
                <label  htmlFor="gum-shade"><h5>Gum Shade</h5></label>
                <select className="form-select" id="gum-shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Gum-Shade" onChange={(e)=>{setGumShade(e.target.value)}}>
                    <option value="Select One">Select One</option>
                    <option value="Pink" onClick={()=>setGumShade("Pink")}>Pink</option>
                    <option value="Meharry" onClick={()=>setGumShade("Meharry")}>Meharry</option>
                    <option value="Pink Fiber" onClick={()=>setGumShade("Pink Fiber")}>Pink/Red</option>
                </select>
            </div>
        </div> */}
        <div className="row form-group text-center justify-content-center mt-5">
            <div className= "col-8 col-lg-4">
                <label  htmlFor="product"><h5>Product</h5></label>
                <select className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Product" onChange={(e)=>{setProduct(e.target.value)}}>
                    <option value="Select One">Select One</option>
                    <option value="Clear PMMA" onClick={()=>setProduct("Clear PMMA")}>Clear PMMA</option>
                    {/* <option value="Final Zirconia" onClick={()=>setProduct("Final Zirconia")}>Final Zirconia</option> */}
                    
                </select>
                <small id="productPrice" className="form-text text-muted"  style={{color:"white"}}><strong>
                            {(product === "Clear PMMA" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                            
                                `$${(price += 50)}`
                            

                            : (product === "Clear PMMA" && lowerArch && upperArch)?    
                                `$${(price += 100)}`

                                             
                            :""
                            }
                            
                            </strong></small>
            </div>
        </div>

        {/* <div className="row form-group text-center justify-content-center mt-5">
            <div className= "col-8 col-lg-4">
                <label  htmlFor="finish"><h5>MUA Connection</h5></label>
                <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
                    <option value="Select One">Select One</option>
                    <option value="Direct to MUA" onClick={()=>setFinish("Direct to MUA")}>Direct to MUA</option>
                    <option value="Dr Provides Copings" onClick={()=>setFinish("Dr Provides Copings")}>Dr Provides Titanium Copings</option>
                </select> */}
                {/* <small id="productPrice2" className="form-text text-muted"  style={{color:"white"}}><strong>
                            {(finish === "Standard")?
                            `$${(price2 += 0)}`
                            
                            :(finish==="Premium" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                            `$${(price2 += 100)}`

                            :(finish==="Premium" && lowerArch && upperArch)?
                            `$${(price2 += 200)}`
                            
                            : ""
                            }
                            </strong> </small> */}
            {/* </div>
        </div> */}



        <div className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4 pt-3">
            <label  htmlFor="picUpload"><h5>Upload Photos</h5></label>
            <br></br>
            {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
            <input 
                className="form-control" 
                
                id="picUpload" 
                type="file" 
                multiple 
                style={{ display: 'none' }} // Hide the file input
                onChange={(e) => {
                    const pics = e.target.files; // Get all selected files
                    const newPics = [...photos]; // Copy the current files in state
                    const newPicName = [...photoName];

                    // Loop through each selected file and add it to the new arrays
                    for (let i = 0; i < pics.length; i++) {
                        newPics.push(pics[i]);
                        newPicName.push(pics[i].name);
                    }

                    // Update state with the new arrays of files and file names
                    setPhotos(newPics);
                    setPhotoName(newPicName);
                }}
            />
            <button 
                className="btn btn-primary"
                onClick={(e) => {e.preventDefault(); document.getElementById('picUpload').click()}} // Trigger file input click
            >
                Select Files
            </button>
            
            <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                {photoName.join(', ')} {/* Display selected file names */}
            </div>
            </div>
            {/* <div className="text-center col-8 col-lg-4 pt-3">
            
            </div> */}
        </div>
        <div className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4 pt-3">
            <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
            <br></br>
            {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
            <input 
                className="form-control" 
                
                id="scanUpload" 
                type="file" 
                multiple 
                style={{ display: 'none' }} // Hide the file input
                onChange={(e) => {
                    const files = e.target.files; // Get all selected files
                    const newFiles = [...stlFile]; // Copy the current files in state
                    const newFileName = [...fileName];

                    // Loop through each selected file and add it to the new arrays
                    for (let i = 0; i < files.length; i++) {
                        newFiles.push(files[i]);
                        newFileName.push(files[i].name);
                    }

                    // Update state with the new arrays of files and file names
                    setStlFile(newFiles);
                    setFileName(newFileName);
                }}
            />
            <button 
                className="btn btn-primary"
                onClick={(e) =>{ e.preventDefault(); document.getElementById('scanUpload').click()}} // Trigger file input click
            >
                Select Files
            </button>
            
            <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                {fileName.join(', ')} {/* Display selected file names */}
            </div>
            </div>
            {/* <div className="text-center col-8 col-lg-4 pt-3">
            
            </div> */}
        </div>


        <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping To KPD (Physical Impressions)</h5></label>
                        <br></br>
                        <button className="btn btn-primary" onClick={(e)=> {e.preventDefault(); getLabelToKpd(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print USPS Label</button>
          
          <button className="btn btn-primary" style={{marginLeft: "5px"}}  onClick={(e)=> {e.preventDefault(); UPSLabel(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print UPS Label</button>
                      
                       
                        </div>
                    </div>

                <div  className="row form-group justify-content-center mt-5">
                    <div className="text-center col-8 col-lg-4">
                    <label ><h5>Shipping from KPD</h5></label>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Standard"
                        checked={shipping === 'Standard'}
                        onChange={(e)=>{setShipping(e.target.value)}}
                    />
                    Standard 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Standard Shipping $10/Shipment *Multiple Cases Can be in One Shipment</small>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Express"
                        checked={shipping === 'Express'}
                        onChange={(e)=>{setShipping(e.target.value)}}
                    />
                    Express 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Express Shipping $35 Fee</small>
                    </div>
                </div>

                <div  className="row form-group justify-content-center mt-5">
                    <div className="text-center col-8 col-lg-4">
                    <label ><h5>Production</h5></label>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Standard"
                        checked={production === 'Standard'}
                        onChange={(e)=>{setProduction(e.target.value)}}
                    />
                    Standard Production 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Standard Production 4-6 Business Days</small>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Rush"
                        checked={production === 'Rush'}
                        onChange={(e)=>{setProduction(e.target.value)}}
                    />
                    Rush Production 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Rush Production $50 Fee, 3 Business Days</small>
                    </div>
                </div>


        <div className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4">
                <button className="btn btn-primary" type = "submit" onClick={()=>{setFinalPrice(price+price2+price3)}} >Upload</button>
                <br></br>
                <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}><strong>Case Total = ${(price+price2+price3)} *Not including Rush Production and/or Shipping</strong></small>
            </div>
        </div>


        </form>

        
        


            :
            
            
            (type==="Custom Tray")?
            <form className="form form-container" data-toggle="validator" role="form" onSubmit={(e)=>{e.preventDefault(); uploadCase()}}>
        <div className="row form-group justify-content-center">
            <div className="text-center col-4">
                <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
            </div>
        </div>
        <div className="row form-group justify-content-center">
            <div className="text-center col-4 pt-3">
            <label  htmlFor="patientName"><h5>Patient Name</h5></label>
            <input className="form-control" required id="patientName" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
            </div>
        </div>
        <div className="d-flex row pt-4 justify-content-center" >
            <div className="col-4 form-group text-center pb-4 ">
                <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
                <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} readOnly={true} value={crownTooth} onChange={(e)=>setToothInput(e.target.value)}></input>
            </div>
            <div className="col-9 col-lg-3 px-5" >
            <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                        <path style ={{fill: "white", stroke: "black", strokeWidth:"2px"}} d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                        onClick={(e)=> toothHandler(e)} ></path>
                        <path   d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                        <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                        <path  d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                        <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                        <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                        <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                        <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                        <path  d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
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

        <div className="row form-group justify-content-center mt-3">
            <div className="text-center col-8 col-lg-4 pt-3">
            <label htmlFor="Notes" className="form-label"><h5>Prescription Information</h5></label>
            <textarea className="form-control" required style={{backgroundColor:"white", border:"black 1px solid"}} id="Notes" rows="6" value={note} placeholder={"Please include all pertinent case information."} onChange={(e)=>setNote(e.target.value)}></textarea>

            </div>
        </div>

        <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>3D Printed Model</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="No"
                            checked={model3D === 'No'}
                            onChange={(e)=>{setModel3D(e.target.value); setPrice3(0)}}
                        />
                        No
                        </label>
                        
                        <small  className="form-text text-muted"  style={{color:"white"}}></small>
                        
                        <label style={{color:"black", paddingLeft: "10px"}}>
                        <input style={{paddingLeft: "10px"}}
                            type="radio"
                            value="Yes"
                            checked={model3D === 'Yes'}
                            onChange={(e)=>{setModel3D(e.target.value)}}
                            
                        />
                         Yes 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>3D Printed Models $10/Arch</small>
                        </div>
                    </div>
        
        
        <div className="row form-group text-center justify-content-center mt-5">
            <div className= "col-8 col-lg-4">
                <label  htmlFor="product"><h5>Product</h5></label>
                <select className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Product" onChange={(e)=>{setProduct(e.target.value)}}>
                    <option value="Select One">Select One</option>
                    <option value="Custom Tray" onClick={()=>setProduct("Custom Tray")}>Custom Tray</option>
                    
                    
                </select>
                <small id="productPrice" className="form-text text-muted"  style={{color:"white"}}><strong>
                            {(product === "Custom Tray" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                            
                                `$${(price += 35)}`
                            

                            : (product === "Custom Tray" && lowerArch && upperArch)?    
                                `$${(price += 70)}`

                                             
                            :""
                            }
                            
                            </strong></small>
            </div>
        </div>

      



        <div className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4 pt-3">
            <label  htmlFor="picUpload"><h5>Upload Photos</h5></label>
            <br></br>
            {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
            <input 
                className="form-control" 
                
                id="picUpload" 
                type="file" 
                multiple 
                style={{ display: 'none' }} // Hide the file input
                onChange={(e) => {
                    const pics = e.target.files; // Get all selected files
                    const newPics = [...photos]; // Copy the current files in state
                    const newPicName = [...photoName];

                    // Loop through each selected file and add it to the new arrays
                    for (let i = 0; i < pics.length; i++) {
                        newPics.push(pics[i]);
                        newPicName.push(pics[i].name);
                    }

                    // Update state with the new arrays of files and file names
                    setPhotos(newPics);
                    setPhotoName(newPicName);
                }}
            />
            <button 
                className="btn btn-primary"
                onClick={(e) => {e.preventDefault(); document.getElementById('picUpload').click()}} // Trigger file input click
            >
                Select Files
            </button>
            
            <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                {photoName.join(', ')} {/* Display selected file names */}
            </div>
            </div>
            {/* <div className="text-center col-8 col-lg-4 pt-3">
            
            </div> */}
        </div>
        <div className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4 pt-3">
            <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
            <br></br>
            {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
            <input 
                className="form-control" 
                
                id="scanUpload" 
                type="file" 
                multiple 
                style={{ display: 'none' }} // Hide the file input
                onChange={(e) => {
                    const files = e.target.files; // Get all selected files
                    const newFiles = [...stlFile]; // Copy the current files in state
                    const newFileName = [...fileName];

                    // Loop through each selected file and add it to the new arrays
                    for (let i = 0; i < files.length; i++) {
                        newFiles.push(files[i]);
                        newFileName.push(files[i].name);
                    }

                    // Update state with the new arrays of files and file names
                    setStlFile(newFiles);
                    setFileName(newFileName);
                }}
            />
            <button 
                className="btn btn-primary"
                onClick={(e) =>{ e.preventDefault(); document.getElementById('scanUpload').click()}} // Trigger file input click
            >
                Select Files
            </button>
            
            <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                {fileName.join(', ')} {/* Display selected file names */}
            </div>
            </div>
            {/* <div className="text-center col-8 col-lg-4 pt-3">
            
            </div> */}
        </div>


        <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping To KPD (Physical Impressions)</h5></label>
                        <br></br>
                        <button className="btn btn-primary" onClick={(e)=> {e.preventDefault(); getLabelToKpd(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print USPS Label</button>
          
          <button className="btn btn-primary" style={{marginLeft: "5px"}}  onClick={(e)=> {e.preventDefault(); UPSLabel(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print UPS Label</button>
                      
                       
                        </div>
                    </div>

                <div  className="row form-group justify-content-center mt-5">
                    <div className="text-center col-8 col-lg-4">
                    <label ><h5>Shipping from KPD</h5></label>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Standard"
                        checked={shipping === 'Standard'}
                        onChange={(e)=>{setShipping(e.target.value)}}
                    />
                    Standard 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Standard Shipping $10/Shipment *Multiple Cases Can be in One Shipment</small>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Express"
                        checked={shipping === 'Express'}
                        onChange={(e)=>{setShipping(e.target.value)}}
                    />
                    Express 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Express Shipping $35 Fee</small>
                    </div>
                </div>

                <div  className="row form-group justify-content-center mt-5">
                    <div className="text-center col-8 col-lg-4">
                    <label ><h5>Production</h5></label>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Standard"
                        checked={production === 'Standard'}
                        onChange={(e)=>{setProduction(e.target.value)}}
                    />
                    Standard Production 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Standard Production 4-6 Business Days</small>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Rush"
                        checked={production === 'Rush'}
                        onChange={(e)=>{setProduction(e.target.value)}}
                    />
                    Rush Production 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Rush Production $50 Fee, 3 Business Days</small>
                    </div>
                </div>


        <div className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4">
                <button className="btn btn-primary" type = "submit" onClick={()=>{setFinalPrice(price+price2+price3)}} >Upload</button>
                <br></br>
                <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}><strong>Case Total = ${(price+price2+price3)} *Not including Rush Production and/or Shipping</strong></small>
            </div>
        </div>


        </form>
            
            
            
            :
            
            (type==="Smile in a Snap")?
            <form className="form form-container" data-toggle="validator" role="form" onSubmit={(e)=>{e.preventDefault(); uploadCase()}}>
            <div className="row form-group justify-content-center">
                <div className="text-center col-4">
                    <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
                </div>
            </div>
            <div className="row form-group justify-content-center">
                <div className="text-center col-4 pt-3">
                <label  htmlFor="patientName"><h5>Patient Name</h5></label>
                <input className="form-control" required id="patientName" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
                </div>
            </div>
            <div className="d-flex row pt-4 justify-content-center" >
                <div className="col-4 form-group text-center pb-4 ">
                    <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
                    <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} readOnly={true} value={crownTooth} onChange={(e)=>setToothInput(e.target.value)}></input>
                </div>
                <div className="col-9 col-lg-3 px-5" >
                <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                            <path style ={{fill: "white", stroke: "black", strokeWidth:"2px"}} d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                            onClick={(e)=> toothHandler(e)} ></path>
                            <path   d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                            <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                            <path  d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                            <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                            <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                            <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                            <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                            <path  d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
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
    
            <div className="row form-group justify-content-center mt-3">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label htmlFor="Notes" className="form-label"><h5>Prescription Information</h5></label>
                <textarea className="form-control" required style={{backgroundColor:"white", border:"black 1px solid"}} id="Notes" rows="6" value={note} placeholder={"Please include all pertinent case information."} onChange={(e)=>setNote(e.target.value)}></textarea>
    
                </div>
            </div>
    
            <div  className="row form-group justify-content-center mt-5">
                            <div className="text-center col-8 col-lg-4">
                            <label ><h5>3D Printed Model</h5></label>
                            <br></br>
                            <label style={{color:"black"}}>
                            <input
                                type="radio"
                                value="No"
                                checked={model3D === 'No'}
                                onChange={(e)=>{setModel3D(e.target.value); setPrice3(0)}}
                            />
                            No
                            </label>
                            
                            <small  className="form-text text-muted"  style={{color:"white"}}></small>
                            
                            <label style={{color:"black", paddingLeft: "10px"}}>
                            <input style={{paddingLeft: "10px"}}
                                type="radio"
                                value="Yes"
                                checked={model3D === 'Yes'}
                                onChange={(e)=>{setModel3D(e.target.value)}}
                                
                            />
                             Yes 
                            </label>
                            <br></br>
                            <small  className="form-text text-muted"  style={{color:"white"}}>3D Printed Models $10/Arch</small>
                            </div>
                        </div>
            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="shade"><h5>Shade</h5></label>
                    <select className="form-select" id="shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Shade" onChange={(e)=>{setShade(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="Hollywood White" onClick={()=>setShade("Hollywood White")}>Hollywood White</option>
                        <option value="Natural White" onClick={()=>setShade("Natural White")}>Natural White</option>
                        <option value="Natural Yellow/Brown" onClick={()=>setShade("Natural Yellow/Brown")}>Natural Yellow/Brown</option>
                       
                    </select>
                </div>
            </div>
            {/* <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="gum-shade"><h5>Gum Shade</h5></label>
                    <select className="form-select" id="gum-shade"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Gum-Shade" onChange={(e)=>{setGumShade(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="Pink" onClick={()=>setGumShade("Pink")}>Pink</option>
                        <option value="Meharry" onClick={()=>setGumShade("Meharry")}>Meharry</option>
                        <option value="Pink Fiber" onClick={()=>setGumShade("Pink Fiber")}>Pink/Red</option>
                    </select>
                </div>
            </div> */}
            <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="product"><h5>Product</h5></label>
                    <select className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Product" onChange={(e)=>{setProduct(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="Smile in a Snap" onClick={()=>setProduct("Smile in a Snap")}>Smile in a Snap</option>
                        {/* <option value="Final Zirconia" onClick={()=>setProduct("Final Zirconia")}>Final Zirconia</option> */}
                        
                    </select>
                    <small id="productPrice" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(product === "Smile in a Snap" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                
                                    `$${(price += 200)}`
                                
    
                                : (product === "Smile in a Snap" && lowerArch && upperArch)?    
                                    `$${(price += 350)}`
    
                                                 
                                :""
                                }
                                
                                </strong></small>
                </div>
            </div>
    
            {/* <div className="row form-group text-center justify-content-center mt-5">
                <div className= "col-8 col-lg-4">
                    <label  htmlFor="finish"><h5>MUA Connection</h5></label>
                    <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
                        <option value="Select One">Select One</option>
                        <option value="Direct to MUA" onClick={()=>setFinish("Direct to MUA")}>Direct to MUA</option>
                        <option value="Dr Provides Copings" onClick={()=>setFinish("Dr Provides Copings")}>Dr Provides Titanium Copings</option>
                    </select> */}
                    {/* <small id="productPrice2" className="form-text text-muted"  style={{color:"white"}}><strong>
                                {(finish === "Standard")?
                                `$${(price2 += 0)}`
                                
                                :(finish==="Premium" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                                `$${(price2 += 100)}`
    
                                :(finish==="Premium" && lowerArch && upperArch)?
                                `$${(price2 += 200)}`
                                
                                : ""
                                }
                                </strong> </small> */}
                {/* </div>
            </div> */}
    
    
    
            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label  htmlFor="picUpload"><h5>Upload Photos</h5></label>
                <br></br>
                {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                <input 
                    className="form-control" 
                    
                    id="picUpload" 
                    type="file" 
                    multiple 
                    style={{ display: 'none' }} // Hide the file input
                    onChange={(e) => {
                        const pics = e.target.files; // Get all selected files
                        const newPics = [...photos]; // Copy the current files in state
                        const newPicName = [...photoName];
    
                        // Loop through each selected file and add it to the new arrays
                        for (let i = 0; i < pics.length; i++) {
                            newPics.push(pics[i]);
                            newPicName.push(pics[i].name);
                        }
    
                        // Update state with the new arrays of files and file names
                        setPhotos(newPics);
                        setPhotoName(newPicName);
                    }}
                />
                <button 
                    className="btn btn-primary"
                    onClick={(e) => {e.preventDefault(); document.getElementById('picUpload').click()}} // Trigger file input click
                >
                    Select Files
                </button>
                
                <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                    {photoName.join(', ')} {/* Display selected file names */}
                </div>
                </div>
                {/* <div className="text-center col-8 col-lg-4 pt-3">
                
                </div> */}
            </div>
            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4 pt-3">
                <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
                <br></br>
                {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
                <input 
                    className="form-control" 
                    
                    id="scanUpload" 
                    type="file" 
                    multiple 
                    style={{ display: 'none' }} // Hide the file input
                    onChange={(e) => {
                        const files = e.target.files; // Get all selected files
                        const newFiles = [...stlFile]; // Copy the current files in state
                        const newFileName = [...fileName];
    
                        // Loop through each selected file and add it to the new arrays
                        for (let i = 0; i < files.length; i++) {
                            newFiles.push(files[i]);
                            newFileName.push(files[i].name);
                        }
    
                        // Update state with the new arrays of files and file names
                        setStlFile(newFiles);
                        setFileName(newFileName);
                    }}
                />
                <button 
                    className="btn btn-primary"
                    onClick={(e) =>{ e.preventDefault(); document.getElementById('scanUpload').click()}} // Trigger file input click
                >
                    Select Files
                </button>
                
                <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                    {fileName.join(', ')} {/* Display selected file names */}
                </div>
                </div>
                {/* <div className="text-center col-8 col-lg-4 pt-3">
                
                </div> */}
            </div>
    
    
            <div  className="row form-group justify-content-center mt-5">
                            <div className="text-center col-8 col-lg-4">
                            <label ><h5>Shipping To KPD (Physical Impressions)</h5></label>
                            <br></br>
                            <button className="btn btn-primary" onClick={(e)=> {e.preventDefault(); getLabelToKpd(); setWaiting(true); window.scrollTo({
                top: 0,
                behavior: 'smooth', // Smooth scrolling behavior
              });}}>Print USPS Label</button>
              
              <button className="btn btn-primary" style={{marginLeft: "5px"}}  onClick={(e)=> {e.preventDefault(); UPSLabel(); setWaiting(true); window.scrollTo({
                top: 0,
                behavior: 'smooth', // Smooth scrolling behavior
              });}}>Print UPS Label</button>
                          
                           
                            </div>
                        </div>
    
                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping from KPD</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={shipping === 'Standard'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                        Standard 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Shipping $10/Shipment *Multiple Cases Can be in One Shipment</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Express"
                            checked={shipping === 'Express'}
                            onChange={(e)=>{setShipping(e.target.value)}}
                        />
                        Express 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Express Shipping $35 Fee</small>
                        </div>
                    </div>
    
                    <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Production</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Standard"
                            checked={production === 'Standard'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                        Standard Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Standard Production 4-6 Business Days</small>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="Rush"
                            checked={production === 'Rush'}
                            onChange={(e)=>{setProduction(e.target.value)}}
                        />
                        Rush Production 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>Rush Production $50 Fee, 3 Business Days</small>
                        </div>
                    </div>
    
    
            <div className="row form-group justify-content-center mt-5">
                <div className="text-center col-8 col-lg-4">
                    <button className="btn btn-primary" type = "submit" onClick={()=>{setFinalPrice(price+price2+price3)}} >Upload</button>
                    <br></br>
                    <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}><strong>Case Total = ${(price+price2+price3)} *Not including Rush Production and/or Shipping</strong></small>
                </div>
            </div>
    
    
            </form>
            
            :
            (type==="Wax Rim")?
            <form className="form form-container" data-toggle="validator" role="form" onSubmit={(e)=>{e.preventDefault(); uploadCase()}}>
        <div className="row form-group justify-content-center">
            <div className="text-center col-4">
                <h3 style={{textDecoration: "underline"}} value={caseNum}>Case # {(caseNum !== "")? caseNum: ""}</h3>
            </div>
        </div>
        <div className="row form-group justify-content-center">
            <div className="text-center col-4 pt-3">
            <label  htmlFor="patientName"><h5>Patient Name</h5></label>
            <input className="form-control" required id="patientName" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}}  value={patientName} onChange={(e)=>setPatientName(e.target.value)}></input>
            </div>
        </div>
        <div className="d-flex row pt-4 justify-content-center" >
            <div className="col-4 form-group text-center pb-4 ">
                <label  htmlFor="toothInput"><h5>Selected Teeth</h5></label>
                <input className="form-control" required id="toothInput" type="text" style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} readOnly={true} value={crownTooth} onChange={(e)=>setToothInput(e.target.value)}></input>
            </div>
            <div className="col-9 col-lg-3 px-5" >
            <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >
                        <path style ={{fill: "white", stroke: "black", strokeWidth:"2px"}} d="M271.46,332.92a21.1,21.1,0,0,0,2.77,6.6c1,1.58,3,2.4,4.77,3.12.45.18.88.36,1.28.54a122.07,122.07,0,0,0,15.65,5.92,51.48,51.48,0,0,0,11.86,2.37c.47,0,.94,0,1.41,0a23.07,23.07,0,0,0,10.54-2.2,19.36,19.36,0,0,0,10.18-13.17,14.66,14.66,0,0,0,.25-1.95,11,11,0,0,1,.31-2.13c.09-.34.2-.68.3-1a27.53,27.53,0,0,0,.78-3.07,81.22,81.22,0,0,0,1.17-10.88c.07-1.47.09-3,.09-4.47.27-6.32-1.74-10.77-6-13.21-12.39-6.22-23.45-10.08-33.83-11.8a11.36,11.36,0,0,0-1.47-.12,19.52,19.52,0,0,0-10,3.33,18.44,18.44,0,0,0-7.59,10.06,23.44,23.44,0,0,0-.34,7.41,29.4,29.4,0,0,1,0,5.47c-.05.41-.08.82-.12,1.22a11.6,11.6,0,0,1-.37,2.43c-.44,1.52-.95,3.29-1.33,5.09A24.07,24.07,0,0,0,271.46,332.92Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="2" 
                        onClick={(e)=> toothHandler(e)} ></path>
                        <path   d="M298.17,322.55a8.94,8.94,0,0,0,3-.57,8.19,8.19,0,0,0,3-2.75c.86-1.14,1.82-2.22,2.63-3.4,1.8-2.62,3.37-5.65,3.5-8.9a9.54,9.54,0,0,0-.22-2.55,12.86,12.86,0,0,0-.9-2.48s-1-.57-1.2-.68a25.57,25.57,0,0,1-4.53-3.34c3,1.56,6,3.89,12.24,4a13.06,13.06,0,0,1-3.12.36,12.12,12.12,0,0,1-2.18-.24c3,7.62-2.63,14.9-8.34,21.18-.25.27.53,2.39.63,2.75a25.16,25.16,0,0,0,1.06,2.9,31.71,31.71,0,0,0,3.07,5.37c5.75-1.43,16.5-.46,16.5.32a50.8,50.8,0,0,0-16.62.83,34.73,34.73,0,0,0-12.4,5.57,10.34,10.34,0,0,1,4.33,3.62c-3.51-3.33-8.34-4.4-14.19-3.74a33.58,33.58,0,0,1,7.23-.53,4.15,4.15,0,0,0,2.63-.7,36.16,36.16,0,0,1,11.38-5.09,27.39,27.39,0,0,1-4.72-11.24,25.37,25.37,0,0,1-22.52-7.88C280.76,317.9,288.83,323.39,298.17,322.55Z" transform="translate(-270.52 -59.04)" ></path>
                        <path d="M323.37,295.41a21.23,21.23,0,0,1-6.21-1.45c-.7-.23-1.36-.46-2-.63-2.85-.82-5.69-1.79-8.45-2.87a144.06,144.06,0,0,1-14.23-6.82l-1-.52c-3.81-2-7.94-4.72-9.76-9.86-1.33-3.77-2.85-9.29-.65-13.62a79.18,79.18,0,0,0,7.48-24c.91-6,5.71-11.1,11.94-12.78a36.2,36.2,0,0,1,9.37-1.24c13.1,0,27,7.36,38.21,20.18a23.05,23.05,0,0,1,2,2.74,25.42,25.42,0,0,1,2.15,21.63c-2.89,8-7.25,15.49-13.72,23.69l-.11.1a27,27,0,0,1-14.71,5.44Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="3" onClick={(e)=> toothHandler(e)}></path>
                        <path  d="M306.58,280.88a32,32,0,0,0,13.57-7.28c-1.11-1.34-1.39-3.47-1.61-5.18-.05-.37-.1-.73-.15-1.05a69.49,69.49,0,0,1-.88-9.22,3.88,3.88,0,0,1-.94.11c-.19,0-.36,0-.52,0a67.73,67.73,0,0,1-7.65-1,74.42,74.42,0,0,1-7.77-1.87,80.61,80.61,0,0,1-7.82-2.76c-.63-.26-1.24-.55-1.88-.79.65.15,1.32.21,2,.34s1.34.27,2,.42c1.33.31,2.64.67,3.94,1.08,2.17.69,4.3,1.47,6.52,2a43.82,43.82,0,0,0,5.68,1c.79.09,1.58.17,2.37.23s1.81.19,2.71.2a2.63,2.63,0,0,0,1.41-.16,2.69,2.69,0,0,0,.86-1.26l.08-.2a11.75,11.75,0,0,1,3.25-4.15,22.27,22.27,0,0,1,2.41-1.64,22.59,22.59,0,0,0,2-1.36,35.65,35.65,0,0,0-2.18-14,2.34,2.34,0,0,0-1.13-1.21c-.53-.26-1.05-.54-1.55-.85a11.18,11.18,0,0,1-1.37-1.1,31,31,0,0,0,5.53,2.13,31.34,31.34,0,0,0,3.74.61,10,10,0,0,1-2.5.24,8.29,8.29,0,0,1-2.11-.34c.1,0,.29.73.33.84.11.3.22.59.32.89.21.6.4,1.2.58,1.8a37,37,0,0,1,.85,3.72c.19,1,.32,2.08.42,3.12,0,.53.08,1.05.11,1.58,0,.26,0,.53,0,.79a4.58,4.58,0,0,0,0,.83,3.81,3.81,0,0,0,.9-.71,9.53,9.53,0,0,0,.83-.85,18.78,18.78,0,0,0,1.84-3,25.41,25.41,0,0,1,2.16-3.18c.2-.27.41-.52.63-.78a7.77,7.77,0,0,1-.57,1.79,7.29,7.29,0,0,1-.58,1.27c-.34.6-.74,1.55-1.19,2.37a12.26,12.26,0,0,1-1.45,2.3,25.53,25.53,0,0,1-3.66,3.12c-.48.33-1,.64-1.48.94a22.59,22.59,0,0,0-2.3,1.56,10.6,10.6,0,0,0-2.93,3.77l-.09.18a4.43,4.43,0,0,1-.86,1.41h.06a69.23,69.23,0,0,0,.89,9.63q.07.49.15,1.08c.29,2.22.65,5,2.7,5.43l1.29.29c4.52,1,6.89,1.88,11.49,1.25l4-.44a21.5,21.5,0,0,1-6.81,1.6,44,44,0,0,1-8.87-1.34l-1.29-.29a3.39,3.39,0,0,1-1.1-.45c-3.74,3.31-8.65,5.77-14.93,7.51a41.13,41.13,0,0,0,4.77,1.82l3,1.22a29.25,29.25,0,0,1-6.1-1.71,30.81,30.81,0,0,1-5.85-3,16.91,16.91,0,0,1-4.31-3.91c-.08-.11-.37-.42-.32-.54a5.16,5.16,0,0,1,1.39,1.13c.53.48,1,.78,1.45,1.18a30.66,30.66,0,0,0,2.93,2.11,7.08,7.08,0,0,0,1.35.66A3.58,3.58,0,0,0,306.58,280.88Z" transform="translate(-270.52 -59.04)"></path>
                        <path d="M302.78,203.48a28.81,28.81,0,0,0,6,10.72c6.05,6.82,14.81,9.35,21.77,10.8a67.42,67.42,0,0,0,9.62,1.32c2.09.11,3.7.17,5.21.19a49.94,49.94,0,0,0,5.87-.25c6.71-.73,13.43-6.65,15.3-13.47a14.1,14.1,0,0,0-1-9.75,13.7,13.7,0,0,0-1-1.7,25.81,25.81,0,0,0-2.6-3.11l-1.1-1.2c-1.73-2-3.52-3.79-4.9-5.16-3.49-3.49-8.9-8.46-15.4-11.22-4.59-1.94-10.18-2.2-16.21-.75a48,48,0,0,0-15.08,6.59,17.62,17.62,0,0,0-6.26,6.78C301.19,196.93,301.83,200.34,302.78,203.48Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="4" onClick={(e)=> toothHandler(e)}></path>
                        <path d="M333.75,210.2c-.05-4.24,2-7.89,6-10.87a33.35,33.35,0,0,1-10.32-11.24l1.74,1.9c6.24,7.41,10.19,10.53,19.12,12.33l2.86.4c-.63,0-1.26.06-1.87.05A21.42,21.42,0,0,1,340.79,200c-4.18,2.94-6.11,6.44-5.91,10.65a17.87,17.87,0,0,1,8.42,7.49l-2.19-2a20.84,20.84,0,0,0-7.05-4.91s-.27-.06-.27-.1c-3.11-1.12-6.69-1.21-11.86-.55a8.4,8.4,0,0,1-1,.07h-2.31C324.57,209,329.59,208.83,333.75,210.2Z" transform="translate(-270.52 -59.04)"></path>
                        <path d="M346.18,182.73a41.76,41.76,0,0,1-15.8-9.43c-2.64-2.58-4.3-8.08-5.06-11.13a17.58,17.58,0,0,1,0-9.31c2.15-7.17,9.21-11,14.75-13a55.91,55.91,0,0,1,10.38-2.55l1.16-.19a32.22,32.22,0,0,1,6.48-.61,11.6,11.6,0,0,1,2.32.32,11.81,11.81,0,0,1,2.89,1.12,42.17,42.17,0,0,1,7.73,5.48,89.67,89.67,0,0,1,10.28,11c1,1.22,1.93,2.47,2.88,3.72.56.74,1.13,1.48,1.7,2.21a12.36,12.36,0,0,1,2.62,7.86,14.43,14.43,0,0,1-1,5.54c-1.26,3.26-3.71,6.32-7.5,9.34l-.49.39c-1.74,1.41-3.54,2.87-6,2.86h-1C364,186.21,355,185.72,346.18,182.73Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="5" onClick={(e)=> toothHandler(e)}></path>
                        <path d="M355.38,171.22c-.36-6,2.71-10.77,9.13-14.31a43.6,43.6,0,0,1-12.15-10l2.58,1.85c7.47,5.95,12.35,8.9,21.31,11.64l1.22.76a38,38,0,0,1-11.79-3.65c-6.76,3.5-9.75,8.15-9.15,14.2a19.78,19.78,0,0,1,7.73,7.06l-1.92-1.92c-6.29-5.43-11.43-6.11-20.2-6l-1.61-.17C346.33,169.37,351.25,169.54,355.38,171.22Z" transform="translate(-270.52 -59.04)"></path>
                        <path  d="M391.07,145.56l-1.09-.15c-3.68-.5-7.37-1.17-11-2-5-1.14-10.66-2.61-15.45-5.72l-.53-.33a12.35,12.35,0,0,1-2.61-2,15.54,15.54,0,0,1-2.42-4,23.82,23.82,0,0,1-1.7-5.6c-1.73-9.6-.41-21.72,8.49-26.92a25.6,25.6,0,0,1,10.7-3.13c5.81-.54,10.56-.29,14.15.76,14.59,4.24,19.4,19.24,21,27.81.87,4.72,1.59,10.14-.8,14.79-2.26,4.39-6.7,6.1-10,6.76a15.6,15.6,0,0,1-3.3.29A42.33,42.33,0,0,1,391.07,145.56Z" transform="translate(-270.52 -59.04)" className="tooth replace" id="6"
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

        <div className="row form-group justify-content-center mt-3">
            <div className="text-center col-8 col-lg-4 pt-3">
            <label htmlFor="Notes" className="form-label"><h5>Prescription Information</h5></label>
            <textarea className="form-control" required style={{backgroundColor:"white", border:"black 1px solid"}} id="Notes" rows="6" value={note} placeholder={"Please include all pertinent case information."} onChange={(e)=>setNote(e.target.value)}></textarea>

            </div>
        </div>

        <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>3D Printed Model</h5></label>
                        <br></br>
                        <label style={{color:"black"}}>
                        <input
                            type="radio"
                            value="No"
                            checked={model3D === 'No'}
                            onChange={(e)=>{setModel3D(e.target.value); setPrice3(0)}}
                        />
                        No
                        </label>
                        
                        <small  className="form-text text-muted"  style={{color:"white"}}></small>
                        
                        <label style={{color:"black", paddingLeft: "10px"}}>
                        <input style={{paddingLeft: "10px"}}
                            type="radio"
                            value="Yes"
                            checked={model3D === 'Yes'}
                            onChange={(e)=>{setModel3D(e.target.value)}}
                            
                        />
                         Yes 
                        </label>
                        <br></br>
                        <small  className="form-text text-muted"  style={{color:"white"}}>3D Printed Models $10/Arch</small>
                        </div>
                    </div>
        
        
        <div className="row form-group text-center justify-content-center mt-5">
            <div className= "col-8 col-lg-4">
                <label  htmlFor="product"><h5>Product</h5></label>
                <select className="form-select" id="product"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Product" onChange={(e)=>{setProduct(e.target.value)}}>
                    <option value="Select One">Select One</option>
                    <option value="Wax Rim" onClick={()=>setProduct("Wax Rim")}>Wax Rim</option>
                    
                    
                </select>
                <small id="productPrice" className="form-text text-muted"  style={{color:"white"}}><strong>
                            {(product === "Wax Rim" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                            
                                `$${(price += 50)}`
                            

                            : (product === "Wax Rim" && lowerArch && upperArch)?    
                                `$${(price += 100)}`

                                             
                            :""
                            }
                            
                            </strong></small>
            </div>
        </div>

        {/* <div className="row form-group text-center justify-content-center mt-5">
            <div className= "col-8 col-lg-4">
                <label  htmlFor="finish"><h5>MUA Connection</h5></label>
                <select className="form-select" id="finish"  style={{borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", border:"black 1px solid"}} aria-label="Finish" onChange={(e)=>{setFinish(e.target.value)}}>
                    <option value="Select One">Select One</option>
                    <option value="Direct to MUA" onClick={()=>setFinish("Direct to MUA")}>Direct to MUA</option>
                    <option value="Dr Provides Copings" onClick={()=>setFinish("Dr Provides Copings")}>Dr Provides Titanium Copings</option>
                </select> */}
                {/* <small id="productPrice2" className="form-text text-muted"  style={{color:"white"}}><strong>
                            {(finish === "Standard")?
                            `$${(price2 += 0)}`
                            
                            :(finish==="Premium" && ((!lowerArch && upperArch) || (lowerArch && !upperArch)))?
                            `$${(price2 += 100)}`

                            :(finish==="Premium" && lowerArch && upperArch)?
                            `$${(price2 += 200)}`
                            
                            : ""
                            }
                            </strong> </small> */}
            {/* </div>
        </div> */}



        <div className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4 pt-3">
            <label  htmlFor="picUpload"><h5>Upload Photos</h5></label>
            <br></br>
            {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
            <input 
                className="form-control" 
                
                id="picUpload" 
                type="file" 
                multiple 
                style={{ display: 'none' }} // Hide the file input
                onChange={(e) => {
                    const pics = e.target.files; // Get all selected files
                    const newPics = [...photos]; // Copy the current files in state
                    const newPicName = [...photoName];

                    // Loop through each selected file and add it to the new arrays
                    for (let i = 0; i < pics.length; i++) {
                        newPics.push(pics[i]);
                        newPicName.push(pics[i].name);
                    }

                    // Update state with the new arrays of files and file names
                    setPhotos(newPics);
                    setPhotoName(newPicName);
                }}
            />
            <button 
                className="btn btn-primary"
                onClick={(e) => {e.preventDefault(); document.getElementById('picUpload').click()}} // Trigger file input click
            >
                Select Files
            </button>
            
            <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                {photoName.join(', ')} {/* Display selected file names */}
            </div>
            </div>
            {/* <div className="text-center col-8 col-lg-4 pt-3">
            
            </div> */}
        </div>
        <div className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4 pt-3">
            <label  htmlFor="scanUpload"><h5>Upload Scans</h5></label>
            <br></br>
            {/* <input className="form-control" required id="scanUpload" type="file" multiple style={{borderRadius: "1rem", minHeight:"40px"}}  value={fileName} onChange={(e)=>{[...fileName, setFileName(e.target.value)]; setStlFile([...stlFile, e.target.files[0]]); console.log(stlFile)}}></input> */}
            <input 
                className="form-control" 
                
                id="scanUpload" 
                type="file" 
                multiple 
                style={{ display: 'none' }} // Hide the file input
                onChange={(e) => {
                    const files = e.target.files; // Get all selected files
                    const newFiles = [...stlFile]; // Copy the current files in state
                    const newFileName = [...fileName];

                    // Loop through each selected file and add it to the new arrays
                    for (let i = 0; i < files.length; i++) {
                        newFiles.push(files[i]);
                        newFileName.push(files[i].name);
                    }

                    // Update state with the new arrays of files and file names
                    setStlFile(newFiles);
                    setFileName(newFileName);
                }}
            />
            <button 
                className="btn btn-primary"
                onClick={(e) =>{ e.preventDefault(); document.getElementById('scanUpload').click()}} // Trigger file input click
            >
                Select Files
            </button>
            
            <div style={{border:"black 1px solid",borderRadius: "1rem", minHeight:"40px", backgroundColor:"white", marginTop: "10px"}}>
                {fileName.join(', ')} {/* Display selected file names */}
            </div>
            </div>
            {/* <div className="text-center col-8 col-lg-4 pt-3">
            
            </div> */}
        </div>


        <div  className="row form-group justify-content-center mt-5">
                        <div className="text-center col-8 col-lg-4">
                        <label ><h5>Shipping To KPD (Physical Impressions)</h5></label>
                        <br></br>
                        <button className="btn btn-primary" onClick={(e)=> {e.preventDefault(); getLabelToKpd(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print USPS Label</button>
          
          <button className="btn btn-primary" style={{marginLeft: "5px"}}  onClick={(e)=> {e.preventDefault(); UPSLabel(); setWaiting(true); window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling behavior
          });}}>Print UPS Label</button>
                      
                       
                        </div>
                    </div>

                <div  className="row form-group justify-content-center mt-5">
                    <div className="text-center col-8 col-lg-4">
                    <label ><h5>Shipping from KPD</h5></label>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Standard"
                        checked={shipping === 'Standard'}
                        onChange={(e)=>{setShipping(e.target.value)}}
                    />
                    Standard 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Standard Shipping $10/Shipment *Multiple Cases Can be in One Shipment</small>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Express"
                        checked={shipping === 'Express'}
                        onChange={(e)=>{setShipping(e.target.value)}}
                    />
                    Express 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Express Shipping $35 Fee</small>
                    </div>
                </div>

                <div  className="row form-group justify-content-center mt-5">
                    <div className="text-center col-8 col-lg-4">
                    <label ><h5>Production</h5></label>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Standard"
                        checked={production === 'Standard'}
                        onChange={(e)=>{setProduction(e.target.value)}}
                    />
                    Standard Production 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Standard Production 4-6 Business Days</small>
                    <br></br>
                    <label style={{color:"black"}}>
                    <input
                        type="radio"
                        value="Rush"
                        checked={production === 'Rush'}
                        onChange={(e)=>{setProduction(e.target.value)}}
                    />
                    Rush Production 
                    </label>
                    <br></br>
                    <small  className="form-text text-muted"  style={{color:"white"}}>Rush Production $50 Fee, 3 Business Days</small>
                    </div>
                </div>


        <div className="row form-group justify-content-center mt-5">
            <div className="text-center col-8 col-lg-4">
                <button className="btn btn-primary" type = "submit" onClick={()=>{setFinalPrice(price+price2+price3)}} >Upload</button>
                <br></br>
                <small id="emailHelp" className="form-text text-muted"  style={{color:"white"}}><strong>Case Total = ${(price+price2+price3)} *Not including Rush Production and/or Shipping</strong></small>
            </div>
        </div>


        </form>:""}
            </>}
        </>
    )
}

// onClick={uploadCase}