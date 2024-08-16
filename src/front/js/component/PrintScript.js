import React from 'react';
import KPDWIZ from '../../img/KPDWIZ.jpg'

const imageUrl = '/KPDWIZ.jpg';


export const PrintPDFButton = (props) => {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <html>
            <head>
                <title>Print</title>
                <style>
                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                        }
                        /* Add any specific styles for print here */
                    }
                        .case {
                        text-size: 20px;
                        }
                    
                        .text-center {
                        text-align: center;}

                        .text-left {
                        text-align: left}

                        .text-right{
                        text-align: right}

                        .info-data{
                        margin-top: 10px}
                </style>
            </head>
            <body>
                <div class="text-center">
                    <img src="${imageUrl}" alt="Dynamic Image"  />
                <div>
                <div class= "text-center case info-data"><strong>Case # ${props.caseNumber}</strong></div>
                <div class = "text-left">
                    <div>
                        Doctor Name: ${props.doctorFirst} ${props.doctorLast}
                    </div>
                    <div>
                        Product Type: ${props.type}
                    </div>
                </div>
                <div class = "text-right">
                    <div>
                        Patient Name: ${props.patientName}
                    </div>
                    <div>
                        Product: ${props.product}
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

