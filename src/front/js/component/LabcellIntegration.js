import { useEffect } from "react";
const LabCellIntegration = () => {
 
    const script = document.createElement("script");
    script.src = "//labcellcrm.com/labcell/LabCellCode/?id=kpdlabs@kpdlabs.com";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      // Optional cleanup if needed
      document.body.removeChild(script);
    };


};
export default LabCellIntegration;