import React, { useRef, useState, useEffect } from 'react';
import { Text, SafeAreaView, View, Button, TouchableOpacity, ImageBackground, Alert, ActivityIndicator,ScrollView } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB, REALTIME_DB, FIREBASE_STORAGE  } from '../../../backend/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import QRCode from 'react-native-qrcode-svg';
function ShareData({ route,navigation }) {
    const [userData, setUserData] = useState(null);
    const [pdfURL, setPdfURL] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            const user = FIREBASE_AUTH.currentUser;
            if(user){
                console.log(user.uid,"test2")
            }
            const docRef = doc(FIRESTORE_DB, "patientDetails", user?.uid); // Update with your Firebase path
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            } else {
                console.log("No such document!");
            }
        };
        fetchData();
    }, []);
    
    const createPDF = async () => {
        const pdfDoc = await PDFDocument.create();
        const pageWidth = 600;
        const pageHeight = 800;
        const margin = 20;
        const { age, allergies, bloodSugar, patientName, height, weight } = userData;
    
        // Helper to add a new page
        const addPage = () => pdfDoc.addPage([pageWidth, pageHeight]);
    
        // Add a new page for content
        let page = addPage();
        const titleFontSize = 24;
        const sectionFontSize = 16;
        const textFontSize = 12;
        const rowHeight = 20;
    
        // Helper to add a bordered section with curved corners
        const drawCurvedBorder = (page, x, y, width, height, borderColor, borderWidth, radius) => {
            page.drawRectangle({
                x,
                y,
                width,
                height,
                borderColor,
                borderWidth,
                borderRadius: radius,
            });
        };
    
        // Title
        let yPosition = pageHeight - margin - titleFontSize;
        page.drawText('Medical Report', {
            x: pageWidth / 2 - 80,
            y: yPosition,
            size: titleFontSize,
            color: rgb(0, 0, 0),
        });
    
        yPosition -= titleFontSize + margin;
    
        // Patient Information Section
        const infoBoxHeight = 140;
        const infoBoxWidth = pageWidth - 2 * margin;
    
        drawCurvedBorder(
            page,
            margin,
            yPosition - infoBoxHeight,
            infoBoxWidth,
            infoBoxHeight,
            rgb(0.5, 0.5, 0.5),
            2,
            10
        );
    
        page.drawText('Patient Information', {
            x: margin + 10,
            y: yPosition - 20,
            size: sectionFontSize,
            color: rgb(0, 0, 0),
        });
    
        page.drawText(`Name: ${patientName || 'N/A'}`, {
            x: margin + 10,
            y: yPosition - 40,
            size: textFontSize,
        });
        page.drawText(`Age: ${age || 'N/A'}`, {
            x: margin + 10,
            y: yPosition - 60,
            size: textFontSize,
        });
        page.drawText(`Height: ${height || 'N/A'} cm`, {
            x: margin + 10,
            y: yPosition - 80,
            size: textFontSize,
        });
        page.drawText(`Weight: ${weight || 'N/A'} kg`, {
            x: margin + 10,
            y: yPosition - 100,
            size: textFontSize,
        });
        page.drawText(`Allergies: ${allergies || 'None'}`, {
            x: margin + 10,
            y: yPosition - 120,
            size: textFontSize,
        });
    
        yPosition -= infoBoxHeight + margin;
    
        // Blood Sugar Readings Section
        page.drawText('Blood Sugar Readings', {
            x: margin + 10,
            y: yPosition,
            size: sectionFontSize,
            color: rgb(0, 0, 0),
        });
    
        yPosition -= 30;
    
        const tableColumnWidths = [150, 150, 150];
        const columnStartX = margin + 10;
    
        const drawTableRow = (row, yPos, isHeader = false, page) => {
            row.forEach((text, index) => {
                const x = columnStartX + tableColumnWidths.slice(0, index).reduce((a, b) => a + b, 0);
                const width = tableColumnWidths[index];
    
                page.drawRectangle({
                    x,
                    y: yPos - rowHeight,
                    width,
                    height: rowHeight,
                    color: isHeader ? rgb(0.9, 0.9, 0.9) : undefined,
                    borderColor: rgb(0.7, 0.7, 0.7),
                    borderWidth: 1,
                });
    
                page.drawText(text, {
                    x: x + 5,
                    y: yPos - rowHeight + 5,
                    size: textFontSize,
                    color: rgb(0, 0, 0),
                });
            });
        };
    
        drawTableRow(['Date', 'Time', 'Reading (mg/dL)'], yPosition, true, page);
    
        yPosition -= rowHeight;
    
        bloodSugar.forEach((entry, index) => {
            if (yPosition - rowHeight < margin) {
                // Add a new page if content overflows
                page = addPage();
                yPosition = pageHeight - margin - rowHeight;
            }
    
            const [date, time] = new Date(entry.timestamp).toISOString().split('T');
            drawTableRow([date, time.split('.')[0], `${entry.value}`], yPosition, false, page);
            yPosition -= rowHeight;
        });
    
        yPosition -= margin;
    
        // Line Graph for last 4 readings
        if (bloodSugar.length >= 4) {
            if (yPosition - 200 < margin) {
                // Add a new page if space is insufficient
                page = addPage();
                yPosition = pageHeight - margin - 200;
            }
    
            const graphX = margin;
            const graphY = yPosition - 200;
            const graphWidth = pageWidth - 2 * margin;
            const graphHeight = 200;
    
            drawCurvedBorder(page, graphX, graphY, graphWidth, graphHeight, rgb(0, 0, 0), 1, 5);
    
            const last4Readings = bloodSugar.slice(-4);
            const maxValue = Math.max(...last4Readings.map((r) => r.value));
            const minValue = 0;
            const scale = graphHeight / (maxValue - minValue || 1);
    
            const pointSpacing = graphWidth / 4;
    
            last4Readings.forEach((entry, idx) => {
                const x = graphX + pointSpacing * (idx + 0.5);
                const y = graphY + (entry.value - minValue) * scale;
    
                page.drawCircle({
                    x,
                    y,
                    size: 3,
                    color: rgb(1, 0, 0),
                });
    
                if (idx > 0) {
                    const prevX = graphX + pointSpacing * (idx - 0.5);
                    const prevY = graphY + (last4Readings[idx - 1].value - minValue) * scale;
    
                    page.drawLine({
                        start: { x: prevX, y: prevY },
                        end: { x, y },
                        thickness: 1,
                        color: rgb(0, 0, 1),
                    });
                }
    
                page.drawText(`${entry.value}`, {
                    x: x - 10,
                    y: y + 5,
                    size: textFontSize - 2,
                    color: rgb(0, 0, 0),
                });
            });
    
            // Draw X and Y axis
            page.drawLine({
                start: { x: graphX, y: graphY },
                end: { x: graphX, y: graphY + graphHeight },
                thickness: 1,
                color: rgb(0, 0, 0),
            });
    
            page.drawLine({
                start: { x: graphX, y: graphY },
                end: { x: graphX + graphWidth, y: graphY },
                thickness: 1,
                color: rgb(0, 0, 0),
            });
    
            // Label the Y axis
            for (let i = 0; i <= maxValue; i += Math.ceil(maxValue / 5)) {
                const y = graphY + i * scale;
                page.drawText(`${i}`, {
                    x: graphX - 20,
                    y: y - 5,
                    size: textFontSize - 2,
                    color: rgb(0, 0, 0),
                });
    
                page.drawLine({
                    start: { x: graphX, y },
                    end: { x: graphX + graphWidth, y },
                    thickness: 0.5,
                    color: rgb(0.8, 0.8, 0.8),
                });
            }
    
            yPosition -= 200 + margin;
        }
    
        // Footer
        page.drawText('Generated by Medical Report System', {
            x: margin,
            y: 10,
            size: textFontSize - 2,
            color: rgb(0.5, 0.5, 0.5),
        });
    
        // Save the PDF and return as Base64
        const pdfBytes = await pdfDoc.saveAsBase64();
        return pdfBytes;
    };
    
    
    const uploadPDF = async (pdfBase64) => {
        const pdfRef = ref(FIREBASE_STORAGE, `documents/${userData.patientId}.pdf`);
        const fileUri = `${FileSystem.documentDirectory}${userData.patientId}.pdf`;

        try {
            // Write Base64-encoded PDF directly to the file system (main change)
            await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Fetch file and convert to blob for Firebase Storage upload
            const response = await fetch(fileUri);
            if (!response.ok) throw new Error('Failed to fetch the PDF file for upload');
            const blob = await response.blob();

            await uploadBytes(pdfRef, blob);  // Upload blob to Firebase Storage
            const downloadURL = await getDownloadURL(pdfRef);

            Alert.alert("Upload successful", "Your PDF has been uploaded!");
            return downloadURL;

        } catch (error) {
            console.error('Error generating or uploading PDF:', error.message);
            Alert.alert("Upload failed", error.message);
            throw error;
        }
    };
    const handleGenerateAndUploadPDF = async () => {
        try {
            const pdfBase64  = await createPDF();
            const url = await uploadPDF(pdfBase64);
            setPdfURL(url);
            Alert.alert("Success", "PDF uploaded successfully!", [{ text: "OK" }]);
        } catch (error) {
            console.error('Error generating or uploading PDF:', error);
            Alert.alert("Error", "Failed to upload PDF.");
        }
    };
    return (
        <SafeAreaView className="flex-1 w-full">
            <View className="overflow-hidden shadow-lg px-16">
                {pdfURL ? (
                    <View className="justify-center align-middle h-full">
                        <Text className="text-lg mb-5">Scan the QR code to access the PDF:</Text>
                        <View className="p-4 border shadow shadow-black rounded-md">
                        <QRCode value={pdfURL} size={270} />
                        </View>
                    </View>
                ) : (
                    <View>
                        <Text className="my-10">Click on the button to generate a QR Code</Text>
                        <TouchableOpacity className="bg-gray-800 rounded-md py-3" onPress={handleGenerateAndUploadPDF}>
                            <Text className="text-2xl text-white text-center">Generate QR Code</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
    
}
export default ShareData;
