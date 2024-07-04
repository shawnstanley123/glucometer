import React, { useState } from 'react';
import { TextInput, Button, Text, View } from 'react-native';
import {FIREBASE_AUTH} from '../../../backend/firebaseConfig'
import { FIRESTORE_DB } from '../../../backend/firebaseConfig';
import { createUserWithEmailAndPassword ,signInWithEmailAndPassword} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [login,setLogin] = useState(true)

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      await setDoc(doc(FIRESTORE_DB, 'users', userCredential.user.uid), {
        userId: userCredential.user.uid,
        name,
        email,
        role: 'patient',
        deviceToken: '', // Update with actual device token if available
      });
      alert('Registration successful!');
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
