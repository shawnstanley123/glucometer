import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, FlatList, StyleSheet,ScrollView } from 'react-native';
import { FIRESTORE_DB,FIREBASE_AUTH } from '../../../backend/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, Timestamp, doc ,getDoc,getDocs} from 'firebase/firestore';
import {Feather} from '@expo/vector-icons'
import {getRoomId} from '../../utils/common'
import MessageItem from './MessageItem';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
export default function ChatRoom({ route }) {
    const { doctorId,doctorName} = route.params;
    const user = FIREBASE_AUTH.currentUser;
    const {testUser} = useAuth() 
    const [messages, setMessages] = useState([]);
    const textRef = useRef()
    const inputRef = useRef()
    const scrollViewRef = useRef(null);
    const [userA,setUserA] = useState(null)
    const [messageText, setMessageText] = useState('');
    useEffect(()=>{
        createRoomIfNotExists();
        const fetchPatientDetails = async () => {
            try {
              const patientDoc = await getDoc(doc(FIRESTORE_DB, 'patientDetails', user?.uid));
              if (patientDoc.exists()) {
                setUserA(patientDoc.data());
              } else {
                console.log("No such document!");
              }
            } catch (error) {
              console.error("Error getting document:", error);
            }
          };
          
          fetchPatientDetails();
          let roomId = getRoomId(user?.uid, doctorId);
          const docRef = doc(FIRESTORE_DB,"rooms", roomId);
          const messagesRef = collection(docRef,"messages");
          const q  = query(messagesRef,orderBy("createdAt","asc"));
          let unsub = onSnapshot(q,(snapshot)=>{
            let allMessages = snapshot?.docs?.map(doc=>{
                return doc?.data()
            });
            setMessages([...allMessages]);
          })
          return unsub
    },[]);
    useEffect(() => {
        markMessagesAsRead();
    }, [messages]);
    useEffect(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, [messages]); 
    const createRoomIfNotExists = async () => {
        let roomId = getRoomId(user?.uid, doctorId);
        await setDoc(doc(FIRESTORE_DB,"rooms",roomId),{
            roomId,
            createdAt : Timestamp.fromDate(new Date())
        });
    }
    const handleSendMessage = async () => {
        let message = textRef?.current
        if(!message) return;
        try{
            let roomId = getRoomId(user?.uid, doctorId);
            const docRef = doc(FIRESTORE_DB,'rooms',roomId);
            const messagesRef = collection(docRef,"messages");
            textRef.current = '';
            if(inputRef.current) inputRef.current.clear();
            const newDoc = await addDoc(messagesRef,{
                userId: user?.uid,
                text: message,
                createdAt: Timestamp.fromDate(new Date()),
                isRead: false,
            })
        }catch(err){
            console.log(err)
        }
    }
    const markMessagesAsRead = async () => {
        try {
            let roomId = getRoomId(user?.uid, doctorId);
            const docRef = doc(FIRESTORE_DB, 'rooms', roomId);
            const messagesRef = collection(docRef, 'messages');
    
            // Query messages sent to the current user and unread
            const q = query(messagesRef, where('userId', '!=', user?.uid), where('isRead', '==', false));
    
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => {
                await setDoc(doc.ref, { isRead: true }, { merge: true });
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }; 
    return (
        <SafeAreaView style={{ flex: 1, padding: 2 }}>
            <View className="bg-white p-4 border-b border-gray-300">
                <Text className="text-lg font-bold text-center">{doctorName}</Text>
            </View>
            <ScrollView   ref={scrollViewRef} showVerticalScrollIndicator={false} contentContainerStyle={{paddingTop:10,paddingBottom:45}}>
                {
                    messages.map((message, index) => {
                        return <MessageItem message={message} key={index} currentUser={user?.uid}/>
                    })
                }
            </ScrollView>
                <View className="absolute bottom-0 flex-row justify-between bg-white border p-2 m-2 border-neutral-300 rounded-full">
                    <TextInput placeholder='Type message...'  ref={inputRef} onChangeText={value => textRef.current = value} className="flex-1"/>
                    <TouchableOpacity className="bg-neutral-200 p-2 mr-[1px] rounded-full" onPress={handleSendMessage}>
                        <Feather name="send" color="#737373"/>
                    </TouchableOpacity>
                </View>
            {/* */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    message: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
        maxWidth: '80%',
    },
    sentMessage: {
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
    },
    receivedMessage: {
        backgroundColor: '#E5E5EA',
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 10,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#0084FF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
