import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FIRESTORE_DB } from '../../../backend/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { LineChart } from 'react-native-svg-charts';
import Graph from '../Graph/Graph';
export default function PatientDetail({ route }) {
  const { patientId } = route.params;
  const [patientDetails, setPatientDetails] = useState(null);
const data = [50, 10, 40, 95, 85, 35, 53, 24, 50];
  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const patientDoc = await getDoc(doc(FIRESTORE_DB, 'patientDetails', patientId));
        if (patientDoc.exists()) {
          setPatientDetails(patientDoc.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error getting document:", error);
      }
    };
    
    fetchPatientDetails();
  }, [patientId]);
  console.log(patientDetails)
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {patientDetails ? (
        <>
        <Graph patientDetails={patientDetails} style={{ height: 200, padding: 0 }}/>
        <View className="bg-white p-6 rounded-xl shadow-lg m-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
                Patient Information
            </Text>
            <View className="bg-gray-50 p-5 rounded-lg">
                <Text className="text-base text-gray-800 mb-2">
                    <Text className="font-semibold">Name:</Text> {patientDetails.patientName}
                </Text>
                <Text className="text-base text-gray-800 mb-2">
                    <Text className="font-semibold">Age:</Text> {patientDetails.age}
                </Text>
                <Text className="text-base text-gray-800 mb-2">
                    <Text className="font-semibold">Allergies:</Text> {patientDetails.allergies}
                </Text>
                <Text className="text-base text-gray-800 mb-2">
                    <Text className="font-semibold">Blood Type:</Text> {patientDetails.bloodType}
                </Text>
                <Text className="text-base text-gray-800 mb-2">
                    <Text className="font-semibold">Height:</Text> {patientDetails.height}
                </Text>
                <Text className="text-base text-gray-800 mb-2">
                    <Text className="font-semibold">Weight:</Text> {patientDetails.weight}
                </Text>
                <Text className="text-base text-gray-800">
                    <Text className="font-semibold">Medical Conditions:</Text> {patientDetails.medicalConditions}
                </Text>
            </View>
        </View>
          {/* <Text>Blood Sugar Readings:</Text>
          {patientDetails.bloodSugar.map((reading, index) => (
            <View key={index} style={styles.readingContainer}>
              <Text>Timestamp: {reading.timestamp}</Text>
              <Text>Value: {reading.value}</Text>
            </View>
          ))}
           <View style={{ height: 200, padding: 20 }}>
    <LineChart
      style={{ flex: 1 }}
      data={data}
      svg={{ stroke: 'rgb(134, 65, 244)' }}
      contentInset={{ top: 20, bottom: 20 }}
    />
  </View> */}
          {/* Add more patient details here */}
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
  
  },
  readingContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});
