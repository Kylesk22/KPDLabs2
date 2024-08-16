import React from 'react';
import KPDWIZ from '../../img/KPDWIZ.jpg'

const imageUrl = KPDWIZ; // Use the imported image URL

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
                    }
                    .case {
                        font-size: 20px; /* Use 'font-size' instead of 'text-size' */
                    }
                    .text-center {
                        text-align: center;
                    }
                    .text-left {
                        text-align: left;
                    }
                    .text-right {
                        text-align: right;
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
                        <div>Doctor Name: ${props.doctorFirst} ${props.doctorLast}</div>
                        <div>Product Type: ${props.type}</div>
                    </div>
                    <div class="text-right">
                        <div>Patient Name: ${props.patientName}</div>
                        <div>Product: ${props.product}</div>
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

