import React from 'react';
import KPDWIZ from '../../img/KPDWIZ.jpg'

const imageUrl = '../../../../public/KPDWIZ.jpg';

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
                </style>
            </head>
            <body>
                <img src="${imageUrl}" alt="Dynamic Image"/>
                <p>More content here...</p>
                <!-- Optionally add more content or load it dynamically -->
            </body>
            </html>
        `;
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus(); // Required for IE
        printWindow.print();
    };

    return (
        <button className="theme-btn" onClick={handlePrint}>Print PDF</button>
    );
};

