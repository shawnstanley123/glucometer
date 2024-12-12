import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, View, TextInput, Button, TouchableOpacity, Alert,Image } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../backend/firebaseConfig'; 
import { doc, getDoc, updateDoc, query, where, getDocs, arrayUnion, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { registerForPushNotificationsAsync } from '../Notifications/PushNotificationsService';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
export default function Doctor({ navigation }) {
    const [friendCode, setFriendCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [patients, setPatients] = useState([]);
    const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
    useEffect(()=>{
        fetchData()
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
            if (user) {
              const role = await getUserRole(user.uid);
              if (role === 'accuser') {
                setUser(user);
                setRole(role);
                await registerForPushNotificationsAsync(user.uid);
              }
            }
          });
          return () => unsubscribe();
    },[])
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
    const fetchData = async () =>{
        const currentUser = FIREBASE_AUTH.currentUser;
        const userDocRef = doc(FIRESTORE_DB, 'accuser', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        console.log(userDoc.data());
        if (userDoc.exists()) {
            setUserData(userDoc?.data())
                const user = FIREBASE_AUTH.currentUser;
                const userDoc = await getDoc(doc(FIRESTORE_DB, 'accuser', user.uid));
                if (userDoc.exists()) {
                  const patientIds = userDoc.data().patient;
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
                console.log(patients)
        }
        }
    const handleUpdate = async () => {
        setLoading(true);
        try {
            // Query patient by friend code
            const patientsCollection = collection(FIRESTORE_DB, 'patient');
            const q = query(patientsCollection, where('friendCode', '==', friendCode));
            const querySnapshot = await getDocs(q);
      
            if (querySnapshot.empty) {
                Alert.alert('Error', 'Patient with this friend code not found.');
                setLoading(false);
                return;
            }

            const patientDoc = querySnapshot.docs[0];
            const patientData = patientDoc.data();
            const patientId = patientData.userId;

            // Fetch user's document from the authenticated user
            const currentUser = FIREBASE_AUTH.currentUser;
            const userDocRef = doc(FIRESTORE_DB, 'accuser', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                Alert.alert('Error', 'User not found.');
                setLoading(false);
                return;
            }

            const userData = userDoc.data();

            // Update patient's users array
            await updateDoc(patientDoc.ref, {
                user: arrayUnion(currentUser.uid)
            });

            // Update user's patients array
            await updateDoc(userDocRef, {
                patient: arrayUnion(patientId)
            });
            fetchData()
            Alert.alert('Success', 'Successfully updated friend and patient data.');
            setFriendCode('');

        } catch (error) {
            console.error('Error updating data:', error);
            Alert.alert('Error', 'Error updating data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-purple-50 px-3 py-2">
            <View className="flex flex-row justify-between">
                <View>
            <Text className="text-xs text-gray-500">WELCOME</Text>
                <Text className="text-lg font-semibold text-gray-900 mb-4">{userData?.name}</Text>
                </View>             
            <TouchableOpacity
                onPress={() => FIREBASE_AUTH.signOut()}
                style={{ marginTop: 20 }}
            >
                <Text>Log Out</Text>
            </TouchableOpacity>
            </View>
            <View className="bg-white rounded-xl shadow-lg shadow-gray-500 h-[93%] py-3">
            <View className="flex-1">
            <Text className="text-gray-600 text-sm py-2 text-center">Add an user to view his data</Text>
            <View className="flex flex-row space-x-2 w-full justify-center">
            <TextInput
                placeholder="Friend Code"
                value={friendCode}
                onChangeText={setFriendCode}
                autoCapitalize='characters'
                className="w-2/3 p-2 border border-gray-300 rounded-lg bg-white text-gray-800 shadow-black"
            />
            <TouchableOpacity onPress={handleUpdate} disabled={loading} className="bg-black p-2 rounded-lg flex items-center justify-center">
                <Text className="text-white">{loading ? "Updating..." : "Add User"}</Text>
            </TouchableOpacity>
            </View>
            <View className="py-5">
                <View className="bg-gray-700 p-2 rounded-top">
                    <Text className="text-white font-semibold text-center">Users</Text>
                </View>
                {patients.map((patient)=>(
                    <View className="flex flex-col items-center shadow-md shadow-gray-200 border-x-yellow-900 m-2 rounded-xl bg-slate-100" key={patient?.userId}>
                <View className="p-3 flex flex-row w-full items-center">
                <View className="w-[15%]">
                <Image source={require('../../assets/avatar.png')} className="w-20 h-20 rounded-full border border-gray-300"/>
                </View>
                <View className="ml-10">
                    <Text className="text-base font-semibold">{patient?.name}</Text>
                    <Text className="text-gray-500 text-sm">Email: {patient?.email}</Text>
                    {/* <Text className="text-gray-500 text-sm">Age: {patient?.age}</Text> */}
                </View>
                </View>
                    <TouchableOpacity className="bg-gray-950 p-2 rounded-b-xl mt-3 w-full" onPress={() => navigation.navigate('PatientDetail', { patientId: patient.id })}>
                        <Text className="text-white text-center font-semibold">View Records</Text>
                    </TouchableOpacity>
                </View>
                ))}
            </View>    
            </View>
            </View>
        </SafeAreaView>
    );
}
