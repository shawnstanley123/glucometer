import React, { useState,useEffect } from 'react';
import { TextInput, Button, Text, View } from 'react-native';
import {FIREBASE_AUTH} from '../../../backend/firebaseConfig'
import { FIRESTORE_DB } from '../../../backend/firebaseConfig';
import { createUserWithEmailAndPassword ,signInWithEmailAndPassword} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import DropdownComponent from '../DropDown/Dropdown';
const Register = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [login,setLogin] = useState(true)
  const [selectedOption, setSelectedOption] = useState(null);
  const role = [
    { label: 'User', value: 'accuser' },
    { label: 'Patient', value: 'patient' },
    { label: 'Doctor', value: 'doctor' },
  ];
  const getDefaultOptionForFilter = () => {
   
    return role[0].value; // Default to null if no filter selected
  };
  useEffect(() => {
   
      setSelectedOption(getDefaultOptionForFilter()); // Set default option based on selected filter
   
  }, []);
  function generateFriendCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let friendCode = '';
    for (let i = 0; i < length; i++) {
        friendCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return friendCode;
}
  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      await setDoc(doc(FIRESTORE_DB, 'users', userCredential.user.uid), {
        userId: userCredential.user.uid,
        name,
        email,
        role: selectedOption,
        deviceToken: '', // Update with actual device token if available
      });
      const friendCode = generateFriendCode();
      let documentData = {
        userId: userCredential.user.uid,
        name,
        email,
        friendCode,
    };
    
    switch (selectedOption) {
        case 'accuser':
            documentData.patient = [];

            break;
        case 'patient':
            documentData.user = [];
            documentData.doctor = [];
            break;
        case 'doctor':
            documentData.patient = [];
            break;
        default:
            console.error(`Unknown option: ${selectedOption}`);
    }
    
    await setDoc(doc(FIRESTORE_DB, selectedOption, userCredential.user.uid), documentData);
    if (selectedOption === 'patient') {
      console.log(userCredential.user.uid)
      navigation.navigate('PatientDetailsForm', { userId: userCredential.user.uid ,name:name});
    } else {
      alert('Registration successful!');
    }
    } catch (error) {
      console.error('Error during registration:', error); 
      alert('Registration failed.');
    }
  };
  const handleLogin = async () =>{
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH,email, password);
      alert('Login successful!');
      setLogin(false);
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed.');
    }
  }

  return (
    <View>
       { !login && <View>
      <TextInput 
        placeholder="Name" 
        onChangeText={setName} 
        value={name} 
      />
      <TextInput 
        placeholder="Email" 
        onChangeText={setEmail} 
        value={email} 
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput 
        placeholder="Password" 
        secureTextEntry 
        onChangeText={setPassword} 
        value={password} 
      />
        <DropdownComponent
        data={role}
            placeholder="Select option"
            searchPlaceholder="Search option"
            onSelect={(value) => setSelectedOption(value)}
            defaultValue={getDefaultOptionForFilter()}
          />
          <Text>{selectedOption}</Text>
      <Button 
        title="Register" 
        onPress={handleRegister} 
      />
      </View>}
      {login && (
        <View>
       
        <TextInput 
          placeholder="Email" 
          onChangeText={setEmail} 
          value={email} 
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput 
          placeholder="Password" 
          secureTextEntry 
          onChangeText={setPassword} 
          value={password} 
        />
      
        <Button 
          title="Login" 
          onPress={handleLogin} 
        />
        
        </View>
      )}
    </View>
  );
};

export default Register;
