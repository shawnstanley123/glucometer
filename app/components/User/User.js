import React, { useState } from 'react';
import { Text, SafeAreaView, View, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../backend/firebaseConfig'; 
import { doc, getDoc, updateDoc, query, where, getDocs, arrayUnion, collection } from 'firebase/firestore';

export default function Doctor({ navigation }) {
    const [friendCode, setFriendCode] = useState('');
    const [loading, setLoading] = useState(false);

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
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Link Friend</Text>
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: '80%', marginVertical: 10, paddingHorizontal: 10 }}
                placeholder="Friend Code"
                value={friendCode}
                onChangeText={setFriendCode}
                autoCapitalize='characters'
            />
            <Button title={loading ? "Updating..." : "Update"} onPress={handleUpdate} disabled={loading} />
            <TouchableOpacity
                onPress={() => FIREBASE_AUTH.signOut()}
                style={{ marginTop: 20 }}
            >
                <Text>Log Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
