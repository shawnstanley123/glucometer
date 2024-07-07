import React,{useState,useEffect} from 'react';
import { Text,SafeAreaView ,View,Button,TouchableOpacity, ImageBackground,Alert,TextInput,StyleSheet} from 'react-native';
import { doc, getDoc, addDoc, serverTimestamp, collection,updateDoc,arrayUnion,query,where,getDocs } from 'firebase/firestore';
import Donut from '../Donut/DonutChart';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH ,FIRESTORE_DB} from '../../../backend/firebaseConfig'; 
// import { registerForPushNotificationsAsync } from '../Notifications/Notifications';

import { registerForPushNotificationsAsync, sendNotificationToDoctor } from '../Notifications/PushNotificationsService';
import * as Notifications from 'expo-notifications';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
export default function Doctor({navigation}) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [friendCode, setFriendCode] = useState('');
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          console.log(user.uid);

          const doctorDoc = await getDoc(doc(FIRESTORE_DB, 'doctor', user.uid));
          
          if (doctorDoc.exists()) {
            const patientIds = doctorDoc.data().patient;

            // Fetch all patient data
            const patientPromises = patientIds.map(async (patientId) => {
              const patientDoc = await getDoc(doc(FIRESTORE_DB, 'patient', patientId));
              return patientDoc.exists() ? { id: patientId, ...patientDoc.data() } : null;
            });

            // Wait for all patient data to be fetched
            const patientData = await Promise.all(patientPromises);

            // Filter out null results
            setPatients(patientData.filter(patient => patient !== null));
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
  const getUserRole = async (userId) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
      if (userDoc.exists()) {
  
        const userData = userDoc.data();
        console.log(userData)
        return userData.role || null;
      } else {
        console.log('A No such document!');
        return null;
      }
    } catch (error) {
      console.log('Error getting document:', error);
      return null;
    }
  };
  const addPatientByFriendCode = async () => {
    try {
      // Find patient document by friendCode
      const patientQuerySnapshot = await getDocs(query(collection(FIRESTORE_DB, 'patient'), where('friendCode', '==', friendCode)));
      if (patientQuerySnapshot.empty) {
        Alert.alert('Error', 'Patient not found with this friend code');
        return;
      }

      const patientDoc = patientQuerySnapshot.docs[0];
      const patientData = patientDoc.data();
      const patientUserId = patientDoc.data().userId;
      if (patientData.doctor && patientData.doctor.length > 0) {
        Alert.alert('Error', 'This patient is already assigned to a doctor');
        return;
      }

      // Convert IDs to DocumentReferences
      const doctorRef = doc(FIRESTORE_DB, 'doctor', user.uid);
      const patientRef = doc(FIRESTORE_DB, 'patient', patientDoc.id);

      // Update doctor's document
      await updateDoc(doctorRef, {
        patient: arrayUnion(patientUserId)
      });

      // Update patient's document
      await updateDoc(patientRef, {
        doctor: arrayUnion(user.uid)
      });

      Alert.alert('Success', `Patient ${patientData.name} added successfully`);
    } catch (error) {
      console.log('Error adding patient:', error);
      Alert.alert('Error', 'Failed to add patient. Please try again.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH,  async (user) => {
     
      if (user) {
        const role = await getUserRole(user.uid);
        console.log(role)
        if (role === 'doctor') {
          setUser(user);
          setRole(role);
          await registerForPushNotificationsAsync(user.uid);
        }
      }
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received!', notification);
      // You can show an alert or update your app state here
      Alert.alert('Notification received!', notification.request.content.body);
    });
  
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received!', response);
      // You can navigate to a specific screen or handle the response
    });
  
    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);
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
              <Text className="font-bold text-xl mb-2 text-white">Doctor</Text>
              <Text className="text-base text-white">Age: 51</Text>
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
    <View className="m-4 p-4 rounded-lg overflow-hidden shadow-lg bg-white">
        <Text className="text-xl font-bold mb-4">Add Patient</Text>
        <TextInput
          style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 12, padding: 8, borderRadius: 4 }}
          placeholder="Enter Friend Code"
          value={friendCode}
          onChangeText={setFriendCode}
        />
        <TouchableOpacity
          style={{ padding: 10, backgroundColor: '#cf6a3c', borderRadius: 4, alignItems: 'center' }}
          onPress={addPatientByFriendCode}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Patient</Text>
        </TouchableOpacity>
      </View>
    <View>
        <Text>Doctor</Text>
        {patients.map((patient) => (
        <TouchableOpacity
          key={patient.id}
          style={styles.patientBox}
          onPress={() => navigation.navigate('PatientDetail', { patientId: patient.id })}
        >  
          <Text>{patient.name}</Text>
        </TouchableOpacity>
      ))}
        <TouchableOpacity
        onPress={() => FIREBASE_AUTH.signOut()}
      ><Text>Log Out</Text>
        </TouchableOpacity>
       
    </View>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  patientBox: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});
