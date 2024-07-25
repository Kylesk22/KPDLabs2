import React from 'react';
import html2canvas from 'html2canvas';

const PrintScreenButton = () => {
  const handlePrint = () => {
    // Capture the entire body or a specific element
    html2canvas(document.body)  // You can replace document.body with a specific element like document.getElementById('capture')
      .then((canvas) => {
        // Create an image URL from the canvas
        const imgData = canvas.toDataURL('image/png');

        // Open the image in a new window (or print directly if you prefer)
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Print</title></head><body>');
        printWindow.document.write('<img src="' + imgData + '" />');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      })
      .catch((err) => {
        console.error('Error capturing screen:', err);
      });
  };

  return (
    <button onClick={handlePrint}>
      Print Screen
    </button>
  );
};

export default PrintScreenButton;
