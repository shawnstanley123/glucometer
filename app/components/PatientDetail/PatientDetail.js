import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FIRESTORE_DB } from '../../../backend/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { LineChart } from 'react-native-svg-charts';
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {patientDetails ? (
        <>
          <Text>Name: {patientDetails.patientName}</Text>
          <Text>Age: {patientDetails.age}</Text>
          <Text>Allergies: {patientDetails.allergies}</Text>
          <Text>Blood Type: {patientDetails.bloodType}</Text>
          <Text>Height: {patientDetails.height}</Text>
          <Text>Weight: {patientDetails.weight}</Text>
          <Text>Medical Conditions: {patientDetails.medicalConditions}</Text>
          <Text>Blood Sugar Readings:</Text>
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
  </View>
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
    padding: 20,
  },
  readingContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});
