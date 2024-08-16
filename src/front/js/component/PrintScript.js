import React from 'react';
import KPDWIZ from '../../img/KPDWIZ.jpg'

const imageUrl = KPDWIZ; // Use the imported image URL

export const PrintPDFButton = (props) => {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <html>
            <head>
                
                <style>
                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                        }
                    }
                    .case {
                        font-size: 25px; 
                    }
                    .text-center {
                        text-align: center;
                        
                    }
                    .text-left {
                        text-align: left;
                        font-size: 20px;
                    }
                    .text-right {
                        text-align: right;
                        font-size: 20px;
                    }
                    .info-data {
                        margin-top: 10px;
                    }
                    .inline-container {
                        display: flex;
                        justify-content: space-between; /* Distributes space between items */
                        margin-top: 10px; /* Adjust as needed */
                    }
                </style>
            </head>
            <body>
                <div class="text-center">
                    <img src="${imageUrl}" alt="Dynamic Image" />
                </div>
                <div class="text-center case info-data">
                    <strong>Case # ${props.caseNumber}</strong>
                </div>
                <div class="inline-container">
                    <div class="text-left">
                        <div class="info-data">Doctor Name: ${props.doctorFirst} ${props.doctorLast}</div>
                        <div class="info-data">Product Type: ${props.type}</div>
                    </div>
                    <div class="text-right">
                        <div class="info-data">Patient Name: ${props.patientName}</div>
                        <div class="info-data">Product: ${props.product}</div>
                    </div>
                </div>
                <!-- Optionally add more content or load it dynamically -->
            </body>
            </html>
        `;
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus(); // Required for IE
        // printWindow.print();
    };

    return (
        <button className="theme-btn" onClick={handlePrint}>Print PDF</button>
    );
};

