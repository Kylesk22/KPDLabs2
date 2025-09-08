import { useEffect } from "react";
const LabCellIntegration = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//labcellcrm.com/labcell/LabCellCode/?id=kpdlabs@kpdlabs.com";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      // Optional cleanup if needed
      document.body.removeChild(script);
    };
  }, []);
  return null; // No UI component; it's just loading the script
};
export default LabCellIntegration;