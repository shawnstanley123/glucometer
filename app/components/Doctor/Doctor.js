import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, View, TouchableOpacity, ImageBackground, Alert, TextInput, ScrollView,Image } from 'react-native';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../backend/firebaseConfig';
import { registerForPushNotificationsAsync } from '../Notifications/PushNotificationsService';
import * as Notifications from 'expo-notifications';
import { FontAwesome } from '@expo/vector-icons';
import { getRoomId } from '../../utils/common';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Doctor({ navigation }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [friendCode, setFriendCode] = useState('');
  const [patients, setPatients] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const fetchInitialData = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const doctorDoc = await getDoc(doc(FIRESTORE_DB, 'doctor', user.uid));
        if (doctorDoc.exists()) {
          const patientIds = doctorDoc.data().patient;
          const patientPromises = patientIds.map(async (patientId) => {
            const patientDoc = await getDoc(doc(FIRESTORE_DB, 'patient', patientId));
            if (patientDoc.exists()) {
              return { id: patientId, ...patientDoc.data() };
            } else {
              return null;
            }
          });
          const patientData = await Promise.all(patientPromises);
          setPatients(patientData.filter(patient => patient !== null));
          return patientIds;
        }
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  const setupConsultationListener = (patientIds) => {
    const q = query(
      collection(FIRESTORE_DB, 'consultations'),
      where('patientId', 'in', patientIds)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setPatients((prevPatients) => {
        return prevPatients.map(patient => {
          const hasPendingConsultation = querySnapshot.docs.some(doc =>
            doc.data().patientId === patient.id && doc.data().status === 'pending'
          );
          return { ...patient, hasPendingConsultation };
        });
      });
    });

    return unsubscribe;
  };

  useEffect(() => {
    let unsubscribe = null;

    const initialize = async () => {
      const patientIds = await fetchInitialData();
      if (patientIds) {
        unsubscribe = setupConsultationListener(patientIds);
      }
    };

    initialize();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const getUserRole = async (userId) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role || null;
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.log('Error getting document:', error);
      return null;
    }
  };

  const addPatientByFriendCode = async () => {
    try {
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

      const doctorRef = doc(FIRESTORE_DB, 'doctor', user.uid);
      const patientRef = doc(FIRESTORE_DB, 'patient', patientDoc.id);

      await updateDoc(doctorRef, {
        patient: arrayUnion(patientUserId)
      });

      await updateDoc(patientRef, {
        doctor: arrayUnion(user.uid)
      });

      Alert.alert('Success', `Patient ${patientData.name} added successfully`);
      fetchInitialData()
    } catch (error) {
      console.log('Error adding patient:', error);
      Alert.alert('Error', 'Failed to add patient. Please try again.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
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
      Alert.alert('Notification received!', notification.request.content.body);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received!', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);
  useEffect(()=>{
    
    const fetchUnreadMessages = () => {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) return;
      // Fetch unread message counts for each doctor
      patients.forEach((patient) => {
        // Query the sub-collection 'messages' inside each 'room'
        const q = query(
            collection(FIRESTORE_DB, 'rooms', getRoomId(patient?.userId,user?.uid), 'messages'),
            where('userId', '!=', user.uid), // Messages not sent by the current user
            where('isRead', '==', false)    // Only unread messages
        );
    
        const unsub = onSnapshot(q, (snapshot) => {
            // The size of the snapshot equals the count of unread messages for the specific room
            const unreadCount = snapshot.size;
    
            // Update the state with unread count for the current doctor
            setUnreadCounts((prevCounts) => ({
                ...prevCounts,
                [patient?.userId]: unreadCount, // Map unread count to the doctor ID
            }));
        });
        console.log(unreadCounts)
    });;
  };
  fetchUnreadMessages();
  },[patients])
  const navigateToChat = (doctorId,doctorName) => {
    navigation.navigate('ChatRoom', { doctorId,doctorName});
}
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
          style={{ padding: 10, backgroundColor: '#101929', borderRadius: 4, alignItems: 'center' }}
          onPress={addPatientByFriendCode}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Patient</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-xl font-bold mb-4 text-center">Patients</Text>
      <ScrollView className="p-4 m-3 bg-white rounded-xl">
        {patients.map((patient) => (
          <View key={patient.id} className="mb-5 bg-slate-100 rounded-xl shadow-black shadow-gray-800">
            <View className="flex-row p-4">
              <Image source={require('../../assets/avatar.png')} className="w-20 h-20 rounded-full border border-gray-300"/>
              <View className="ml-5">
            <Text className="text-base font-semibold mb-4">Patient Name: {patient.name}</Text>
              
              {/* <TouchableOpacity
                className="py-2 px-2 rounded-lg"
                onPress={() => navigateToChat(patient?.id,patient?.name)}
              >
                <Text className="text-blue-600 font-bold">Chat</Text>
              </TouchableOpacity> */}
              {patient.hasPendingConsultation && (
                <TouchableOpacity
                  className="py-2 px-4 bg-green-600 rounded-lg"
                  onPress={() => navigation.navigate('ConsultationDetail', { patientId: patient.id })}
                >
                  <Text className="text-white font-bold">View Consultation</Text>
                </TouchableOpacity>
              )}
              </View>
            </View>
            <View className="border-b border-gray-300 mt-4" />
            <View className="flex flex-row">
            <TouchableOpacity
                className="py-2 px-2 rounded-bl-xl flex-1 border bg-gray-950 border-white"
                onPress={() => navigation.navigate('PatientDetail', { patientId: patient.id })}
              >
                <Text className="text-white font-bold text-center">View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                                className="flex-1 border rounded-br-xl flex justify-center items-center bg-gray-950"
                                onPress={() => navigateToChat(patient?.id,patient?.name)}
                            >
                                {/* Chat Icon */}
                                <View className="relative">
                                    <FontAwesome name="wechat" size={24} color="white" />
                                    {/* Badge for Unread Messages */}
                                    {unreadCounts[patient?.userId] > 0 && (
                                        <View
                                            className="absolute -top-1 -right-2 bg-red-500 h-5 w-5 rounded-full justify-center items-center"
                                        >
                                            <Text className="text-white text-xs font-bold">
                                                {unreadCounts[patient?.userId]}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={{ padding: 10, backgroundColor: '#101929', borderRadius: 4, alignItems: 'center' }} 
        onPress={() => FIREBASE_AUTH.signOut()}
      >
        <Text className="text-white">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
