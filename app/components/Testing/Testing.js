import React, { useRef, useState, useEffect } from 'react';
import { Text, SafeAreaView, View, Button, TouchableOpacity, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import styles from './Testingstyles';
import Donut from '../Donut/DonutChart';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB, REALTIME_DB } from '../../../backend/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { registerForPushNotificationsAsync } from '../Notifications/PushNotificationsService';
import { ref, onValue } from 'firebase/database';
import SetAlarms from '../SetAlarms/SetAlarms';
import { LinearGradient } from 'expo-linear-gradient';
function Testing({ navigation }) {
  const [value, setValue] = useState(0);
  const [bgColor, setBgColor] = useState('green');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [actualUserData, setActualUserData] = useState(null);
  const [userDataa, setUserDataa] = useState({ name: '', age: '21', bloodSugarLevel: liveData });
  const [soilMoisture, setSoilMoisture] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGraph,setShowGraph] = useState(false)
  const [testDone,setTestDone] = useState(false)
  const [finalValue,setFinalValue] = useState(null) 
  const [patientDetails,setPatientDetails] = useState(null)
  const liveDataRef1 = useRef(null);
  useEffect(() => {
    // const docRef = doc(FIRESTORE_DB, 'liveDataCollection', 'liveDataDoc');
    const liveDataRef = ref(REALTIME_DB, 'liveDataCollection/liveDataDoc/liveData');
    const unsubscribe = onValue(liveDataRef, (snapshot) => {
      if (snapshot.exists()) {
        setLiveData(snapshot.val());
        liveDataRef1.current = snapshot.val();
      } else {
        console.log('No such document!');
      }
      setLoading(false);
    });
    // const unsubscribe = onSnapshot(docRef, (docSnap) => {
    //   if (docSnap.exists()) {
    //     setLiveData(docSnap.data().liveData);
    //     console.log(docSnap.data().zout)
    //   } else {
    //     console.log('No such document!');
    //   }
    //   setLoading(false);
    // });

    return () => unsubscribe();
  }, []);

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

  const startTest = () =>{
    console.log("called")
    setShowGraph(true);
    setTimeout(()=>{
      setShowGraph(false);
      setTestDone(true);      
      setFinalValue(liveDataRef1.current);
      console.log('Final value set:', liveDataRef1.current);
      handleRetakeTest(liveDataRef1.current)
    },5000)
  }
  const navigateToConsultationForm = async () =>{
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        console.log(user.uid);

        const doctorDoc = await getDoc(doc(FIRESTORE_DB, 'patient', user.uid));
        
        if (doctorDoc.exists()) {
          const doctorDataId = doctorDoc.data().doctor[0]
          navigation.navigate('ConsultationForm', { doctorId: doctorDataId });
         
        } else {
          console.log("No such document!");
          Alert.alert('Error', 'No doctor assigned to you');
        }
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  }
  const getUserRole = async (userId) => {
    try {
      const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
      if (userDoc.exists()) {
        const patientDetailsDoc = await getDoc(doc(FIRESTORE_DB, 'patient', userId));
        let patientDetailsData = {};
        if (patientDetailsDoc.exists()) {
          patientDetailsData = patientDetailsDoc.data();
          console.log(patientDetailsData)
          setPatientDetails(patientDetailsData)
          const patientDetailsDoc1 = await getDoc(doc(FIRESTORE_DB, 'patientDetails', userId));
      
          if (!patientDetailsDoc1.exists()) {
            console.log('No patient details found!');
            // Navigate to the PatientDetailsForm screen if no patient details are found
            navigation.navigate('PatientDetailsForm', { userId,patientDetailsData});
            return null;
          } 
        } else {
          console.log('No patient found!');
        }
        const userData = userDoc.data();
        setActualUserData(userData.name);
        setUserDataa({
          ...userDataa, 
          name: userData.name,
          bloodSugarLevel: liveData,   
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

  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.1.148/');
      const text = await response.text();
      if (text === 'Out of range') {
        setValue(0);
      } else {
        setValue(parseInt(text));
      }
    } catch (error) {
      console.error('Error fetching soil moisture:', error);
      setValue('Error fetching data');
    }
  };

  const handleRetakeTest = async (currentValue) => {
    console.log("entering clled",user.uid)
    try {
      const patientDocRef = doc(FIRESTORE_DB, 'patientDetails', user.uid);
      const patientDoc = await getDoc(patientDocRef);
      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        console.log(patientDoc.data());
        console.log("entering",finalValue)
        const newEntry = {
          value:currentValue,
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

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

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
                <Text className="text-sm text-white mr-16">Invite Code: {patientDetails?.friendCode}</Text>
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
           {showGraph&&(<Donut percentage={liveData} color={'green'} delay={500 + 100} max={100} />)}
           {!showGraph&&testDone&&(
             <LinearGradient
             colors={['#141e30', '#243b55']}
             start={[0, 0]}
             end={[1, 1]}
             className="w-60 h-60 rounded-full justify-center items-center shadow-lg"
           >
             <TouchableOpacity className="w-35 h-35 rounded-full justify-center items-center" onPress={startTest}>
              <View className="flex-row mt-4">
               <Text className="text-white text-4xl font-bold mr-3">{finalValue}</Text>
               <Text className="text-white text-lg font-bold items-end">mg/dL</Text>
               </View>
               <Text className="text-white text-base font-medium mt-4">Retake Test</Text>   
             </TouchableOpacity>
           </LinearGradient>
           )} 
           {!showGraph&&!testDone&&(
             <LinearGradient
             colors={['#141e30', '#243b55']}
             start={[0, 0]}
             end={[1, 1]}
             className="w-60 h-60 rounded-full justify-center items-center shadow-lg"
             
           >
             <TouchableOpacity  className="w-35 h-35 rounded-full justify-center items-center flex-row" onPress={startTest}>
               <Text className="text-white text-3xl font-bold">Start Test</Text> 
               
             </TouchableOpacity >
           </LinearGradient>
           )} 
          </View>
        </View>
      </View>
      <View className="rounded-lg overflow-hidden shadow-lg m-2 p-3">
        <TouchableOpacity
          style={[styles.button, styles.width, { padding: 10, backgroundColor: 'white' }]}
          onPress={() => navigation.navigate('Results',{finalValue:finalValue})}
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
          onPress={() => navigateToConsultationForm()} // Navigate to ConsultationForm screen
        >
          <Text style={[styles.buttonText, styles.fontBold, { color: '#448044' }]}>Send consultation</Text>
        </TouchableOpacity>
<TouchableOpacity
        style={[styles.button, styles.width, { padding: 10, backgroundColor: 'white' }]}
        onPress={() => navigation.navigate('SetAlarms', { consultationId: user.uid })}
      ><Text style={[styles.buttonText, styles.fontBold, { color: '#448044' }]}>Show Routines</Text></TouchableOpacity>
       
      </View>
    </SafeAreaView>
  );
}

export default Testing;
