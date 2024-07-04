import React,{useState,useEffect} from 'react';
import { Text,SafeAreaView ,View,Button,TouchableOpacity, ImageBackground } from 'react-native';
import { FIREBASE_AUTH } from '../../../backend/firebaseConfig';
export default function Doctor({navigation}) {
  return (
    <View>
        <Text>Doctor</Text>
        <TouchableOpacity
        onPress={() => FIREBASE_AUTH.signOut()}
      ><Text>Log Out</Text>
        </TouchableOpacity>
       
    </View>
  )
}
