import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../../backend/firebaseConfig';

const SetAlarms = ({ route, navigation }) => {
  const { consultationId } = route.params;
  console.log(consultationId)
  const [routines, setRoutines] = useState([]);
console.log(routines[0])
  useEffect(() => { 
    const fetchRoutines = async () => {
      try {
        const q = query(collection(FIRESTORE_DB, 'routines'), where('userId', '==', consultationId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setRoutines(querySnapshot.docs.map(doc => doc.data()));
        } else {
          setRoutines([]);
        }
      } catch (error) {
        console.error("Error fetching routines:", error);
        Alert.alert('Error', 'Failed to fetch routines. Please try again.');
      }
    };

    fetchRoutines();
  }, [consultationId]);

  const handleSetAlarms = async () => {
    try {
      for (const routine of routines[0]?.routines || []) {
        const trigger = new Date();
        const [hours, minutes] = routine.time.split(':').map(Number);
        trigger.setHours(hours, minutes, 0, 0); // setHours with hours, minutes, seconds, milliseconds
  
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Routine Reminder",
            body: routine.description,
          },
          trigger,
        });
      }
      Alert.alert('Success', 'Alarms have been set for all routines.');
    } catch (error) {
      console.error("Error setting alarms:", error);
      Alert.alert('Error', 'Failed to set alarms. Please try again.');
    }
  };
  

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Routines</Text>
      <ScrollView>
        {routines[0]?.routines.map((routine, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <Text>{routine.description}</Text>
            <Text>{routine.time}</Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={{ backgroundColor: '#2196F3', padding: 10, borderRadius: 5, marginTop: 20 }}
        onPress={handleSetAlarms}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Set Alarms</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SetAlarms;
