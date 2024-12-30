import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { useAppSelector } from '../store/hooks/hooks';
import { jsPDF } from 'jspdf';

function QRCodeGenerator() {
    const { kitchenId } = useAppSelector((state) => state.auth);
    const qrCodeRef = useRef<HTMLDivElement>(null);

    const downloadAsPDF = () => {
        if (qrCodeRef.current) {
            const svg = qrCodeRef.current.querySelector("svg");
            if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Set canvas size
                canvas.width = 256; // Adjust size if needed
                canvas.height = 256;

                // Create an image from the SVG
                const img = new Image();
                const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                const url = URL.createObjectURL(svgBlob);

                img.onload = () => {
                    if (ctx) {
                        // Fill the canvas with a white background
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        // Draw the QR code image on the canvas
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        // Convert canvas to a data URL (PNG format)
                        const pngUrl = canvas.toDataURL("image/png");

                        // Create a PDF using jsPDF
                        const pdf = new jsPDF();
                        pdf.addImage(pngUrl, "PNG", 10, 10, 190, 190); // Adjust position/size if needed
                        pdf.save("qr-code.pdf");

                        // Cleanup
                        URL.revokeObjectURL(url);
                    }
                };
                img.src = url;
            } else {
                console.error("QR Code SVG not found.");
            }
        }
    };

    return (
        <div className="QRCodeGenerator">
            <center>
                {kitchenId && (
                    <div ref={qrCodeRef}>
                        <QRCode
                            value={`https://canteen-mauve.vercel.app/${kitchenId}`}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                        />
                    </div>
                )}
                {kitchenId && (
                    <button
                        onClick={downloadAsPDF}
                        style={{
                            marginTop: "20px",
                            padding: "10px 20px",
                            fontSize: "16px",
                            cursor: "pointer",
                            borderRadius: "5px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                        }}
                    >
                        Download as PDF
                    </button>
                )}
            </center>
        </div>
    );
}

export default QRCodeGenerator;