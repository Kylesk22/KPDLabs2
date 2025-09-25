import React, { useEffect, useState, useRef } from "react";
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
    const [model3D, setModel3D] = useState("")
    const [log, setLog] = useState([])
    const [logNote, setLogNote] = useState("")
    const [hold, setHold] = useState("")
    const [userHoldTrigger, setUserHoldTrigger] = useState(false)
    const hasMounted = useRef(false)
    const [newDueDate, setNewDueDate] = useState(false)
    const [shippingStart, setShippingStart] = useState(false)
    const [cases, setCases] = useState([])
    const [casesIncludedShipment, setCasesIncludedShipment] = useState([])
    const [selectedColor, setSelectedColor] = useState("white")
    const [colorMap, setColorMap] = useState({});
    const [shippingRates, setShippingRates] = useState(false)

    const [drId, setDrId] = useState("")
    const [drName, setDrName] = useState("")
    const [drStreet, setDrStreet] = useState("")
    const [drCity, setDrCity] = useState("")
    const [drState, setDrState] = useState("")
    const [drZip, setDrZip] = useState("")
    const [rates, setRates] = useState([])
    const [license, setLicense] = useState([])
    const logRef = useRef(null);
    const [internal, setInternal] = useState(false)

    const [labelUrl, setLabelUrl] = useState("")
    const [files, setFiles] = useState([]);

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


    function testHandler(){

        const options = {
            method:"POST",
            withCredntials: true,
            credentials: 'include',
            
            headers:{
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            },
            
            
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
            alert(err); // Or display a more user-friendly message
        });
        
        //WORKING!!!!
        // const options = {
        //     method:"POST",
            
          
        //     body: JSON.stringify({
        //         text: 'Hello, Slack!',
        //     }),
            
        // }
        // fetch(process.env.SLACK_WEBHOOK, options)
        // .then(response => response.json())
        // .then(data => console.log('Success:', data))
        // .catch(error => console.error('Error:', error));

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
            "rate": selectedRate,
            "cases": casesIncludedShipment
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


    // function fetchFiles() {
        
    //     const url = process.env.BACKEND_URL;
    //     const options = {
    //         method: "GET",
    //         credentials: 'include',
    //         headers: {
    //             "Content-Type": "application/json",
    //             "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    //         },
            
    //     };
    
    //     fetch(`${url}/list_files/${caseNum}`, options)
    //         .then((res) => {
    //             if (res.ok) {
    //                 console.log("good")
    //                 console.log(res.message)
    //             } else {
    //                 throw new Error('Network response was not ok');
    //             }
    //         })
            
    //         .catch((error) => {
    //             console.error('Error:', error);
    //             alert('An error occurred while fetching rates. Please try again later.');
    //         });

    // }

    const fetchFiles = async () => {
        try {
            const response = await fetch(`${url}/list_files/${caseNum}`); // Adjust the endpoint if needed
            const data = await response.json();
            setFiles(data);
            
            // Loop through the files and trigger auto download
            data.forEach((file) => {
                autoDownload(file.url, file.filename);
            });
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };
    

    const downloadAllFiles = () => {
        files.forEach(file => {
            const fileUrl = `https://case-scans.nyc3.cdn.digitaloceanspaces.com/${file}`;
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = file.split('/').pop(); // Set the filename for download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    // const autoDownload = (url, filename) => {
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = filename; // Set the filename for the download
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a); // Clean up
    // };

    // const autoDownload = (url, filename) => {
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = filename; // Set the filename for the download
    //     a.target = '_blank'; // Open in a new tab (optional)
    
    //     // Append the anchor to the body
    //     document.body.appendChild(a);
        
    //     // Use setTimeout to ensure the download is triggered correctly
    //     setTimeout(() => {
    //         a.click();
    //         document.body.removeChild(a); // Clean up after the click
    //     }, 0);
    // };

    const autoDownload = async (url, filename) => {
        const response = await fetch(url);
        const blob = await response.blob(); // Fetch as Blob
        const blobUrl = URL.createObjectURL(blob); // Create a URL for the Blob
    
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename; // Set the filename for the download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a); // Clean up
        URL.revokeObjectURL(blobUrl); // Free up memory
    };


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
                setHold(patientData.hold)
                setModel3D(patientData["3DModel"])
                setLog(patientData.log)
                
                let doctorId = patientData["user id"]
                // Update tooth colors
                console.log(patientData.teeth)
                
                let returnedTeeth = patientData.teeth
                // const numberArray = returnedTeeth.replace(/[^\d,-]/g, '').split(',');;
                const upperArch = ["2","3","4","5","6","7","8","9","10","11","12","13","14","15"];
                const lowerArch = ["18","19","20","21","22","23","24","25","26","27","28","29","30","31"];

                const numberArray = returnedTeeth.replace(/[^\w\d,-\s]/g, '').split(',');
                setCrownTooth(numberArray);

                const hasUpper = numberArray.includes("Upper Arch");
                const hasLower = numberArray.includes("Lower Arch");

                // Highlight teeth
                let teethToHighlight = new Set();

                numberArray.forEach(tooth => {
                    if (tooth === "Upper Arch") {
                        upperArch.forEach(t => teethToHighlight.add(t));
                    } else if (tooth === "Lower Arch") {
                        lowerArch.forEach(t => teethToHighlight.add(t));
                    } else {
                        teethToHighlight.add(tooth); // individual tooth
                    }
                });

                // Apply highlight
                teethToHighlight.forEach(t => {
                    const element = document.getElementById(t);
                    if (element) {
                        element.style.fill = "#137ea7";
                    }
                });
                // for (let tooth in numberArray){
                //     const element = document.getElementById(numberArray[tooth]);
                    
                //     element.style.fill = "#137ea7"
                    
                // }
                
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
                "hold": hold,
                "model3D": model3D,
                ...(logNote ? { logNote } : {}),
                // ...(newDueDate ? { "due_date": newDueDate } : {})
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

                        setTimeout(() => {
                            window.location.href = `/admin/${id}`;
                        }, 500);
                        
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
            
        
            }
    

        const cloneCase = () => {
            generateCase()
            updateCase()
        }



        
        const updateDueDate = () => {
            const url = process.env.BACKEND_URL
            

            let modifiedDueDate = {};

            if (newDueDate) {
                modifiedDueDate = { 
                    caseNumber: caseNum,
                    "due_date": newDueDate };

                const options = {
                    method:"PUT",
                    headers:{
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                    body: JSON.stringify(modifiedDueDate)
                }
                fetch(`${url}/admin/update_due_date`, options)
                .then((res)=> {
                    if (res.ok) {
                        return res.json()
                        .then((data)=>{
                        setNewDueDate(false)
                        alert(data.message)})
                    }})

            } else {
                // alert("No Due Date Added");
                return
            }


        }
        useEffect(()=>{
            if (newDueDate){
            updateDueDate()}
    }, [newDueDate])



        // calculating due date
        const calculateBusinessDays = (numberOfDays) => {

            const split = submissionDate.split(" ")
            const datePart = split[0];
            const datePartSplit = datePart.split("/")
            const month = datePartSplit[0]
            const day = datePartSplit[1]
            const year = datePartSplit[2]
            
            // const [hours, minutes, seconds] = timePart.split(':')

            let currentDate = new Date(year, month - 1, day);
            let daysAdded = 0;
          
            while (daysAdded < numberOfDays) {
              currentDate.setDate(currentDate.getDate() + 1);
              // Check if the current date is a weekday
              if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                daysAdded++;
              }
            }
          
            return currentDate;
          };

         
          
         
            
            const [resultDate, setResultDate] = useState(null);
          
            useEffect(()=>{
            //     const result = calculateBusinessDays(submissionDate, 6);
            //     console.log(result)
            //   setResultDate(result.toDateString());
            //   console.log(resultDate)
                // console.log(calculateBusinessDays(submissionDate, 6))
                if (submissionDate !== "" && submissionDate){
                const result = calculateBusinessDays(6)
                console.log(result)
                const resultString = result.toString()
                
                const resultSplit = resultString.split(" ")
                const finalResult = `${resultSplit[0]} ${resultSplit[1]} ${resultSplit[2]} ${resultSplit[3]}`
                setResultDate(finalResult)
                console.log(`result HERE ${finalResult}`)}
            },[submissionDate])
              
            

            useEffect(()=>console.log(log))

            const handleAddLogNote = () => {
                // Add logNote to the log array
                setLog(prevLog => {
                    const newLog = [...prevLog, logNote];
        
                    // Call updateCase with the new log
                    updateCase();
                    return newLog; // Return the updated log for state
                });
        
                // Clear the log note input if necessary
                setLogNote('');
                setInternal(false)
            };

            const handleAddHold = () => {
                // Add logNote to the log array
                setLogNote("Case placed on hold")

                setLog(prevLog => {
                    const newLog = [...prevLog, logNote];
        
                    // Call updateCase with the new log
                    
                    return newLog; // Return the updated log for state
                });
                console.log(log)

               setHold("add");  

               setUserHoldTrigger(true)
            };

            const handleRemoveHold = () => {
                setLogNote("Case removed from hold")

                setLog(prevLog => {
                    const newLog = [...prevLog, logNote];
        
                    // Call updateCase with the new log
                    
                    return newLog; // Return the updated log for state
                });

               setHold("remove"); 

               setUserHoldTrigger(true)
            }

            useEffect(()=>{
                if (hasMounted.current){
                updateCase()
                }
                else {hasMounted.current=true}
            },[userHoldTrigger])



            useEffect(() => {
                if (logRef.current) {
                    logRef.current.scrollTop = logRef.current.scrollHeight;
                }
            }, [log]);

            useEffect(() => {
                if (internal && !logNote.startsWith('internal')) {
                  setLogNote(`internal_kpd_note ${logNote}`);
                }
              }, [internal, logNote]);





            useEffect(()=>{
                
               
        
                const options = {
                    method:"GET",
                    credentials: 'include',
                    headers:{
                        "Content-Type": "application/json",
                    },
                    
                }
                fetch(`${url}/${drId}/cases`, options)
                .then((res)=> {
                    if (res.ok) {
                        return res.json()
                        .then((data)=>{
                            
                            // setCases([...cases, ...data])
                            const filteredCases = new Map();
                            const statuses = ["Submitted","Manufacturing", "Scanning", "Design", "Pre-Finish", "Finish", "Ready to Ship"];
                            data.forEach(item => {
                                if (item.status) {
                                    statuses.forEach(status => {
                                        if (item.status.toLowerCase().includes(status.toLowerCase())) {
                                            filteredCases.set(item.id, item);
                                        }
                                    });
                                }
                            });
                        
                            // Convert the filtered cases from Map to an array
                            const casesArray = Array.from(filteredCases.values());
                            setCases(casesArray); // Assuming setCases is defined in your context
                            
                            
        
                            
                        })}
                    return(res.json())
                    .then((body)=>{
        
                    //   productionFilter()
                    
                    }
                    
                    )
                    
                    })
               
                .catch((err)=> {
                    console.log(err);
            })
            },[shippingStart])

            const productionFilter = () => {
                const filteredCases = new Map();
                const statuses = ["Submitted","Manufacturing", "Scanning", "Design", "Pre-Finish", "Finish", "Ready to Ship"];
            
                cases.forEach(item => {
                    if (item.status) {
                        statuses.forEach(status => {
                            if (item.status.toLowerCase().includes(status.toLowerCase())) {
                                filteredCases.set(item.id, item);
                            }
                        });
                    }
                });
            
                // Convert the filtered cases from Map to an array
                const casesArray = Array.from(filteredCases.values());
                setCases(casesArray); // Assuming setCases is defined in your context
                
            
                return casesArray; // Return the array of filtered cases
            };



            const handleSelectedCasesColor = (id) => {
                // Toggle color for the clicked item (toggle between lightgray and blue)
                setColorMap(prevMap => {
                  const newColor = prevMap[id] === 'blue' ? 'lightgray' : 'blue'; // Toggle between lightgray and blue
            
                  // Update the colorMap for the clicked item
                  return {
                    ...prevMap,
                    [id]: newColor,
                  };
                });
            
                // Update the casesIncludedShipment state (add or remove id based on the color)
                setCasesIncludedShipment(prev => {
                  // If the color is blue, add the id, if it's lightgray, remove the id
                  if (colorMap[id] === 'blue') {
                    return prev.filter(item => item !== id); // Remove the id
                  } else {
                    return [...prev, id]; // Add the id
                  }
                });
              };


            const remakeCase = () => {
                const url = process.env.BACKEND_URL
    
           
    
    
                const updateCase = {
                    
                    "stl_urls" : "",
                    "photos": "",
                    "reference Id": caseNum,
                    "name": patientName,
                    "product": product,
                    "teeth": crownTooth,
                    "finish": finish,
                    "shade": shade,
                    "note": note,
                    "status": "Created",
                    "type": type,
                    "gum_shade": gumShade,
                    "price": price,
                    "shipping": shipping,
                    "production": production,
                    "model3D": model3D,
                    "drId": drId,
                    
                }
                
                const options = {
                    method:"PUT",
                    headers:{
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
                    },
                    body: JSON.stringify(updateCase)
                }
                fetch(`${url}/admin/clone_case`, options)
                .then((res)=> {
                    if (res.ok) {
                        return res.json()
                        .then((data)=>{
    
                            alert("Case Remake Successful")
                            
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


              


              useEffect(()=>{
                console.log(casesIncludedShipment) 
              })
  
        return (
            <>
            <form className="form form-container printable" data-toggle="validator" role="form" style={{paddingTop: "150px", paddingBottom: "30px"}}>
                <div className="row mt-4 no-print"> 
                    <div className="col-8" style={{alignContent: "space-around"}}>
                        <div className="text-center">
                            <Link to = {`/admin/${id}`}>
                                <button className="theme-btn" style={{width: "170px"}}>Back</button>
                            </Link>
                        </div>
                        <div className="text-center pt-2">
                        <PrintPDFButton doctorFirst={drName} doctorLast={""} model3D={model3D} finish={finish} dueDate={resultDate} price={price} shipping={shipping} production={production} license={license} street={drStreet} city={drCity} state={drState} zip={drZip} submittedDate={submissionDate} patientName={patientName} caseNumber={caseNum} product={product} type={type} shade={shade} note={note} gumShade={gumShade} crownTooth={crownTooth}/>
                        </div>
                        {/* <div className="text-center pt-2">
                            <button className="theme-btn" style={{width: "170px"}} onClick={(e)=>{testHandler(); e.preventDefault()}}>TEST DO NOT USE</button>
                        </div> */}
                        <div className="row form-group justify-content-center mt-3 no-print">
                            <div className="text-center col-8 col-lg-4 pt-3">
                            <button className="btn btn-primary" onClick={(e)=>{e.preventDefault(); updateCase()}}>Update Case</button>
                            </div>
                        </div>
                        <div className="row form-group justify-content-center mt-3 no-print">
                            <div className="text-center col-8 col-lg-4 pt-3">
                            {(!hold)?
                                <button className="btn btn-primary" onClick={(e)=>{handleAddHold()}}>Hold</button>
                            : <button className="btn btn-primary" onClick={(e)=>{handleRemoveHold()}}>Remove Hold</button>
                            }
                            </div>
                        </div>
                        <div className="row form-group justify-content-center mt-3 no-print">
                            <div className="text-center col-8 col-lg-4 pt-3">
                            <button className="btn btn-primary" onClick={(e)=>{e.preventDefault(); setNewDueDate(true)}}>Impressions Received</button>
                            </div>
                        </div>
                        <div className="row form-group justify-content-center mt-3 no-print">
                            <div className="text-center col-8 col-lg-4 pt-3">
                            <button className="btn btn-primary" onClick={(e)=>{e.preventDefault(); remakeCase()}}>Remake Case</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-4 text-center" style={{width: "400px"}}>
                        <div>
                            <div style={{ width: "400px", fontSize: "25px"}}><strong>Log</strong></div>
                            <div style={{ width: "400px", height: "500px", border: "2px solid black", borderRadius: "5px", overflowY: "scroll" }} ref={logRef}>
                                <ul style={{backgroundColor: "white", color:"black"}}>
                                    {Array.isArray(log) && log.map((item, index) => (
                                        <li key={index} style={{padding: "10px", textAlign: "left", borderBottom: "1px dotted grey"}}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <input className="form-control"  id="logNote" type="text" placeholder="Type Message Here" style={{borderRadius: "1rem", minHeight:"40px", width: "400px"}}  value={logNote} onChange={(e)=>setLogNote(e.target.value)}></input>
                        <button className="btn btn-primary" style={{ width: "400px"}}onClick={()=>{handleAddLogNote()}}>Add Note</button>
                        <label style={{color:"black"}}>
                        <input
                            type="checkbox"
                            checked={internal}
                            onChange={() => setInternal(!internal)}  // Toggle between true/false
                            />
                            Mark as Internal
                        </label>
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
                        <input className="form-control" id="refId" type="text" style={{borderRadius: "1rem", minHeight:"40px"}}  value={refId} onChange={(e)=>{setRefId(e.target.value), setShowClone(True)}}></input>
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
                    {/* <svg className="no-print" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.28 570.4" id="replace"  >

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
                            </svg> */}








                            <svg
   className="no-print"
   viewBox="0 0 475.64771 678.46268"
   id="replace"

 
   xmlns="http://www.w3.org/2000/svg"
  >
  
  <path
     d="m 8.2134225,273.92274 a 21.1,21.1 0 0 0 2.7700005,6.6 c 1,1.58 3,2.4 4.77,3.12 0.45,0.18 0.88,0.36 1.28,0.54 a 122.07,122.07 0 0 0 15.65,5.92 51.48,51.48 0 0 0 11.86,2.37 c 0.47,0 0.94,0 1.41,0 a 23.07,23.07 0 0 0 10.54,-2.2 19.36,19.36 0 0 0 10.18,-13.17 14.66,14.66 0 0 0 0.25,-1.95 11,11 0 0 1 0.31,-2.13 c 0.09,-0.34 0.2,-0.68 0.3,-1 a 27.53,27.53 0 0 0 0.78,-3.07 81.22,81.22 0 0 0 1.17,-10.88 c 0.07,-1.47 0.09,-3 0.09,-4.47 0.27,-6.32 -1.74,-10.77 -6,-13.21 -12.39,-6.22 -23.45,-10.08 -33.83,-11.8 a 11.36,11.36 0 0 0 -1.47,-0.12 19.52,19.52 0 0 0 -10,3.33 18.44,18.44 0 0 0 -7.59,10.06 23.44,23.44 0 0 0 -0.34,7.41 29.4,29.4 0 0 1 0,5.47 c -0.05,0.41 -0.08,0.82 -0.12,1.22 a 11.6,11.6 0 0 1 -0.3700005,2.43 c -0.44,1.52 -0.95,3.29 -1.33,5.09 a 24.07,24.07 0 0 0 -0.31,10.44 z"
     className="tooth replace"
     id="2" />
  <path
     d="m 34.923423,263.55274 a 8.94,8.94 0 0 0 3,-0.57 8.19,8.19 0 0 0 3,-2.75 c 0.86,-1.14 1.82,-2.22 2.63,-3.4 1.8,-2.62 3.37,-5.65 3.5,-8.9 a 9.54,9.54 0 0 0 -0.22,-2.55 12.86,12.86 0 0 0 -0.9,-2.48 c 0,0 -1,-0.57 -1.2,-0.68 a 25.57,25.57 0 0 1 -4.53,-3.34 c 3,1.56 6,3.89 12.24,4 a 13.06,13.06 0 0 1 -3.12,0.36 12.12,12.12 0 0 1 -2.18,-0.24 c 3,7.62 -2.63,14.9 -8.34,21.18 -0.25,0.27 0.53,2.39 0.63,2.75 a 25.16,25.16 0 0 0 1.06,2.9 31.71,31.71 0 0 0 3.07,5.37 c 5.75,-1.43 16.5,-0.46 16.5,0.32 a 50.8,50.8 0 0 0 -16.62,0.83 34.73,34.73 0 0 0 -12.4,5.57 10.34,10.34 0 0 1 4.33,3.62 c -3.51,-3.33 -8.34,-4.4 -14.19,-3.74 a 33.58,33.58 0 0 1 7.23,-0.53 4.15,4.15 0 0 0 2.63,-0.7 36.16,36.16 0 0 1 11.38,-5.09 27.39,27.39 0 0 1 -4.72,-11.24 25.37,25.37 0 0 1 -22.52,-7.88 c 2.33,2.54 10.4,8.03 19.74,7.19 z"
     id="path1" />
  <path
     d="m 60.123423,236.41274 a 21.23,21.23 0 0 1 -6.21,-1.45 c -0.7,-0.23 -1.36,-0.46 -2,-0.63 -2.85,-0.82 -5.69,-1.79 -8.45,-2.87 a 144.06,144.06 0 0 1 -14.23,-6.82 l -1,-0.52 c -3.81,-2 -7.94,-4.72 -9.76,-9.86 -1.33,-3.77 -2.85,-9.29 -0.65,-13.62 a 79.18,79.18 0 0 0 7.48,-24 c 0.91,-6 5.71,-11.1 11.94,-12.78 a 36.2,36.2 0 0 1 9.37,-1.24 c 13.1,0 27,7.36 38.21,20.18 a 23.05,23.05 0 0 1 2,2.74 25.42,25.42 0 0 1 2.15,21.63 c -2.89,8 -7.25,15.49 -13.72,23.69 l -0.11,0.1 a 27,27 0 0 1 -14.71,5.44 z"
     className="tooth replace"
     id="3" />
  <path
     d="m 43.333423,221.88274 a 32,32 0 0 0 13.57,-7.28 c -1.11,-1.34 -1.39,-3.47 -1.61,-5.18 -0.05,-0.37 -0.1,-0.73 -0.15,-1.05 a 69.49,69.49 0 0 1 -0.88,-9.22 3.88,3.88 0 0 1 -0.94,0.11 c -0.19,0 -0.36,0 -0.52,0 a 67.73,67.73 0 0 1 -7.65,-1 74.42,74.42 0 0 1 -7.77,-1.87 80.61,80.61 0 0 1 -7.82,-2.76 c -0.63,-0.26 -1.24,-0.55 -1.88,-0.79 0.65,0.15 1.32,0.21 2,0.34 0.68,0.13 1.34,0.27 2,0.42 1.33,0.31 2.64,0.67 3.94,1.08 2.17,0.69 4.3,1.47 6.52,2 a 43.82,43.82 0 0 0 5.68,1 c 0.79,0.09 1.58,0.17 2.37,0.23 0.79,0.06 1.81,0.19 2.71,0.2 a 2.63,2.63 0 0 0 1.41,-0.16 2.69,2.69 0 0 0 0.86,-1.26 l 0.08,-0.2 a 11.75,11.75 0 0 1 3.25,-4.15 22.27,22.27 0 0 1 2.41,-1.64 22.59,22.59 0 0 0 2,-1.36 35.65,35.65 0 0 0 -2.18,-14 2.34,2.34 0 0 0 -1.13,-1.21 c -0.53,-0.26 -1.05,-0.54 -1.55,-0.85 a 11.18,11.18 0 0 1 -1.37,-1.1 31,31 0 0 0 5.53,2.13 31.34,31.34 0 0 0 3.74,0.61 10,10 0 0 1 -2.5,0.24 8.29,8.29 0 0 1 -2.11,-0.34 c 0.1,0 0.29,0.73 0.33,0.84 0.11,0.3 0.22,0.59 0.32,0.89 0.21,0.6 0.4,1.2 0.58,1.8 a 37,37 0 0 1 0.85,3.72 c 0.19,1 0.32,2.08 0.42,3.12 0,0.53 0.08,1.05 0.11,1.58 0,0.26 0,0.53 0,0.79 a 4.58,4.58 0 0 0 0,0.83 3.81,3.81 0 0 0 0.9,-0.71 9.53,9.53 0 0 0 0.83,-0.85 18.78,18.78 0 0 0 1.84,-3 25.41,25.41 0 0 1 2.16,-3.18 c 0.2,-0.27 0.41,-0.52 0.63,-0.78 a 7.77,7.77 0 0 1 -0.57,1.79 7.29,7.29 0 0 1 -0.58,1.27 c -0.34,0.6 -0.74,1.55 -1.19,2.37 a 12.26,12.26 0 0 1 -1.45,2.3 25.53,25.53 0 0 1 -3.66,3.12 c -0.48,0.33 -1,0.64 -1.48,0.94 a 22.59,22.59 0 0 0 -2.3,1.56 10.6,10.6 0 0 0 -2.93,3.77 l -0.09,0.18 a 4.43,4.43 0 0 1 -0.86,1.41 h 0.06 a 69.23,69.23 0 0 0 0.89,9.63 q 0.07,0.49 0.15,1.08 c 0.29,2.22 0.65,5 2.7,5.43 l 1.29,0.29 c 4.52,1 6.89,1.88 11.49,1.25 l 4,-0.44 a 21.5,21.5 0 0 1 -6.81,1.6 44,44 0 0 1 -8.87,-1.34 l -1.29,-0.29 a 3.39,3.39 0 0 1 -1.1,-0.45 c -3.74,3.31 -8.65,5.77 -14.93,7.51 a 41.13,41.13 0 0 0 4.77,1.82 l 3,1.22 a 29.25,29.25 0 0 1 -6.1,-1.71 30.81,30.81 0 0 1 -5.85,-3 16.91,16.91 0 0 1 -4.31,-3.91 c -0.08,-0.11 -0.37,-0.42 -0.32,-0.54 a 5.16,5.16 0 0 1 1.39,1.13 c 0.53,0.48 1,0.78 1.45,1.18 a 30.66,30.66 0 0 0 2.93,2.11 7.08,7.08 0 0 0 1.35,0.66 3.58,3.58 0 0 0 2.24,0.07 z"
     id="path2" />
  <path
     d="m 39.533423,144.48274 a 28.81,28.81 0 0 0 6,10.72 c 6.05,6.82 14.81,9.35 21.77,10.8 a 67.42,67.42 0 0 0 9.62,1.32 c 2.09,0.11 3.7,0.17 5.21,0.19 a 49.94,49.94 0 0 0 5.87,-0.25 c 6.71,-0.73 13.429997,-6.65 15.299997,-13.47 a 14.1,14.1 0 0 0 -1,-9.75 13.7,13.7 0 0 0 -1,-1.7 25.81,25.81 0 0 0 -2.599997,-3.11 l -1.1,-1.2 c -1.73,-2 -3.52,-3.79 -4.9,-5.16 -3.49,-3.49 -8.9,-8.46 -15.4,-11.22 -4.59,-1.94 -10.18,-2.2 -16.21,-0.75 a 48,48 0 0 0 -15.08,6.59 17.62,17.62 0 0 0 -6.26,6.78 c -1.81,3.66 -1.17,7.07 -0.22,10.21 z"
     className="tooth replace"
     id="4" />
  <path
     d="m 70.503423,151.20274 c -0.05,-4.24 2,-7.89 6,-10.87 a 33.35,33.35 0 0 1 -10.32,-11.24 l 1.74,1.9 c 6.24,7.41 10.19,10.53 19.12,12.33 l 2.86,0.4 c -0.63,0 -1.26,0.06 -1.87,0.05 a 21.42,21.42 0 0 1 -10.49,-2.77 c -4.18,2.94 -6.11,6.44 -5.91,10.65 a 17.87,17.87 0 0 1 8.42,7.49 l -2.19,-2 a 20.84,20.84 0 0 0 -7.05,-4.91 c 0,0 -0.27,-0.06 -0.27,-0.1 -3.11,-1.12 -6.69,-1.21 -11.86,-0.55 a 8.4,8.4 0 0 1 -1,0.07 h -2.31 c 5.95,-1.65 10.97,-1.82 15.13,-0.45 z"
     id="path3" />
  <path
     d="m 82.933423,123.73274 a 41.76,41.76 0 0 1 -15.8,-9.43 c -2.64,-2.58 -4.3,-8.08 -5.06,-11.13 a 17.58,17.58 0 0 1 0,-9.310004 c 2.15,-7.17 9.21,-11 14.75,-13 a 55.91,55.91 0 0 1 10.38,-2.55 l 1.16,-0.19 a 32.22,32.22 0 0 1 6.48,-0.61 11.6,11.6 0 0 1 2.32,0.32 11.81,11.81 0 0 1 2.889997,1.12 42.17,42.17 0 0 1 7.73,5.48 89.67,89.67 0 0 1 10.28,11 c 1,1.22 1.93,2.47 2.88,3.72 0.56,0.74 1.13,1.480004 1.7,2.210004 a 12.36,12.36 0 0 1 2.62,7.86 14.43,14.43 0 0 1 -1,5.54 c -1.26,3.26 -3.71,6.32 -7.5,9.34 l -0.49,0.39 c -1.74,1.41 -3.54,2.87 -6,2.86 h -1 c -8.52,-0.14 -17.519997,-0.63 -26.339997,-3.62 z"
     className="tooth replace"
     id="5" />
  <path
     d="m 92.133423,112.22274 c -0.36,-6 2.71,-10.77 9.129997,-14.310004 a 43.6,43.6 0 0 1 -12.149997,-10 l 2.58,1.85 c 7.47,5.95 12.349997,8.9 21.309997,11.640004 l 1.22,0.76 a 38,38 0 0 1 -11.79,-3.650004 c -6.759997,3.500004 -9.749997,8.150004 -9.149997,14.200004 a 19.78,19.78 0 0 1 7.729997,7.06 l -1.919997,-1.92 c -6.29,-5.43 -11.43,-6.11 -20.2,-6 l -1.61,-0.17 c 5.8,-1.31 10.72,-1.14 14.85,0.54 z"
     id="path4" />
  <path
     d="m 127.82342,86.562736 -1.09,-0.15 c -3.68,-0.5 -7.37,-1.17 -11,-2 -5,-1.14 -10.66,-2.61 -15.45,-5.72 l -0.529997,-0.33 a 12.35,12.35 0 0 1 -2.61,-2 15.54,15.54 0 0 1 -2.42,-4 23.82,23.82 0 0 1 -1.7,-5.6 c -1.73,-9.6 -0.41,-21.72 8.489997,-26.92 a 25.6,25.6 0 0 1 10.7,-3.13 c 5.81,-0.54 10.56,-0.29 14.15,0.76 14.59,4.24 19.4,19.24 21,27.81 0.87,4.72 1.59,10.14 -0.8,14.79 -2.26,4.39 -6.7,6.1 -10,6.76 a 15.6,15.6 0 0 1 -3.3,0.29 42.33,42.33 0 0 1 -5.44,-0.56 z"
     className="tooth replace"
     id="6" />
  <path
     d="m 111.18342,50.842736 c 3.85,-4.81 9.51,-7 16.91,-6.51 l -0.14,-0.34 c -7.82,-0.86 -12.82,0.91 -16.73,6.34 z"
     id="path5" />
  <path
     d="m 102.34342,70.772736 0.45,0.85 c -1.13,-5.57 0.12,-11.34 4,-17.56 l -0.63,0.23 c -4.18,6.48 -5.17,10.8 -3.82,16.48 z"
     id="path6" />
  <path
     d="m 137.89342,43.322736 c 9.66,9.6 19.12,16.14 28.94,20 a 10.44,10.44 0 0 0 3.76,0.71 13.19,13.19 0 0 0 9.38,-3.82 17.09,17.09 0 0 0 3.69,-6.48 c 0.77,-2.58 0.44,-5.86 0.15,-8.75 -0.05,-0.52 -0.1,-1 -0.14,-1.49 a 68.75,68.75 0 0 0 -3.21,-15.61 60.53,60.53 0 0 0 -2.11,-5.73 c -0.3,-0.68 -0.61,-1.32 -0.93,-1.91 a 8.45,8.45 0 0 0 -4.6,-3.74 v -0.07 h -0.32 a 5.71,5.71 0 0 0 -0.58,-0.21 4.59,4.59 0 0 0 -1.7,-0.09 c -17.07,-1.92 -30.7,5.16 -35.1,18.5 v 0 a 5.89,5.89 0 0 0 -0.26,0.7 c -0.86,2.86 1.17,5.92 3.03,7.99 z"
     className="tooth replace"
     id="7" />
  <path
     d="m 169.08342,23.752736 c -11.12,1.48 -19.73,5.91 -25.61,13.64 5.5,-9.18 14.28,-13.55 25.61,-13.64 z"
     id="path7" />
  <path
     d="m 181.27342,27.592736 c 0.28,0.6 0.56,1.21 0.84,1.85 a 61.43,61.43 0 0 0 18.69,24.47 18.32,18.32 0 0 0 10.6,3.94 v 0 c 4.33,0 8.69,-1.91 13,-5.8 l 0.09,-0.1 c 5.7,-8.6 9.72,-19.06 12.29,-32 a 21.81,21.81 0 0 0 0.36,-7.89 c -0.31,-1.82 -0.88,-5.2099999 -2.67,-6.3899999 a 3.4,3.4 0 0 0 -0.69,-0.34 v 0 c -20.31,-8.75 -37.58,-6.72 -51.34,5.9999999 a 4.86,4.86 0 0 0 -1.73,1.36 c -1.3,1.66 -1.59,3.92 -1.71,5.92 -0.25,3.61 0.97,6.22 2.27,8.98 z"
     className="tooth replace"
     id="8" />
  <path
     d="m 297.30342,19.002736 c -0.1,-2 -0.38,-4.27 -1.66,-5.94 a 4.86,4.86 0 0 0 -1.72,-1.37 c -13.63,-12.8899999 -30.88,-15.0899999 -51.27,-6.5399999 v 0 a 3.42,3.42 0 0 0 -0.7,0.33 c -1.8,1.17 -2.4,4.5499999 -2.73,6.3699999 a 21.88,21.88 0 0 0 0.28,7.88 c 2.44,12.93 6.36,23.43 12,32.09 l 0.09,0.1 c 4.23,3.93 8.57,5.92 12.91,5.92 v 0 a 18.37,18.37 0 0 0 10.62,-3.84 61.46,61.46 0 0 0 18.92,-24.29 c 0.29,-0.64 0.58,-1.25 0.87,-1.84 1.32,-2.74 2.56,-5.34 2.39,-8.87 z"
     className="tooth replace"
     id="9" />
  <path
     d="m 340.98342,35.812736 c -0.08,-0.25 -0.17,-0.48 -0.26,-0.71 v 0 c -4.27,-13.38 -17.83,-20.59 -34.92,-18.84 a 4.86,4.86 0 0 0 -1.7,0.07 l -0.58,0.21 h -0.32 v 0.07 a 8.5,8.5 0 0 0 -4.64,3.7 c -0.32,0.59 -0.64,1.23 -1,1.9 -0.82,1.82 -1.49,3.74 -2.17,5.71 a 69.17,69.17 0 0 0 -3.35,15.58 c -0.05,0.47 -0.1,1 -0.16,1.49 -0.32,2.89 -0.68,6.16 0.07,8.75 a 17.14,17.14 0 0 0 3.62,6.51 13.15,13.15 0 0 0 9.34,3.91 10.44,10.44 0 0 0 3.77,-0.66 c 9.86,-3.8 19.38,-10.25 29.13,-19.75 1.94,-2.02 4.01,-5.07 3.17,-7.94 z"
     className="tooth replace"
     id="10" />
  <path
     d="m 342.36342,87.072736 a 16.23,16.23 0 0 1 -3.3,-0.31 c -3.32,-0.69 -7.74,-2.45 -10,-6.86 -2.34,-4.67 -1.57,-10.09 -0.66,-14.8 1.66,-8.55 6.63,-23.51 21.25,-27.6 3.61,-1 8.36,-1.22 14.16,-0.62 a 25.46,25.46 0 0 1 10.67,3.23 c 8.85,5.29 10.05,17.42 8.22,27 a 23.67,23.67 0 0 1 -1.74,5.58 15.73,15.73 0 0 1 -2.47,4 12.53,12.53 0 0 1 -2.62,2 l -0.54,0.33 c -4.82,3.06 -10.53,4.48 -15.51,5.57 -3.6,0.79 -7.3,1.42 -11,1.89 l -1.1,0.14 a 42.3,42.3 0 0 1 -5.36,0.45 z"
     className="tooth replace"
     id="11" />
  <path
     d="m 365.97342,127.51274 h -1.05 c -2.44,0 -4.23,-1.49 -6,-2.92 l -0.48,-0.39 c -3.76,-3.06 -6.18,-6.14 -7.41,-9.42 a 14.41,14.41 0 0 1 -0.92,-5.54 12.37,12.37 0 0 1 2.69,-7.84 c 0.58,-0.72 1.15,-1.460004 1.72,-2.190004 1,-1.24 1.92,-2.49 2.92,-3.7 a 89.83,89.83 0 0 1 10.39,-10.86 42.1,42.1 0 0 1 7.78,-5.41 11.8,11.8 0 0 1 5.22,-1.39 32.13,32.13 0 0 1 6.47,0.68 l 1.17,0.19 a 57,57 0 0 1 10.35,2.65 c 5.52,2 12.54,6 14.62,13.17 a 17.65,17.65 0 0 1 -0.11,9.310004 c -0.79,3 -2.5,8.53 -5.17,11.08 a 41.62,41.62 0 0 1 -15.89,9.27 c -8.76,2.91 -17.82,3.31 -26.3,3.31 z"
     className="tooth replace"
     id="12" />
  <path
     d="m 435.41342,135.17274 a 17.68,17.68 0 0 0 -6.19,-6.84 48,48 0 0 0 -15,-6.74 c -6,-1.51 -11.6,-1.31 -16.21,0.6 -6.53,2.69 -12,7.6 -15.51,11.06 -1.39,1.36 -3.2,3.16 -5,5.11 q -0.54,0.6 -1.11,1.2 a 25,25 0 0 0 -2.63,3.08 13,13 0 0 0 -1,1.69 14,14 0 0 0 -1.1,9.74 c 1.8,6.84 8.46,12.82 15.17,13.61 a 48.76,48.76 0 0 0 5.92,0.32 c 1.51,0 3.11,0 5.2,-0.14 a 68.32,68.32 0 0 0 9.64,-1.22 c 7,-1.38 15.76,-3.83 21.87,-10.59 a 28.79,28.79 0 0 0 6.08,-10.66 c 0.95,-3.14 1.62,-6.55 -0.13,-10.22 z"
     className="tooth replace"
     id="13" />
  <path
     d="m 414.09342,237.10274 v 0 h -0.46 a 27.08,27.08 0 0 1 -14.66,-5.58 l -0.1,-0.1 c -6.39,-8.26 -10.68,-15.84 -13.49,-23.83 a 25.39,25.39 0 0 1 2.37,-21.59 20.28,20.28 0 0 1 2,-2.71 c 11.2,-12.59 25.07,-19.81 38.05,-19.81 a 36.27,36.27 0 0 1 9.71,1.33 c 6.21,1.74 11,6.92 11.81,12.9 a 79.16,79.16 0 0 0 7.25,24.07 c 2.15,4.36 0.58,9.86 -0.79,13.62 -1.86,5.12 -6,7.81 -9.85,9.77 l -1,0.51 a 143.94,143.94 0 0 1 -14.29,6.67 c -2.77,1.06 -5.62,2 -8.48,2.79 -0.6,0.17 -1.26,0.39 -2,0.61 a 21.82,21.82 0 0 1 -6.07,1.35 z"
     className="tooth replace"
     id="14" />
  <path
     d="m 230.37342,14.942736 -1.09,-0.34 c -14,-3.73 -28.66,-2 -42.88,5 l 0.65,-0.48 c 14.59,-9.12 29.24,-10.2299999 43.32,-4.18 z"
     id="path8" />
  <path
     d="m 465.38342,264.70274 c -0.37,-1.8 -0.86,-3.57 -1.29,-5.09 a 11.77,11.77 0 0 1 -0.35,-2.45 c 0,-0.39 0,-0.8 -0.1,-1.21 a 29.4,29.4 0 0 1 0.05,-5.47 23.4,23.4 0 0 0 -0.26,-7.41 18.43,18.43 0 0 0 -7.5,-10.13 19.3,19.3 0 0 0 -10,-3.43 9.8,9.8 0 0 0 -1.47,0.1 c -10.4,1.62 -21.5,5.37 -33.94,11.47 -4.28,2.4 -6.34,6.83 -6.12,13.15 0,1.5 0,3 0,4.47 a 83.19,83.19 0 0 0 1.06,10.89 27.19,27.19 0 0 0 0.76,3.08 c 0.09,0.34 0.19,0.68 0.29,1 a 11.06,11.06 0 0 1 0.28,2.13 14.57,14.57 0 0 0 0.24,2 19.36,19.36 0 0 0 10,13.27 23.27,23.27 0 0 0 10.52,2.3 h 1.41 a 52.7,52.7 0 0 0 11.89,-2.26 121,121 0 0 0 15.7,-5.77 c 0.4,-0.18 0.84,-0.35 1.29,-0.53 1.78,-0.7 3.8,-1.5 4.8,-3.07 a 21.2,21.2 0 0 0 2.84,-6.57 24.42,24.42 0 0 0 -0.1,-10.47 z"
     className="tooth replace"
     id="15" />
  <path
     d="m 472.5406,323.03311 c -0.34551,-1.58922 -0.80307,-3.15195 -1.2046,-4.49396 a 10.99078,10.391745 0 0 1 -0.32683,-2.16311 c 0,-0.34433 0,-0.70632 -0.0934,-1.06831 a 27.453604,25.957289 0 0 1 0.0467,-4.82947 21.850828,20.659883 0 0 0 -0.24278,-6.5423 17.209861,16.271865 0 0 0 -7.00347,-8.94378 18.022264,17.039989 0 0 0 -9.33796,-3.02835 9.1512014,8.6524298 0 0 0 -1.37268,0.0883 c -9.71148,1.4303 -20.07662,4.74117 -31.69304,10.12687 -3.99665,2.11896 -5.92027,6.03021 -5.71483,11.61015 0,1.32435 0,2.6487 0,3.94657 a 77.682494,73.448534 0 0 0 0.98982,9.61479 25.389915,24.006078 0 0 0 0.70968,2.71933 c 0.084,0.30019 0.17743,0.60038 0.27081,0.8829 a 10.327784,9.764885 0 0 1 0.26146,1.88058 13.605409,12.863868 0 0 0 0.22411,1.76581 18.078292,17.092963 0 0 0 9.33796,11.71609 21.729434,20.545106 0 0 0 9.82353,2.03067 h 1.31666 a 49.211052,46.528883 0 0 0 11.10283,-1.99535 112.98932,106.83102 0 0 0 14.6606,-5.09434 c 0.37352,-0.15892 0.78439,-0.30902 1.2046,-0.46794 1.66215,-0.61803 3.54842,-1.32435 4.48222,-2.7105 a 19.796476,18.717501 0 0 0 2.65198,-5.80066 22.8033,21.560442 0 0 0 -0.0934,-9.24398 z"
     className="tooth replace"
     id="16"
    //  style="stroke-width:0.907992" 
    />
  <path
     d="m 434.48342,487.53274 a 30.44,30.44 0 0 1 -6.6,-0.77 76.67,76.67 0 0 1 -11.51,-3.87 l -2.8,-1.09 -1.58,-0.61 c -4.31,-1.64 -8.78,-3.33 -12.34,-6.38 a 15.61,15.61 0 0 1 -5.13,-8.22 c -0.63,-2.75 -0.21,-6.06 1.28,-10.12 h 0.14 a 29.43,29.43 0 0 1 3.11,-7.28 c 0.7,-1.29 1.42,-2.62 2.06,-4.07 0.45,-1 0.9,-2.15 1.35,-3.28 1.42,-3.55 2.9,-7.21 5.12,-10 a 28.59,28.59 0 0 1 13.4,-9.7 c 6.75,-2.14 14.69,-1.29 24.26,2.61 9.57,3.9 15.47,8.9 18,15.25 2.23,5.61 1.39,11.5 0.29,15.45 -0.94,3.36 -2.88,6.35 -4.75,9.24 -0.94,1.43 -1.9,2.92 -2.71,4.41 -0.54,1 -1,2 -1.57,3 -2.83,5.46 -5.76,11.11 -11.47,13.69 a 20.74,20.74 0 0 1 -8.55,1.74 z"
     className="tooth replace"
     id="18" />
  <path
     d="m 440.89342,520.94274 a 28.76,28.76 0 0 0 -0.5,-3.77 c -0.17,-0.91 -0.33,-1.85 -0.43,-2.77 -0.22,-2.21 -0.42,-4.43 -0.61,-6.64 -0.07,-0.86 -0.1,-1.72 -0.14,-2.57 -0.12,-2.8 -0.24,-5.69 -1.65,-8.37 -0.28,-0.52 -0.6,-1 -0.91,-1.48 -1.66,-2.55 -4.54,-4.39 -6.85,-5.87 a 43.33,43.33 0 0 0 -8.35,-4.15 41.42,41.42 0 0 0 -18.33,-2.51 c -4.94,0.47 -11.77,1.74 -16.31,5.09 l -0.06,0.1 a 1.48,1.48 0 0 0 -0.29,0.22 c -6.86,6.28 -10.53,16.3 -13.76,25.14 -1,2.87 -2,5.58 -3.08,8 -2.84,6.55 -1.41,16.3 5.84,20.64 l 0.74,0.44 c 5.39,3.23 10.48,6.28 16.29,8.55 a 81.09,81.09 0 0 0 9.37,3 c 0.67,0.17 1.35,0.37 2,0.56 a 24,24 0 0 0 6.6,1.25 h 0.13 a 16.35,16.35 0 0 0 7.7,-2.2 c 4.71,-2.58 8.55,-6.67 12,-10.71 a 66.52,66.52 0 0 0 7.24,-10.45 c 2.16,-3.85 3.56,-7.25 3.36,-11.5 z"
     className="tooth replace"
     id="19" />
  <path
     d="m 421.75342,534.33274 1.07,0.54 c 0.35,0.13 -0.07,-0.14 -1.07,-0.54 z"
     id="path9" />
  <path
     d="m 410.04342,506.85274 a 17.62,17.62 0 0 1 -1.29,-11.85 0.71,0.71 0 0 1 0.84,-0.53 22.87,22.87 0 0 0 4.11,0.36 c 1,0 2.07,-0.05 3.18,-0.16 a 40.17,40.17 0 0 1 -14.57,-3.93 12.06,12.06 0 0 0 4.92,3.1 0.72,0.72 0 0 1 0.47,0.84 18.65,18.65 0 0 0 1.33,12.64 25.57,25.57 0 0 0 -10.45,10.34 v 0 0 0.05 a 33.6,33.6 0 0 1 -19.83,-4.21 c 4.17,3.57 10.23,5.37 18,5.37 0.47,0 1,0 1.44,0 a 13.22,13.22 0 0 0 0.67,10.27 8.93,8.93 0 0 0 -1,0.41 c -3.54,1.81 -5.77,5.64 -6.83,11.66 a 19.58,19.58 0 0 0 -8,-0.13 38.89,38.89 0 0 1 17.18,4.78 23.61,23.61 0 0 0 -8.08,-4.37 c 0.69,-5.94 3,-9 6.27,-11 5.22,-3 19.22,2.08 23.37,3.83 -7.94,-4 -15.91,-7.13 -21.84,-5.56 -1.63,-3 -1.81,-6.44 -0.48,-10.31 l 0.11,-0.32 c 5.46,-13.07 23.86,-13.08 30.27,-13 -7.85,-0.91 -14.41,-0.13 -19.79,1.72 z"
     id="path10" />
  <path
     d="m 387.28342,595.07274 c -11.39,0 -21.43,-4.83 -30,-14.44 v 0 a 14.59,14.59 0 0 1 -3.45,-11.87 24.49,24.49 0 0 1 10.21,-16.22 24.16,24.16 0 0 1 16.54,-3.71 c 6.92,0.81 13.61,3.71 19.8,6.71 a 24,24 0 0 1 10.93,11.79 19.1,19.1 0 0 1 0.24,15.57 16.1,16.1 0 0 1 -4,5.39 c -1.44,1.27 -5.16,4.33 -8.72,5.24 a 46.22,46.22 0 0 1 -11.55,1.54 z"
     className="tooth replace"
     id="20" />
  <path
     d="m 375.22342,563.84274 c 1.73,-2.4 4.46,-3.91 8.09,-4.49 2.64,2 7.41,3.66 13.5,5.31 -7.48,-2.79 -13.62,-5.71 -15.8,-9 a 4.21,4.21 0 0 0 1.26,2.82 12.44,12.44 0 0 0 -7.94,4.77 c -0.13,0.19 -0.23,0.4 -0.36,0.59 -1.62,-2.26 -4.24,-3.6 -7.44,-4.43 a 15.44,15.44 0 0 1 6.49,4.85 1.11,1.11 0 0 1 0.1,1.11 c -1.58,3.52 -1.85,8.26 -0.86,14.36 a 25.51,25.51 0 0 0 -7.59,-1.16 h -0.35 a 65.4,65.4 0 0 1 19,7.18 34.85,34.85 0 0 0 -9.84,-5.63 c -1.32,-7.38 -0.73,-12.84 1.74,-16.28 z"
     id="path11" />
  <path
     d="m 361.60342,632.59274 c -12.59,0 -20.46,-8.39 -23.38,-24.92 -0.73,-4.07 -1.14,-9.26 2.11,-13.22 3.86,-4.7 10.22,-5.29 14.66,-5.32 h 0.34 a 50,50 0 0 1 16.91,3 c 6,2.14 9.94,5 12.12,8.84 2.75,4.78 5.34,10.47 3.69,16.42 a 16.43,16.43 0 0 1 -6.4,8.81 28.27,28.27 0 0 1 -7.81,4.23 41.17,41.17 0 0 1 -12.24,2.16 z"
     className="tooth replace"
     id="21" />
  <path
     d="m 349.29342,611.00274 c 2,-6.66 6,-10.2 12.17,-10.79 a 1.6,1.6 0 0 1 1.12,0.37 c 2.55,2 7.39,3.4 11.89,4.48 0,0 -9.69,-3.68 -11.78,-5.85 a 11.37,11.37 0 0 1 -1.71,-3.68 3.81,3.81 0 0 0 -0.07,3 0.54,0.54 0 0 1 -0.44,0.74 c -5.86,0.85 -9.89,4.45 -12,10.74 a 0.63,0.63 0 0 1 -0.92,0.35 6.6,6.6 0 0 0 -3.16,-1.12 42.25,42.25 0 0 1 10.73,12.35 c -1.79,-4.35 -3.64,-7.52 -5.59,-9.56 a 1,1 0 0 1 -0.24,-1.03 z"
     id="path12" />
  <path
     d="m 333.32342,659.70274 c -1.3,0 -2.59,-0.08 -3.68,-0.16 a 41,41 0 0 1 -12,-2.69 c -3.72,-1.56 -5.84,-4.61 -6.49,-9.33 a 67,67 0 0 1 -0.73,-20.39 c 1.07,-7.59 4.75,-11.29 11,-10.94 10.61,2.54 19.47,6.87 26.45,12.87 a 17.85,17.85 0 0 1 4.65,6.71 9.29,9.29 0 0 1 0.94,3.84 20,20 0 0 1 -1.86,6.29 v 0.14 a 29.13,29.13 0 0 1 -3,5.44 17.24,17.24 0 0 1 -15.3,8.22 z"
     className="tooth replace"
     id="22" />
  <path
     d="m 319.69342,652.71274 a 50.27,50.27 0 0 0 27.26,-16.28 c -5.2,8.72 -14.39,14.2 -27.26,16.28 z"
     id="path13" />
  <path
     d="m 312.28342,652.58274 -0.07,-0.11 a 86.62,86.62 0 0 0 -18.85,-19.53 12.47,12.47 0 0 0 -1.11,-0.66 10.34,10.34 0 0 0 -12.34,1.62 9,9 0 0 0 -2,3 27.39,27.39 0 0 0 -1.27,3.62 65.46,65.46 0 0 0 -1.5,6.9 v 0.29 a 161,161 0 0 0 -2,16.14 c 0.37,4.08 2.28,6.65 5.64,7.61 a 40.26,40.26 0 0 0 14.8,3.25 c 7.85,0 14.26,-3.52 19.09,-10.51 1.57,-2.98 1.44,-6.88 -0.39,-11.62 z"
     className="tooth replace"
     id="23" />
  <path
     d="m 308.75342,657.49274 a 110.93,110.93 0 0 1 -27.27,8.29 h 0.12 c 10.4,0 19.54,-2.78 27.15,-8.29 z"
     id="path14" />
  <path
     d="m 271.95342,660.00274 a 10.29,10.29 0 0 0 -0.73,-2.15 c -0.78,-1.65 -1.42,-3.38 -2.17,-5 a 83.78,83.78 0 0 0 -4,-8 44.15,44.15 0 0 0 -4.1,-5.94 c -0.21,-0.26 -0.43,-0.51 -0.65,-0.76 -5.33,-6.08 -10.76,-5.48 -15.71,1.79 a 52.38,52.38 0 0 0 -7.6,19 c -0.25,1.23 -0.48,2.5 -0.67,3.77 a 10.19,10.19 0 0 0 0,4.15 7.71,7.71 0 0 0 4.71,5.62 33.48,33.48 0 0 0 12.28,3.52 c 0.48,0 1,0.05 1.45,0.05 4,0 7.91,-1 12.72,-3.27 a 10,10 0 0 0 3.23,-2.2 c 1.88,-2.08 1.84,-5.27 1.63,-7.88 a 19.65,19.65 0 0 0 -0.39,-2.7 z"
     className="tooth replace"
     id="24" />
  <path
     d="m 197.55342,664.79274 c -0.26,2.61 -0.35,5.8 1.48,7.91 a 10.13,10.13 0 0 0 3.2,2.26 c 4.77,2.35 8.67,3.43 12.66,3.5 0.48,0 1,0 1.45,0 a 33.42,33.42 0 0 0 12.34,-3.3 7.72,7.72 0 0 0 4.81,-5.53 10.09,10.09 0 0 0 0.1,-4.15 c -0.17,-1.27 -0.37,-2.54 -0.6,-3.78 a 52.15,52.15 0 0 0 -7.24,-19.1 c -4.82,-7.36 -10.24,-8.06 -15.68,-2.08 -0.23,0.25 -0.45,0.49 -0.66,0.74 a 44.8,44.8 0 0 0 -4.2,5.87 81.47,81.47 0 0 0 -4.2,7.88 c -0.78,1.66 -1.46,3.37 -2.27,5 a 11,11 0 0 0 -0.76,2.13 19.86,19.86 0 0 0 -0.43,2.65 z"
     className="tooth replace"
     id="25" />
  <path
     d="m 157.19342,665.64274 c 4.7,7.08 11,10.71 18.9,10.86 a 40.47,40.47 0 0 0 14.85,-3 c 3.37,-0.9 5.34,-3.43 5.78,-7.51 a 157.59,157.59 0 0 0 -1.68,-16.17 l -0.05,-0.29 a 62.68,62.68 0 0 0 -1.37,-6.92 27.29,27.29 0 0 0 -1.2,-3.65 9.26,9.26 0 0 0 -1.94,-3 10.35,10.35 0 0 0 -12.31,-1.84 c -0.38,0.2 -0.76,0.41 -1.12,0.64 a 86.86,86.86 0 0 0 -19.2,19.18 l -0.07,0.12 c -1.92,4.7 -2.12,8.6 -0.59,11.58 z"
     className="tooth replace"
     id="26" />
  <path
     d="m 438.95342,264.49274 a 9,9 0 0 1 -3,-0.61 8.1,8.1 0 0 1 -3,-2.77 c -0.84,-1.15 -1.79,-2.24 -2.58,-3.42 -1.79,-2.64 -3.32,-5.69 -3.42,-8.94 a 9.86,9.86 0 0 1 0.24,-2.54 12.79,12.79 0 0 1 0.93,-2.48 c 0,0 1,-0.56 1.21,-0.67 a 25.44,25.44 0 0 0 4.55,-3.29 c -3,1.53 -6.05,3.83 -12.28,3.89 a 13.21,13.21 0 0 0 3.13,0.39 11.35,11.35 0 0 0 2.18,-0.22 c -3.09,7.59 2.49,14.93 8.13,21.26 0.24,0.27 -0.55,2.38 -0.66,2.75 a 27,27 0 0 1 -1.08,2.88 31.85,31.85 0 0 1 -3.13,5.35 c -5.74,-1.49 -16.49,-0.63 -16.5,0.15 a 50.78,50.78 0 0 1 16.61,1 35,35 0 0 1 12.47,5.68 10.35,10.35 0 0 0 -4.37,3.59 c 3.55,-3.3 8.39,-4.33 14.23,-3.61 a 34.05,34.05 0 0 0 -7.22,-0.6 4.14,4.14 0 0 1 -2.63,-0.72 36,36 0 0 0 -11.33,-5.2 27.38,27.38 0 0 0 4.83,-11.2 25.17,25.17 0 0 0 17.82,-3.69 25.55,25.55 0 0 0 4.78,-4 c -2.45,2.53 -10.57,7.94 -19.91,7.02 z"
     id="path15" />
  <path
     d="m 446.37064,321.3444 a 8.4041645,7.946109 0 0 1 -2.80139,-0.53857 7.5637481,7.1514981 0 0 1 -2.80139,-2.44564 c -0.78439,-1.01534 -1.67149,-1.9777 -2.40919,-3.01952 -1.6715,-2.33086 -3.10021,-5.02371 -3.19358,-7.89314 a 9.2072291,8.7054038 0 0 1 0.22411,-2.24256 11.943252,11.292304 0 0 1 0.86843,-2.1896 c 0,0 0.93379,-0.49442 1.12989,-0.59154 a 23.755772,22.461001 0 0 0 4.24877,-2.90475 c -2.80139,1.35084 -5.64946,3.38151 -11.46701,3.43449 a 12.335446,11.663122 0 0 0 2.92278,0.34433 10.598585,10.020926 0 0 0 2.03567,-0.19424 c -2.88543,6.70122 2.32516,13.18171 7.59177,18.77048 0.22411,0.23838 -0.51359,2.1013 -0.61631,2.42797 a 25.212494,23.838327 0 0 1 -1.0085,2.54276 29.741404,28.120397 0 0 1 -2.92278,4.72352 c -5.35999,-1.31552 -15.3983,-0.55623 -15.40764,0.13244 a 47.418164,44.833713 0 0 1 15.51036,0.8829 32.682862,30.901535 0 0 1 11.64443,5.01487 9.6647892,9.1380253 0 0 0 -4.08069,3.16962 c 3.31498,-2.91357 7.83455,-3.82296 13.28792,-3.18727 a 31.795756,30.062779 0 0 0 -6.74201,-0.52974 3.8659157,3.6552101 0 0 1 -2.45588,-0.63569 33.616658,31.784436 0 0 0 -10.57991,-4.59109 25.567336,24.173829 0 0 0 4.51024,-9.88849 23.503647,22.222618 0 0 0 16.64024,-3.2579 23.858489,22.55812 0 0 0 4.46355,-3.53161 c -2.2878,2.23374 -9.87023,7.01024 -18.59188,6.19797 z"
     id="path15-8"
    //  style="stroke-width:0.907992" 
     />
  <path
     d="m 3.8512905,323.11225 c 0.34551,-1.58922 0.80307,-3.15195 1.2046,-4.49396 a 10.99078,10.391745 0 0 0 0.32683,-2.16311 c 0,-0.34433 0,-0.70632 0.0934,-1.06831 a 27.453604,25.957289 0 0 0 -0.0467,-4.82947 21.850828,20.659883 0 0 1 0.24278,-6.5423 17.209861,16.271865 0 0 1 7.0034705,-8.94378 18.022264,17.039989 0 0 1 9.33796,-3.02835 9.1512014,8.6524298 0 0 1 1.37268,0.0883 c 9.71148,1.4303 20.07662,4.74117 31.69304,10.12687 3.99665,2.11896 5.92027,6.03021 5.71483,11.61015 0,1.32435 0,2.6487 0,3.94657 a 77.682494,73.448534 0 0 1 -0.98982,9.61479 25.389915,24.006078 0 0 1 -0.70968,2.71933 c -0.084,0.30019 -0.17743,0.60038 -0.27081,0.8829 a 10.327784,9.764885 0 0 0 -0.26146,1.88058 13.605409,12.863868 0 0 1 -0.22411,1.76581 18.078292,17.092963 0 0 1 -9.33796,11.71609 21.729434,20.545106 0 0 1 -9.82353,2.03067 h -1.31666 a 49.211052,46.528883 0 0 1 -11.10283,-1.99535 112.98932,106.83102 0 0 1 -14.6606,-5.09434 c -0.37352,-0.15892 -0.78439,-0.30902 -1.2046,-0.46794 -1.6621505,-0.61803 -3.5484205,-1.32435 -4.4822205,-2.7105 a 19.796476,18.717501 0 0 1 -2.65198,-5.80066 22.8033,21.560442 0 0 1 0.0934,-9.24398 z"
     className="tooth replace"
     id="1"
    //  style="stroke-width:0.907992" 
     />
  <path
     d="m 30.021251,321.42354 a 8.4041645,7.946109 0 0 0 2.80139,-0.53857 7.5637481,7.1514981 0 0 0 2.80139,-2.44564 c 0.78439,-1.01534 1.67149,-1.9777 2.40919,-3.01952 1.6715,-2.33086 3.10021,-5.02371 3.19358,-7.89314 a 9.2072291,8.7054038 0 0 0 -0.22411,-2.24256 11.943252,11.292304 0 0 0 -0.86843,-2.1896 c 0,0 -0.93379,-0.49442 -1.12989,-0.59154 a 23.755772,22.461001 0 0 1 -4.24877,-2.90475 c 2.80139,1.35084 5.64946,3.38151 11.46701,3.43449 a 12.335446,11.663122 0 0 1 -2.92278,0.34433 10.598585,10.020926 0 0 1 -2.03567,-0.19424 c 2.88543,6.70122 -2.32516,13.18171 -7.59177,18.77048 -0.22411,0.23838 0.51359,2.1013 0.61631,2.42797 a 25.212494,23.838327 0 0 0 1.0085,2.54276 29.741404,28.120397 0 0 0 2.92278,4.72352 c 5.35999,-1.31552 15.3983,-0.55623 15.40764,0.13244 a 47.418164,44.833713 0 0 0 -15.51036,0.8829 32.682862,30.901535 0 0 0 -11.64443,5.01487 9.6647892,9.1380253 0 0 1 4.08069,3.16962 c -3.31498,-2.91357 -7.83455,-3.82296 -13.28792,-3.18727 a 31.795756,30.062779 0 0 1 6.74201,-0.52974 3.8659157,3.6552101 0 0 0 2.45588,-0.63569 33.616658,31.784436 0 0 1 10.57991,-4.59109 25.567336,24.173829 0 0 1 -4.51024,-9.88849 23.503647,22.222618 0 0 1 -16.64024,-3.2579 23.858489,22.55812 0 0 1 -4.46355,-3.53161 c 2.2878,2.23374 9.87023,7.01024 18.59188,6.19797 z"
     id="path15-8-0"
    //  style="stroke-width:0.907992" 
     />
  <path
     d="m 0.57787242,393.22236 c 0.34551,1.58922 0.80306998,3.15195 1.20459998,4.49396 a 10.99078,10.391745 0 0 1 0.32683,2.16311 c 0,0.34433 0,0.70632 0.0934,1.06831 a 27.453604,25.957289 0 0 1 -0.0467,4.82947 21.850828,20.659883 0 0 0 0.24278,6.5423 17.209861,16.271865 0 0 0 7.00347,8.94378 18.022264,17.039989 0 0 0 9.3379606,3.02835 9.1512014,8.6524298 0 0 0 1.37268,-0.0883 c 9.71148,-1.4303 20.07662,-4.74117 31.69304,-10.12687 3.99665,-2.11896 5.92027,-6.03021 5.71483,-11.61015 0,-1.32435 0,-2.6487 0,-3.94657 a 77.682494,73.448534 0 0 0 -0.98982,-9.61479 25.389915,24.006078 0 0 0 -0.70968,-2.71933 c -0.084,-0.30019 -0.17743,-0.60038 -0.27081,-0.8829 a 10.327784,9.764885 0 0 1 -0.26146,-1.88058 13.605409,12.863868 0 0 0 -0.22411,-1.76581 18.078292,17.092963 0 0 0 -9.33796,-11.71609 21.729434,20.545106 0 0 0 -9.82353,-2.03067 h -1.31666 a 49.211052,46.528883 0 0 0 -11.10283,1.99535 112.98932,106.83102 0 0 0 -14.6606006,5.09434 c -0.37352,0.15892 -0.78439,0.30902 -1.2046,0.46794 -1.66215,0.61803 -3.54842,1.32435 -4.48222,2.7105 a 19.796476,18.717501 0 0 0 -2.65197998,5.80066 22.8033,21.560442 0 0 0 0.0934,9.24398 z"
     className="tooth replace"
     id="32"
    //  style="stroke-width:0.907992" 
     />
  <path
     d="m 26.747833,394.91107 a 8.4041645,7.946109 0 0 1 2.80139,0.53857 7.5637481,7.1514981 0 0 1 2.80139,2.44564 c 0.78439,1.01534 1.67149,1.9777 2.40919,3.01952 1.6715,2.33086 3.10021,5.02371 3.19358,7.89314 a 9.2072291,8.7054038 0 0 1 -0.22411,2.24256 11.943252,11.292304 0 0 1 -0.86843,2.1896 c 0,0 -0.93379,0.49442 -1.12989,0.59154 a 23.755772,22.461001 0 0 0 -4.24877,2.90475 c 2.80139,-1.35084 5.64946,-3.38151 11.46701,-3.43449 a 12.335446,11.663122 0 0 0 -2.92278,-0.34433 10.598585,10.020926 0 0 0 -2.03567,0.19424 c 2.88543,-6.70122 -2.32516,-13.18171 -7.59177,-18.77048 -0.22411,-0.23838 0.51359,-2.1013 0.61631,-2.42797 a 25.212494,23.838327 0 0 1 1.0085,-2.54276 29.741404,28.120397 0 0 1 2.92278,-4.72352 c 5.35999,1.31552 15.3983,0.55623 15.40764,-0.13244 a 47.418164,44.833713 0 0 1 -15.51036,-0.8829 32.682862,30.901535 0 0 1 -11.64443,-5.01487 9.6647892,9.1380253 0 0 0 4.08069,-3.16962 c -3.31498,2.91357 -7.83455,3.82296 -13.287921,3.18727 a 31.795756,30.062779 0 0 0 6.742011,0.52974 3.8659157,3.6552101 0 0 1 2.45588,0.63569 33.616658,31.784436 0 0 0 10.57991,4.59109 25.567336,24.173829 0 0 0 -4.51024,9.88849 23.503647,22.222618 0 0 0 -16.640241,3.2579 23.858489,22.55812 0 0 0 -4.4635496,3.53161 c 2.2877996,-2.23374 9.8702306,-7.01024 18.5918806,-6.19797 z"
     id="path15-8-0-5"
    //  style="stroke-width:0.907992" 
     />
  <path
     d="m 475.06982,394.39851 c -0.34551,1.58922 -0.80307,3.15195 -1.2046,4.49396 a 10.99078,10.391745 0 0 0 -0.32683,2.16311 c 0,0.34433 0,0.70632 -0.0934,1.06831 a 27.453604,25.957289 0 0 0 0.0467,4.82947 21.850828,20.659883 0 0 1 -0.24278,6.5423 17.209861,16.271865 0 0 1 -7.00347,8.94378 18.022264,17.039989 0 0 1 -9.33796,3.02835 9.1512014,8.6524298 0 0 1 -1.37268,-0.0883 c -9.71148,-1.4303 -20.07662,-4.74117 -31.69304,-10.12687 -3.99665,-2.11896 -5.92027,-6.03021 -5.71483,-11.61015 0,-1.32435 0,-2.6487 0,-3.94657 a 77.682494,73.448534 0 0 1 0.98982,-9.61479 25.389915,24.006078 0 0 1 0.70968,-2.71933 c 0.084,-0.30019 0.17743,-0.60038 0.27081,-0.8829 a 10.327784,9.764885 0 0 0 0.26146,-1.88058 13.605409,12.863868 0 0 1 0.22411,-1.76581 18.078292,17.092963 0 0 1 9.33796,-11.71609 21.729434,20.545106 0 0 1 9.82353,-2.03067 h 1.31666 a 49.211052,46.528883 0 0 1 11.10283,1.99535 112.98932,106.83102 0 0 1 14.6606,5.09434 c 0.37352,0.15892 0.78439,0.30902 1.2046,0.46794 1.66215,0.61803 3.54842,1.32435 4.48222,2.7105 a 19.796476,18.717501 0 0 1 2.65198,5.80066 22.8033,21.560442 0 0 1 -0.0934,9.24398 z"
     className="tooth replace"
     id="17"
    //  style="stroke-width:0.907992" 
     />
  <path
     d="m 448.89986,396.08722 a 8.4041645,7.946109 0 0 0 -2.80139,0.53857 7.5637481,7.1514981 0 0 0 -2.80139,2.44564 c -0.78439,1.01534 -1.67149,1.9777 -2.40919,3.01952 -1.6715,2.33086 -3.10021,5.02371 -3.19358,7.89314 a 9.2072291,8.7054038 0 0 0 0.22411,2.24256 11.943252,11.292304 0 0 0 0.86843,2.1896 c 0,0 0.93379,0.49442 1.12989,0.59154 a 23.755772,22.461001 0 0 1 4.24877,2.90475 c -2.80139,-1.35084 -5.64946,-3.38151 -11.46701,-3.43449 a 12.335446,11.663122 0 0 1 2.92278,-0.34433 10.598585,10.020926 0 0 1 2.03567,0.19424 c -2.88543,-6.70122 2.32516,-13.18171 7.59177,-18.77048 0.22411,-0.23838 -0.51359,-2.1013 -0.61631,-2.42797 a 25.212494,23.838327 0 0 0 -1.0085,-2.54276 29.741404,28.120397 0 0 0 -2.92278,-4.72352 c -5.35999,1.31552 -15.3983,0.55623 -15.40764,-0.13244 a 47.418164,44.833713 0 0 0 15.51036,-0.8829 32.682862,30.901535 0 0 0 11.64443,-5.01487 9.6647892,9.1380253 0 0 1 -4.08069,-3.16962 c 3.31498,2.91357 7.83455,3.82296 13.28792,3.18727 a 31.795756,30.062779 0 0 1 -6.74201,0.52974 3.8659157,3.6552101 0 0 0 -2.45588,0.63569 33.616658,31.784436 0 0 1 -10.57991,4.59109 25.567336,24.173829 0 0 1 4.51024,9.88849 23.503647,22.222618 0 0 1 16.64024,3.2579 23.858489,22.55812 0 0 1 4.46355,3.53161 c -2.2878,-2.23374 -9.87023,-7.01024 -18.59188,-6.19797 z"
     id="path15-8-0-5-0"
    //  style="stroke-width:0.907992" 
     />
  <path
     d="m 430.96342,222.74274 a 32.11,32.11 0 0 1 -13.51,-7.41 c 1.13,-1.33 1.43,-3.47 1.67,-5.17 0,-0.37 0.1,-0.73 0.15,-1 a 71.36,71.36 0 0 0 1,-9.22 3.39,3.39 0 0 0 0.93,0.12 h 0.52 a 67.76,67.76 0 0 0 7.66,-0.88 73.85,73.85 0 0 0 7.79,-1.79 80.7,80.7 0 0 0 7.85,-2.69 c 0.63,-0.25 1.25,-0.53 1.88,-0.77 -0.64,0.15 -1.32,0.2 -2,0.32 -0.68,0.12 -1.34,0.26 -2,0.41 -1.33,0.29 -2.65,0.64 -3.95,1 -2.18,0.67 -4.32,1.42 -6.55,1.95 a 45.46,45.46 0 0 1 -5.68,0.94 c -0.79,0.08 -1.58,0.15 -2.38,0.21 -0.8,0.06 -1.81,0.17 -2.71,0.17 a 2.47,2.47 0 0 1 -1.4,-0.18 2.76,2.76 0 0 1 -0.85,-1.27 l -0.08,-0.19 a 11.76,11.76 0 0 0 -3.21,-4.19 22.23,22.23 0 0 0 -2.39,-1.66 22.67,22.67 0 0 1 -2,-1.38 35.55,35.55 0 0 1 2.32,-14 2.34,2.34 0 0 1 1.14,-1.2 c 0.53,-0.26 1.05,-0.53 1.56,-0.84 a 10.93,10.93 0 0 0 1.38,-1.08 23.55,23.55 0 0 1 -9.3,2.65 9.94,9.94 0 0 0 2.49,0.26 8.24,8.24 0 0 0 2.12,-0.31 c -0.1,0 -0.29,0.72 -0.34,0.83 l -0.33,0.89 c -0.21,0.59 -0.41,1.19 -0.59,1.79 a 36,36 0 0 0 -0.89,3.72 c -0.2,1 -0.34,2.07 -0.45,3.11 0,0.53 -0.09,1.05 -0.13,1.58 0,0.26 0,0.53 0,0.79 a 4.44,4.44 0 0 1 0,0.82 3.36,3.36 0 0 1 -0.89,-0.71 7.39,7.39 0 0 1 -0.82,-0.86 17.77,17.77 0 0 1 -1.82,-3.06 24.3,24.3 0 0 0 -2.12,-3.2 q -0.3,-0.41 -0.63,-0.78 a 7.71,7.71 0 0 0 0.55,1.79 8.61,8.61 0 0 0 0.57,1.28 c 0.34,0.6 0.73,1.56 1.17,2.38 a 12.14,12.14 0 0 0 1.43,2.32 25.76,25.76 0 0 0 3.62,3.15 c 0.48,0.33 1,0.64 1.48,1 a 22.35,22.35 0 0 1 2.28,1.57 10.71,10.71 0 0 1 2.9,3.8 l 0.08,0.19 a 4.7,4.7 0 0 0 0.85,1.41 h -0.06 a 69.09,69.09 0 0 1 -1,9.61 c -0.06,0.33 -0.11,0.69 -0.17,1.08 -0.31,2.22 -0.69,5 -2.75,5.41 l -1.3,0.27 c -4.52,1 -6.9,1.81 -11.5,1.14 l -4,-0.48 a 21.54,21.54 0 0 0 6.8,1.67 43.41,43.41 0 0 0 8.88,-1.26 l 1.29,-0.27 a 3.44,3.44 0 0 0 1.11,-0.44 c 3.71,3.35 8.59,5.85 14.85,7.65 a 37.93,37.93 0 0 1 -4.79,1.77 l -3,1.2 a 29.38,29.38 0 0 0 6.06,-1.7 30.44,30.44 0 0 0 5.87,-2.95 16.72,16.72 0 0 0 4.35,-3.86 c 0.09,-0.12 0.38,-0.42 0.34,-0.55 a 5.24,5.24 0 0 0 -1.41,1.12 c -0.53,0.48 -1,0.78 -1.46,1.17 a 32,32 0 0 1 -3,2.08 7.53,7.53 0 0 1 -1.36,0.65 3.63,3.63 0 0 1 -2.12,0.08 z"
     id="path16" />
  <path
     d="m 404.47342,151.80274 c 0.1,-4.24 -1.89,-7.91 -5.91,-10.94 a 33.34,33.34 0 0 0 10.43,-11.13 l -1.76,1.89 c -6.31,7.34 -10.29,10.42 -19.24,12.14 l -2.86,0.36 c 0.63,0 1.25,0.08 1.87,0.08 a 21.43,21.43 0 0 0 10.53,-2.72 c 4.15,3 6.05,6.49 5.81,10.71 a 17.79,17.79 0 0 0 -8.5,7.41 l 2.22,-2 a 20.77,20.77 0 0 1 7.09,-4.84 c 0,0 0.27,-0.05 0.27,-0.09 3.13,-1.09 6.7,-1.14 11.87,-0.44 a 6.74,6.74 0 0 0 1,0.08 h 2.31 c -5.94,-1.66 -10.95,-1.84 -15.13,-0.51 z"
     id="path17" />
  <path
     d="m 383.22342,112.60274 c 0.42,-6 -2.6,-10.79 -9,-14.390004 a 43.45,43.45 0 0 0 12.25,-9.86 l -2.6,1.83 c -7.52,5.87 -12.44,8.77 -21.42,11.420004 l -1.23,0.75 a 37.68,37.68 0 0 0 11.83,-3.540004 c 6.72,3.570004 9.67,8.260004 9,14.300004 a 19.79,19.79 0 0 0 -7.81,7 l 2,-1.9 c 6.34,-5.37 11.49,-6 20.26,-5.81 l 1.61,-0.16 c -5.81,-1.4 -10.74,-1.24 -14.89,0.36 z"
     id="path18" />
  <path
     d="m 364.75342,51.002736 c -3.81,-4.85 -9.45,-7.14 -16.86,-6.67 l 0.15,-0.34 c 7.83,-0.78 12.81,1 16.66,6.51 z"
     id="path19" />
  <path
     d="m 373.42342,71.062736 -0.46,0.85 c 1.19,-5.56 0,-11.35 -3.79,-17.6 l 0.63,0.23 c 4.07,6.52 5.02,10.85 3.62,16.52 z"
     id="path20" />
  <path
     d="m 306.88342,23.902736 c 11.11,1.59 19.67,6.1 25.47,13.89 -5.41,-9.23 -14.14,-13.69 -25.47,-13.89 z"
     id="path21" />
  <path
     d="m 245.93342,14.752736 1.09,-0.33 c 14,-3.6 28.68,-1.77 42.83,5.43 l -0.64,-0.49 c -14.46,-9.36 -29.14,-10.5199999 -43.28,-4.61 z"
     id="path22" />
  <path
     d="m 130.87342,659.91274 a 18.84,18.84 0 0 1 -9.41,-7.62 28.72,28.72 0 0 1 -2.86,-5.49 l -0.06,-0.13 a 20.78,20.78 0 0 1 -1.74,-6.33 9.23,9.23 0 0 1 1,-3.82 17.7,17.7 0 0 1 4.77,-6.62 c 7.09,-5.88 16,-10 26.68,-12.39 6.28,-0.24 9.89,3.52 10.82,11.13 a 67.38,67.38 0 0 1 -1.1,20.38 c -0.74,4.7 -2.91,7.71 -6.66,9.2 a 40.57,40.57 0 0 1 -12,2.47 c -1.1,0.06 -2.39,0.12 -3.69,0.1 a 18.57,18.57 0 0 1 -5.75,-0.88 z"
     className="tooth replace"
     id="27" />
  <path
     d="m 96.633423,630.83274 a 28.51,28.51 0 0 1 -7.73,-4.38 16.43,16.43 0 0 1 -6.24,-8.92 c -1.55,-6 1.14,-11.62 4,-16.36 2.26,-3.76 6.28,-6.58 12.29,-8.61 a 49.71,49.71 0 0 1 16.999997,-2.72 h 0.34 c 4.44,0.12 10.78,0.82 14.55,5.59 3.18,4 2.68,9.19 1.88,13.25 -3.22,16.48 -11.24,24.72 -23.83,24.49 a 41,41 0 0 1 -12.259997,-2.34 z"
     className="tooth replace"
     id="28" />
  <path
     d="m 84.563423,595.21274 a 45.89,45.89 0 0 1 -12.25,-1.76 c -3.55,-1 -7.22,-4.11 -8.63,-5.4 a 16.27,16.27 0 0 1 -3.94,-5.46 19.19,19.19 0 0 1 0.53,-15.57 24,24 0 0 1 11.14,-11.58 c 6.25,-2.89 13,-5.67 19.92,-6.36 a 24.17,24.17 0 0 1 16.469997,4 24.48,24.48 0 0 1 9.91,16.4 14.56,14.56 0 0 1 -3.66,11.81 v 0 c -8.51,9.26 -18.399997,13.92 -29.489997,13.92 z"
     className="tooth replace"
     id="29" />
  <path
     d="m 34.753423,531.61274 a 66.06,66.06 0 0 0 7,10.59 c 3.37,4.1 7.14,8.26 11.8,10.92 a 16.49,16.49 0 0 0 7.66,2.34 h 0.13 a 24,24 0 0 0 6.62,-1.12 c 0.69,-0.19 1.37,-0.37 2,-0.53 a 80.47,80.47 0 0 0 9.49,-2.81 c 5.86,-2.16 11,-5.12 16.45,-8.25 l 0.74,-0.43 c 7.329997,-4.21 8.929997,-13.94 6.219997,-20.53 -1,-2.41 -1.94,-5.14 -2.939997,-8 -3.07,-8.89 -6.55,-19 -13.3,-25.39 l -0.28,-0.22 -0.1,-0.07 c -4.47,-3.43 -11.28,-4.82 -16.21,-5.38 a 41.55,41.55 0 0 0 -18.37,2.17 44.22,44.22 0 0 0 -8.42,4 c -2.34,1.44 -5.25,3.23 -7,5.75 -0.31,0.46 -0.64,0.94 -0.93,1.46 -1.46,2.65 -1.63,5.54 -1.8,8.34 -0.05,0.85 -0.1,1.71 -0.19,2.57 -0.23,2.21 -0.46,4.42 -0.73,6.62 -0.11,0.92 -0.29,1.86 -0.47,2.76 a 27.27,27.27 0 0 0 -0.58,3.76 c -0.24,4.19 1.09,7.62 3.21,11.45 z"
     className="tooth replace"
     id="30" />
  <path
     d="m 39.073423,486.82274 a 21.06,21.06 0 0 1 -9,-1.86 c -5.66,-2.69 -8.49,-8.39 -11.22,-13.91 -0.5,-1 -1,-2 -1.51,-3 -0.79,-1.51 -1.72,-3 -2.63,-4.46 -1.82,-2.92 -3.71,-5.94 -4.58,-9.32 -1.0000005,-4 -1.7700005,-9.87 0.56,-15.45 2.64,-6.3 8.61,-11.18 18.27,-14.91 9.66,-3.73 17.59,-4.44 24.3,-2.17 a 28.52,28.52 0 0 1 13.23,9.94 c 2.17,2.81 3.57,6.5 4.93,10.08 0.43,1.13 0.86,2.25 1.29,3.3 0.61,1.46 1.31,2.8 2,4.1 a 29.53,29.53 0 0 1 3,7.34 h 0.13 c 1.43,4.08 1.79,7.4 1.11,10.14 a 15.67,15.67 0 0 1 -5.28,8.12 c -3.63,3 -8.13,4.6 -12.48,6.16 l -1.57,0.57 -2.8,1 a 76.33,76.33 0 0 1 -11.6,3.67 31,31 0 0 1 -6.15,0.66 z"
     className="tooth replace"
     id="31" />
  <path
     d="m 40.053423,429.41274 a 8.71,8.71 0 0 0 5.32,-1.78 20,20 0 0 1 -9.16,0.86 9.71,9.71 0 0 0 3.84,0.92 z"
     id="path23" />
  <path
     d="m 62.073423,474.59274 a 21.4,21.4 0 0 0 -7.86,1.18 22.47,22.47 0 0 0 -6.84,4 c 2.1,-1.77 11.63,-5.17 14.7,-5.18 z"
     id="path24" />
  <path
     d="m 55.463423,476.18274 c 0.72,-6.23 -1.51,-12 -6.62,-17.14 l -0.78,0.77 c 4.86,4.9 7,10.37 6.31,16.24 z"
     id="path25" />
  <path
     d="m 23.523423,465.71274 c 9.52,0 18,-2 25.21,-6.15 l -0.55,-1 c -8.67,5.53 -18.95,6.61 -24.66,7.15 z"
     id="path26" />
  <path
     d="m 48.523423,459.78274 a 6.47,6.47 0 0 0 1.23,-6.52 c 5.77,0.89 11.79,-0.34 18.86,-3.85 -4,1.65 -13.56,4.82 -19.59,2.61 l -1,-0.2 0.39,0.94 c 1,2.5 0.78,4.55 -0.72,6.3 z"
     id="path27" />
  <path
     d="m 48.393423,452.72274 1.05,-0.33 a 23.66,23.66 0 0 0 -9,-12.68 l -0.19,-0.13 h -0.22 c -8.46,2.08 -17.9,0.51 -19.07,0.38 a 46.6,46.6 0 0 0 19,0.74 22.67,22.67 0 0 1 8.43,12.02 z"
     id="path28" />
  <path
     d="m 40.693423,440.08274 c 1.59,-2.95 2,-6.64 1.15,-11.29 l -1.09,0.21 c 0.77,4.41 0.43,7.87 -1,10.59 z"
     id="path29" />
  <path
     d="m 50.433423,533.84274 -1.08,0.52 c -0.32,0.08 0.12,-0.14 1.08,-0.52 z"
     id="path30" />
  <path
     d="m 62.683423,506.58274 a 17.64,17.64 0 0 0 1.49,-11.84 0.72,0.72 0 0 0 -0.83,-0.55 21.43,21.43 0 0 1 -4.12,0.29 c -1,0 -2.06,-0.09 -3.18,-0.22 a 40,40 0 0 0 14.64,-3.66 12,12 0 0 1 -5,3 0.71,0.71 0 0 0 -0.48,0.83 18.68,18.68 0 0 1 -1.57,12.62 25.41,25.41 0 0 1 10.26,10.52 v 0 0 0.06 a 33.74,33.74 0 0 0 19.9,-3.87 c -4.23,3.49 -10.33,5.18 -18.15,5 l -1.43,-0.06 a 13.25,13.25 0 0 1 -0.86,10.26 c 0.32,0.13 0.64,0.26 0.95,0.42 3.51,1.88 5.67,5.75 6.62,11.79 a 19.45,19.45 0 0 1 8,0 38.86,38.86 0 0 0 -17.17,4.56 23.57,23.57 0 0 1 8.15,-4.22 c -0.58,-5.95 -2.81,-9.1 -6.07,-11.08 -5.16,-3.12 -19.25,1.73 -23.43,3.41 8,-3.81 16,-6.85 21.93,-5.16 1.69,-2.95 1.93,-6.41 0.67,-10.3 l -0.1,-0.32 c -5.23,-13.17 -23.62,-13.51 -30,-13.57 7.85,-0.76 14.43,0.12 19.78,2.09 z"
     id="path31" />
  <path
     d="m 96.453423,564.19274 c -1.68,-2.43 -4.38,-4 -8,-4.63 -2.68,2 -7.48,3.51 -13.6,5.06 7.53,-2.66 13.73,-5.47 16,-8.76 a 4.21,4.21 0 0 1 -1.31,2.79 12.44,12.44 0 0 1 7.85,4.92 c 0.13,0.18 0.23,0.39 0.35,0.59 1.66,-2.23 4.309997,-3.52 7.519997,-4.29 a 15.34,15.34 0 0 0 -6.579997,4.73 1.1,1.1 0 0 0 -0.12,1.11 c 1.519997,3.54 1.699997,8.29 0.6,14.37 a 25.88,25.88 0 0 1 7.609997,-1 h 0.35 a 65.73,65.73 0 0 0 -19.079997,6.83 34.73,34.73 0 0 1 9.94,-5.44 c 1.37,-7.32 0.88,-12.8 -1.53,-16.28 z"
     id="path32" />
  <path
     d="m 121.53342,611.83274 c -1.9,-6.7 -5.82,-10.31 -12,-11 a 1.59,1.59 0 0 0 -1.13,0.35 c -2.59,2 -7.45,3.27 -11.999997,4.27 0,0 9.749997,-3.51 11.879997,-5.64 a 11.34,11.34 0 0 0 1.78,-3.65 3.78,3.78 0 0 1 0,3 0.55,0.55 0 0 0 0.43,0.74 c 5.85,1 9.81,4.63 11.81,10.95 a 0.62,0.62 0 0 0 0.91,0.37 6.75,6.75 0 0 1 3.18,-1.06 42.12,42.12 0 0 0 -10.95,12.15 c 1.87,-4.31 3.78,-7.45 5.75,-9.45 a 1,1 0 0 0 0.34,-1.03 z"
     id="path33" />
  <path
     d="m 150.37342,654.05274 a 50.19,50.19 0 0 1 -27,-16.77 c 5.09,8.81 14.16,14.46 27,16.77 z"
     id="path34" />
  <path
     d="m 161.25342,659.00274 a 110.51,110.51 0 0 0 27.12,8.78 h -0.12 c -10.44,-0.16 -19.5,-3.12 -27,-8.78 z"
     id="path35" />
  <path
     d="m 228.28342,666.47274 a 33.16,33.16 0 0 1 -12.92,2.64 23.71,23.71 0 0 1 -11.39,-3.1 49.43,49.43 0 0 0 24.31,0.46 z"
     id="path36" />
  <path
     d="m 434.06342,430.10274 a 8.65,8.65 0 0 1 -5.28,-1.87 20.05,20.05 0 0 0 9.14,1 9.86,9.86 0 0 1 -3.86,0.87 z"
     id="path37" />
  <path
     d="m 411.23342,474.88274 a 21.27,21.27 0 0 1 7.83,1.32 22.4,22.4 0 0 1 6.76,4.11 c -2.07,-1.84 -11.52,-5.31 -14.59,-5.43 z"
     id="path38" />
  <path
     d="m 417.80342,476.59274 c -0.6,-6.24 1.73,-12 6.94,-17 l 0.76,0.79 c -5,4.81 -7.17,10.23 -6.6,16.12 z"
     id="path39" />
  <path
     d="m 449.93342,466.70274 c -9.52,-0.15 -18,-2.37 -25.09,-6.61 l 0.56,-0.94 c 8.57,5.64 18.83,6.9 24.53,7.55 z"
     id="path40" />
  <path
     d="m 425.04342,460.31274 a 6.45,6.45 0 0 1 -1.11,-6.53 c -5.79,0.78 -11.79,-0.55 -18.79,-4.19 4,1.72 13.47,5.06 19.54,3 l 1,-0.18 -0.41,0.94 c -1.07,2.47 -0.87,4.53 0.61,6.3 z"
     id="path41" />
  <path
     d="m 425.30342,453.27274 -1,-0.36 a 23.68,23.68 0 0 1 9.22,-12.52 l 0.18,-0.12 h 0.22 c 8.43,2.24 17.9,0.84 19.07,0.73 a 46.58,46.58 0 0 1 -19.05,0.39 22.63,22.63 0 0 0 -8.64,11.88 z"
     id="path42" />
  <path
     d="m 433.22342,440.76274 c -1.53,-3 -1.84,-6.67 -0.94,-11.31 l 1.08,0.21 c -0.85,4.39 -0.57,7.85 0.84,10.59 z"
     id="path43" />
  <path
     d="m 241.57342,663.72274 a 33.06,33.06 0 0 0 12.86,2.87 23.64,23.64 0 0 0 11.45,-2.9 49.27,49.27 0 0 1 -24.31,0.03 z"
     id="path44" />
</svg>










                    </div>
                </div>
                <div className="row form-group text-center justify-content-center mt-5">
                    <div className= "col-8 col-lg-4">
                        <label  htmlFor="model"><h5>3D Model</h5></label>
                        <input className="form-select" id="model"  readOnly style={{borderRadius: "1rem", minHeight:"40px"}} value={model3D} aria-label="model">

                        </input>
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
                        <button className="btn btn-primary" onClick={(e)=>{e.preventDefault(); fetchFiles()}}>Download Scans/Photos</button>
                        
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
                {/* <div className="row form-group justify-content-center mt-3 no-print">
                    <div className="text-center col-8 col-lg-4 pt-3">
                    <button className="btn btn-primary" onClick={(e)=>{e.preventDefault(); updateCase(); window.location.href = `/admin/${id}`}}>Update Case</button>
                    </div>
                </div> */}
                <div className="row form-group justify-content-center mt-3 no-print">
                    <div className="text-center col-8 col-lg-4 pt-3">
                    <button className="btn btn-primary" onClick={(e)=>{e.preventDefault(); setShippingStart(true)}}>Shipping Label</button>
                    </div>
                </div>
                {(shippingStart && cases)?
                <div className="row form-group justify-content-center no-print">
                    <div className="col-4 text-center justify-content-center no-print">
                    Select All Cases Being Shipped
                    {cases.map((item, index) => {
                        const backgroundColor = colorMap[item["id"]] || 'lightgray';
                        return (
                            <div key={index} className="row form-group justify-content-center no-print" style={{backgroundColor, margin: "auto", width: "100px"}} onClick={()=>{handleSelectedCasesColor(item["id"])}}>{item["id"]}
                            </div>
                    )})}
                    <button className="btn btn-primary no-print" onClick={(e)=>{e.preventDefault(); setShippingStart(false); setShippingRates(true)}}>
                        Submit
                    </button>
                    </div>
                </div>
                :""}
                {(shippingRates)?
                <>
                <div className="row form-group justify-content-center mt-3 no-print">
                    <div className="text-center col-8 col-lg-4 pt-3">
                    <button className="btn btn-primary" onClick={(e)=>{e.preventDefault(); shippoTest2()}}>Get Rates</button>
                    </div>
                </div>
                <div className="row justify-content-center mt-3">
                    {rates.map((item, index) => {
                        return (
                            <div className="col-2" style={{border: "black 1px solid"}}key={index} onClick={()=> {console.log(item); getLabel(item); setShippingRates(false)}}>
                                <div>{item.amount}</div>
                                <div>{item.provider}</div>
                                <div>{item.servicelevel.name}</div>
                            </div>
                            
                    )})}
                </div>
                </>
                :""}
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
