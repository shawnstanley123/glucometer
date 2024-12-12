import React, { useState,useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, Alert, TouchableOpacity, ScrollView, StyleSheet,Image,ActivityIndicator } from 'react-native';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../../backend/firebaseConfig';
import { addDoc, collection, serverTimestamp ,getDoc,getDocs,doc,query,where,onSnapshot} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FontAwesome } from '@expo/vector-icons';
import { getRoomId } from '../../utils/common';
export  default function DoctorList({ route, navigation }){
    const[doctors,setDoctors] = useState([])
    const [unreadCounts, setUnreadCounts] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
          try {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
      
              const doctorDoc = await getDoc(doc(FIRESTORE_DB, 'patient', user.uid));
              
              if (doctorDoc.exists()) {
                const doctorDataId = doctorDoc.data().doctor[0]
                const doctorsIds = doctorDoc.data()?.doctor
                try {
                    const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'doctor'));
                    const doctorstemp = []
                    querySnapshot.forEach((doc) => {
                        doctorstemp.push(doc.data());
                    });
                    const filteredDoctors = doctorstemp.filter(doctor => doctorsIds.includes(doctor.userId));
                    console.log(filteredDoctors)
                    setDoctors(filteredDoctors);
                    setIsLoading(false);
                  } catch (error) {
                    console.error('Error fetching patients:', error);
                  }
               
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
      useEffect(() => {
        const fetchUnreadMessages = () => {
            const user = FIREBASE_AUTH.currentUser;
            if (!user) return;
            // Fetch unread message counts for each doctor
            doctors.forEach((doctor) => {
              // Query the sub-collection 'messages' inside each 'room'
              const q = query(
                  collection(FIRESTORE_DB, 'rooms', getRoomId(user.uid, doctor.userId), 'messages'),
                  where('userId', '!=', user.uid), // Messages not sent by the current user
                  where('isRead', '==', false)    // Only unread messages
              );
          
              const unsub = onSnapshot(q, (snapshot) => {
                  // The size of the snapshot equals the count of unread messages for the specific room
                  const unreadCount = snapshot.size;
          
                  // Update the state with unread count for the current doctor
                  setUnreadCounts((prevCounts) => ({
                      ...prevCounts,
                      [doctor.userId]: unreadCount, // Map unread count to the doctor ID
                  }));
              });
          });;
        };

        fetchUnreadMessages();
    }, [doctors]);
      const navigateToConsultationForm = async (doctorId) =>{
        navigation.navigate('ConsultationForm', { doctorId: doctorId});
      }
      const navigateToChat = (doctorId,doctorName) => {
        navigation.navigate('ChatRoom', { doctorId,doctorName});
    }
    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-neutral-50">
             <View className="flex flex-row justify-between bg-white px-3 py-2" style={{backgroundColor:'#101929'}}>
                <View>
            <Text className="text-xl text-white flex items-center">Doctors</Text>
                </View>             
            <TouchableOpacity
                onPress={() => FIREBASE_AUTH.signOut()}
                style={{ marginTop: 20 }}
            >
                <Text className="text-white">Log Out</Text>
            </TouchableOpacity>
            </View>
            <View className="m-3 p-3 bg-white rounded-3xl h-[90%] shadow-xl shadow-gray-500">
                {
                    isLoading ? (
                        <ActivityIndicator size="large" color="#101929" />
                    ):(<>
                    {doctors.map((doctor)=>(
                    <View className="flex flex-col items-center  w-full bg-violet-50 shadow-md shadow-gray-200 rounded-2xl" key={doctor?.userId}>
                <View className="flex flex-row items-center w-full p-6">
                <View className="w-[15%]">
                <Image source={require('../../assets/avatar.png')} className="w-20 h-20 rounded-full border border-gray-300"/>
                </View>
                <View className="w-[85%] ml-20">
                    <Text className="text-2xl font-semibold mb-3">{doctor?.name}</Text>
                    <Text className="text-gray-900 text-sm font-semibold">Email</Text>
                    <Text className="text-blue-950 text-sm py-1 font-normal"> {doctor?.email}</Text>
                    {/* <Text className="text-gray-500 text-sm">Age: {patient?.age}</Text> */}                
                            </View>
                </View>
                <View className="flex flex-row">
                <TouchableOpacity className=" p-2 rounded-bl-2xl mt-3 flex-1 flex justify-center items-center border-r border-white" style={{backgroundColor:'#101929'}} onPress={() => navigateToConsultationForm(doctor?.userId)}>
                        <Text className="text-white text-center font-semibold">Consult Doctor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                                className="flex-row items-center bg-zinc-400 p-3 rounded-br-2xl mt-3 flex-1 justify-center" style={{backgroundColor:'#101929'}}
                                onPress={() => navigateToChat(doctor?.userId, doctor?.name)}
                            >
                                {/* Chat Icon */}
                                <View className="relative">
                                    <FontAwesome name="wechat" size={24} color="white" />
                                    {/* Badge for Unread Messages */}
                                    {unreadCounts[doctor.userId] > 0 && (
                                        <View
                                            className="absolute -top-1 -right-2 bg-red-500 h-5 w-5 rounded-full justify-center items-center"
                                        >
                                            <Text className="text-white text-xs font-bold">
                                                {unreadCounts[doctor.userId]}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                    </View>            
                </View>
                ))}
                    </>)
                }
            
            </View>
        </SafeAreaView>
    );
}