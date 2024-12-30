import React, { useEffect } from "react";
import { Box } from "@mui/material";

const GoogleTranslate: React.FC = () => {

    useEffect(() => {
        const scriptId = "google-translate-script";

        // Check if the script already exists
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.type = "text/javascript";
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;

            // Define the global function if it doesn't exist
            if (!(window as any).googleTranslateElementInit) {
                (window as any).googleTranslateElementInit = () => {
                    if (!document.getElementById("google_translate_element_initialized")) {
                        const element = document.getElementById("google_translate_element");
                        if (element) {
                            element.setAttribute("id", "google_translate_element_initialized");
                            new (window as any).google.translate.TranslateElement(
                                {
                                    pageLanguage: "en",
                                    includedLanguages: "en,as,bn,gu,hi,kn,ml,mr,or,pa,ta,te,ur",
                                    autoDisplay: false,
                                },
                                "google_translate_element_initialized"
                            );
                        }
                    }
                };
            }

            // Append the script to the document body
            document.body.appendChild(script);
        }

        return () => {
            // Cleanup if necessary (optional for single-page apps)
        };
    }, []);

    return (<Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
        <div id="google_translate_element"></div>
    </Box>)
};

export default GoogleTranslate;