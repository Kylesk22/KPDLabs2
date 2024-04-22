import React, { useEffect, useState } from "react";

export const ContactUs = props => {
    
    function sendEmail() {
        var recipient = "kpdlabs@kpdlabs.com";
        var subject = "Feedback";
    
        window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject);
    }
    return(
        <div>
            <div className="row justify-content-center text-center">
                <div className="col-3">
                
                <button className = "btn btn-primary" onClick={()=>sendEmail()}>Send Feedback Email</button>
                </div>            
            </div>
        </div>

    )}