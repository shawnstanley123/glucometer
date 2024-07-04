import React,{useState,useEffect} from 'react';
import { Text,SafeAreaView ,View,Button,TouchableOpacity, ImageBackground,Alert } from 'react-native';
import styles from './Testingstyles'
import Donut from '../Donut/DonutChart';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH ,FIRESTORE_DB} from '../../../backend/firebaseConfig'; 
import { doc, getDoc } from 'firebase/firestore';
import { registerForPushNotificationsAsync } from '../Notifications/Notifications';
import messaging from '@react-native-firebase/messaging'
function Testing({navigation}) {
console.log(messaging)
    const [value,setValue] = useState(84)
    const [bgColor,setBgColor] = useState('green')
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); 
   
    const data = [{
      percentage: 8,
      color: 'tomato',
      max: 10
    }, {
      percentage: 14,
      color: 'skyblue',
      max: 20
    }, {
      percentage: 92,
      color: 'gold',
      max: 100
    }, {
      percentage: 240,
      color: '#222',
      max: 500
    }]
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
      useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH,  async (user) => {
         
          if (user) {
            const role = await getUserRole(user.uid);
            console.log(role)
            if (role === 'patient') {
              setUser(user);
              setRole(role);
              await registerForPushNotificationsAsync(user.uid);
            }
          }
        });
        return () => unsubscribe();
      }, []);
      const sendNotificationToDoctor = async (doctorId, consultationId) => {
        try {
          const doctorDoc = await getDoc(doc(FIRESTORE_DB, 'users', doctorId));
          if (doctorDoc.exists()) {
            const doctorData = doctorDoc.data();
            const message = {
              to: doctorData.deviceToken,
              notification: {
                title: 'New Consultation Request',
                body: `You have a new consultation request. Consultation ID: ${consultationId}`,
              },
            };
      
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              },
              body: JSON.stringify(message),
            });
            if (response.ok) {
              console.log('Notification sent successfully');
            } else {
              console.log('Error sending notification:', response.statusText);
            }
          }
        } catch (error) {
          console.log('Error sending notification:', error);
        }
      };
      const requestUserPermission = async () =>{
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          console.log('Authorization status:', authStatus);
        }
      }
      useEffect(()=>{
       if(requestUserPermission()){
        messaging().getToken().then(token =>{
            console.log(token)
        })
      
       }
       else{
          console.log("Permission not granted",authStatus)
       }
       messaging()
       .getInitialNotification()
       .then(async (remoteMessage)=>{
        if(remoteMessage){
          console.log("Notification caused app to open from quit state:",remoteMessage.notification)
        }
       })
       messaging().onNotificationOpenedApp((remoteMessage)=>{
        console.log("Notification caused app to open from backgeound state:",remoteMessage.notification)
       })
       const unsubscribe = messaging().setBackgroundMessageHandler(async (remoteMessage)=>{
        Alert.alert("A new FCM message arrived!",JSON.stringify(remoteMessage))
       })
return unsubscribe;
      },[])
      const createConsultation = async () => {
        try {
          const consultationRef = await addDoc(collection(FIRESTORE_DB, 'consultations'), {
            patientId: user.uid,
            doctorId: 'DWkuS4DQxdWu8nqktEb4U5MRxfi1', // Fetch or determine the doctorId dynamically
            status: 'pending',
            timestamp: serverTimestamp(),
          });
    
          await sendNotificationToDoctor('DWkuS4DQxdWu8nqktEb4U5MRxfi1', consultationRef.id);
    
          Alert.alert('Consultation request sent successfully!');
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'Failed to create consultation request.');
        }
      };
    
      if (!user || role !== 'patient') return null;
    
    
    return (
    <SafeAreaView className='flex-1 w-full'>
   
    <View className="rounded overflow-hidden shadow-lg bg-white m-4">
             
                <ImageBackground source={{ uri: "https://i.pinimg.com/originals/db/64/d0/db64d058a37059774c3218315d377441.jpg" }} className="w-full h-40">
           <View className="flex flex-row max-w-sm">
            <View className="">
            <View className="px-6 py-4">
                <Text className="font-bold text-xl mb-2 text-white">Patient Name</Text>
                <Text className="text-base text-white">Age: 22</Text>
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
                >
                </ImageBackground>
            </View>
        </View>
            </View>
        </ImageBackground>
        </View>
        <View className="rounded-lg overflow-hidden shadow-lg bg-white m-4 p-3">
          <Text className="px-4 py-3 text-lg font-semibold">Blood Sugar level</Text>
          <View className="w-full border-t border-gray-400 my-2" />
          <View className="py-10">
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', flexWrap: 'wrap', alignItems: 'center'}}>
  <Donut percentage={83} color={'green'} delay={500 + 100} max={100}/>
        </View>
        </View>
      </View>
      <View className="rounded-lg overflow-hidden shadow-lg m-4 p-3">
      <TouchableOpacity
        style={[styles.button, styles.width, { padding: 10 ,backgroundColor:'#cf6a3c'}]}
      
      >
        <Text style={[styles.buttonText,styles.fontBold]}>Retake Test</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.width, { padding: 10, backgroundColor:'white' }]}
        onPress={() => navigation.navigate('Results')}
      >
        <Text style={[styles.buttonText,styles.fontBold,{color:'#448044'}]}>Show Results</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.width, { padding: 10, backgroundColor:'white' }]}
        onPress={() => FIREBASE_AUTH.signOut()}
      >
        <Text style={[styles.buttonText,styles.fontBold,{color:'#448044'}]}>Logout</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
    );
}

export default Testing;