// Testing.js
import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, View, Button, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import styles from './Testingstyles';
import Donut from '../Donut/DonutChart';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../backend/firebaseConfig';
import { doc, getDoc, addDoc, serverTimestamp, collection,updateDoc,arrayUnion } from 'firebase/firestore';
import { registerForPushNotificationsAsync } from '../Notifications/PushNotificationsService';

function Testing({ navigation }) {
  const [value, setValue] = useState(82);
  const [bgColor, setBgColor] = useState('green');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [actualUserData, setActualUserData] = useState(null);
  const [userDataa, setUserDataa] = useState({ name: '', age: '21', bloodSugarLevel: value });

  useEffect(() => {
    if (value > 83) {
      setBgColor('#942018');
    } else {
      setBgColor('green');
    }
  }, [value]);

  const getUserRole = async (userId) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setActualUserData(userData.name);
        setUserDataa({
          ...userDataa,
          name: userData.name,
          bloodSugarLevel: value,
        });
        return userData.role || null;
      } else {
        FIREBASE_AUTH.signOut();
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.log('Error getting document:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
        if (role === 'patient') {
          setUser(user);
          setRole(role);
          await registerForPushNotificationsAsync(user.uid);
        }
      }
    });
    return () => unsubscribe();
  }, []);
  
  const handleRetakeTest = async () => {
    try {
      const patientDocRef = doc(FIRESTORE_DB, 'patientDetails', user.uid);
      const patientDoc = await getDoc(patientDocRef);
      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        console.log(patientDoc.data())
        const newEntry = {
          value,
          timestamp: new Date().toISOString(),
        };

        // Update the bloodSugar array
        await updateDoc(patientDocRef, {
          bloodSugar: arrayUnion(newEntry),
        });

        Alert.alert('Success', 'Blood sugar level added.');
      } else {
        console.log('No such patient document!');
      }
    } catch (error) {
      console.log('Error updating document:', error);
      Alert.alert('Error', 'Failed to add blood sugar level.');
    }
  };

  if (!user || role !== 'patient') return null;

  return (
    <SafeAreaView className='flex-1 w-full'>
      <View className="rounded overflow-hidden shadow-lg bg-white m-4">
        <ImageBackground
          source={{ uri: "https://i.pinimg.com/originals/db/64/d0/db64d058a37059774c3218315d377441.jpg" }}
          className="w-full h-40"
        >
          <View className="flex flex-row max-w-sm">
            <View className="">
              <View className="px-6 py-4">
                <Text className="font-bold text-xl mb-2 text-white">{userDataa.name}</Text>
                <Text className="text-base text-white">Age: {userDataa.age}</Text>
              </View>
              <View className="px-6 pt-4 pb-2">
                <Text className="text-sm text-white">Height : 0cm Weight : 0cm</Text>
              </View>
            </View>
            <View className="px-10 py-8 flex items-center">
              <View className="h-20 w-20 rounded-full overflow-hidden">
                <ImageBackground
                  source={{ uri: "https://qph.cf2.quoracdn.net/main-qimg-f1f534fd992d4bbbd1b5c2bfb0b640a5-lq" }}
                  className="h-full w-full"
                />
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
      <View className="rounded-lg overflow-hidden shadow-lg bg-white m-4 p-3">
        <Text className="px-4 py-3 text-lg font-semibold">Blood Sugar level</Text>
        <View className="w-full border-t border-gray-400 my-2" />
        <View className="py-10">
          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', flexWrap: 'wrap', alignItems: 'center' }}>
            <Donut percentage={value} color={'green'} delay={500 + 100} max={100} />
          </View>
        </View>
      </View>
      <View className="rounded-lg overflow-hidden shadow-lg m-4 p-3">
        <TouchableOpacity
          style={[styles.button, styles.width, { padding: 10, backgroundColor: '#cf6a3c' }]}
          onPress={handleRetakeTest}
        >
          <Text style={[styles.buttonText, styles.fontBold]}>Retake Test</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.width, { padding: 10, backgroundColor: 'white' }]}
          onPress={() => navigation.navigate('Results')}
        >
          <Text style={[styles.buttonText, styles.fontBold, { color: '#448044' }]}>Show Results</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.width, { padding: 10, backgroundColor: 'white' }]}
          onPress={() => FIREBASE_AUTH.signOut()}
        >
          <Text style={[styles.buttonText, styles.fontBold, { color: '#448044' }]}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.width, { padding: 10, backgroundColor: 'white' }]}
          onPress={() => navigation.navigate('ConsultationForm',{userDataa})} // Navigate to ConsultationForm screen
        >
          <Text style={[styles.buttonText, styles.fontBold, { color: '#448044' }]}>Send consultation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default Testing;
