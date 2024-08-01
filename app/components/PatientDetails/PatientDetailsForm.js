import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert,TouchableOpacity } from 'react-native';
import { FIRESTORE_DB } from '../../../backend/firebaseConfig';
import {FIREBASE_AUTH} from '../../../backend/firebaseConfig'
import { doc, setDoc } from 'firebase/firestore';

function PatientDetailsForm({ route, navigation }) {

  const { userId} = route.params;
  const { patientDetailsData } = route.params;

 // Get userId from route params
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [allergies, setAllergies] = useState('');

  const handleSubmit = async () => {
    try {
      await setDoc(doc(FIRESTORE_DB, 'patientDetails', userId), {
        patientId:userId,
        patientName: patientDetailsData?.name,
        age,
        height,
        weight,
        bloodType,
        medicalConditions,
        allergies,
        bloodSugar:[],
      });
      Alert.alert('Details saved successfully!');
      navigation.navigate('Test'); // Navigate to home or any other page after saving
    } catch (error) {
      console.error('Error saving details:', error);
      Alert.alert('Failed to save details.');
    }
  };

  return (
    <View style={styles.container}>
      <Text className="text-center font-semibold text-base">Enter your details</Text>
      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="Enter your age"
        keyboardType="numeric"
      />
      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        placeholder="Enter your height"
        keyboardType="numeric"
      />
      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        placeholder="Enter your weight"
        keyboardType="numeric"
      />
      <Text style={styles.label}>Blood Type</Text>
      <TextInput
        style={styles.input}
        value={bloodType}
        onChangeText={setBloodType}
        placeholder="Enter your blood type"
      />
      <Text style={styles.label}>Medical Conditions</Text>
      <TextInput
        style={styles.input}
        value={medicalConditions}
        onChangeText={setMedicalConditions}
        placeholder="Enter your medical conditions"
      />
      <Text style={styles.label}>Allergies</Text>
      <TextInput
        style={styles.input}
        value={allergies}
        onChangeText={setAllergies}
        placeholder="Enter your allergies"
      />
      
      <TouchableOpacity onPress={handleSubmit}  className="bg-slate-600 py-3 rounded-md">
        <Text className="text-white text-center">SUBMIT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
});

export default PatientDetailsForm;
