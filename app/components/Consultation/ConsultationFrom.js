// ConsultationForm.js
import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../../backend/firebaseConfig';
import { addDoc, collection, serverTimestamp ,getDoc,doc} from 'firebase/firestore';
import { sendNotificationToDoctor } from '../Notifications/PushNotificationsService';

function ConsultationForm({ route, navigation }) {
    const { userDataa } = route.params || {};
    const [doctorId, setDoctorId] = useState(null); // Default doctor ID or fetch dynamically
    const [patientNotes, setPatientNotes] = useState('');
    const [consultationDetails, setConsultationDetails] = useState({
        patientName: userDataa?.name || '',
        age: userDataa?.age || '',
        height: '',
        weight: '',
        bloodSugarLevel: userDataa?.bloodSugarLevel || '',
    });
    console.log(consultationDetails)

  const isFormValid = () => {
    return (
      consultationDetails.patientName &&
      consultationDetails.age &&
      consultationDetails.height &&
      consultationDetails.weight &&
      consultationDetails.bloodSugarLevel &&
      patientNotes
    );
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          console.log(user.uid);
  
          const doctorDoc = await getDoc(doc(FIRESTORE_DB, 'patient', user.uid));
          
          if (doctorDoc.exists()) {
            const doctorDataId = doctorDoc.data().doctor[0]
            setDoctorId(doctorDataId);
           
          } else {
            console.log("No such document!");
          }
        }
      } catch (error) {
        console.error("Error getting document:", error);
      }
    };
  
    fetchData();
  }, []);
  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const consultationRef = await addDoc(collection(FIRESTORE_DB, 'consultations'), {
          ...consultationDetails,
          patientId: user.uid,
          doctorId,
          patientNotes,
          status: 'pending',
          timestamp: serverTimestamp(),
        });

        await sendNotificationToDoctor(doctorId, consultationRef.id, consultationDetails.patientName);

        Alert.alert('Consultation request sent successfully!');
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create consultation request.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Patient Name</Text>
      <TextInput
        style={styles.input}
        value={consultationDetails.patientName}
        onChangeText={(text) => setConsultationDetails({ ...consultationDetails, patientName: text })}
        placeholder="Enter your name"
        editable={false}
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={consultationDetails.age}
        onChangeText={(text) => setConsultationDetails({ ...consultationDetails, age: text })}
        placeholder="Enter your age"
        keyboardType="numeric"
        editable={false}
      />

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        value={consultationDetails.height}
        onChangeText={(text) => setConsultationDetails({ ...consultationDetails, height: text })}
        placeholder="Enter your height"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={consultationDetails.weight}
        onChangeText={(text) => setConsultationDetails({ ...consultationDetails, weight: text })}
        placeholder="Enter your weight"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Blood Sugar Level</Text>
      <TextInput
        style={styles.input}
        value={`${consultationDetails.bloodSugarLevel}`}
        onChangeText={(text) => setConsultationDetails({ ...consultationDetails, bloodSugarLevel: text })}
        placeholder="Enter your blood sugar level"
        keyboardType="numeric"
        editable={false}
      />

      <Text style={styles.label}>Patient Notes</Text>
      <TextInput
        style={styles.textArea}
        value={patientNotes}
        onChangeText={setPatientNotes}
        placeholder="Enter any additional notes"
        multiline
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: isFormValid() ? '#448044' : '#ccc' }, // Change color based on validation
        ]}
        onPress={handleSubmit}
        disabled={!isFormValid()} // Disable if the form is not valid
      >
        <Text style={styles.submitButtonText}>Submit Consultation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    height: 100,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#448044',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ConsultationForm;
