import { useState, useEffect } from "react";

/**
 * Hook that detects if the current device is mobile based on screen width
 * @param breakpoint The width threshold to consider mobile (default: 768px)
 * @returns Boolean indicating if the device is mobile
 */
export function useMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Function to update state based on window size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Add event listener
    window.addEventListener("resize", checkMobile);
    
    // Initial check
    checkMobile();
    
    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);
  
  return isMobile;
}
