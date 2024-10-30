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
        const page = pdfDoc.addPage([600, 800]);
        const { age, allergies, bloodSugar, patientName, height, weight } = userData;
    
        page.drawText(`Patient Name: ${patientName}`, { x: 50, y: 750, size: 20 });
        page.drawText(`Age: ${age}`, { x: 50, y: 720 });
        page.drawText(`Allergies: ${allergies}`, { x: 50, y: 690 });
        page.drawText(`Height: ${height} cm`, { x: 50, y: 660 });
        page.drawText(`Weight: ${weight} kg`, { x: 50, y: 630 });
        
        bloodSugar.forEach((entry, index) => {
            page.drawText(`Reading ${index + 1}: ${entry.value} at ${entry.timestamp}`, { x: 50, y: 600 - index * 30 });
        });
    
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
