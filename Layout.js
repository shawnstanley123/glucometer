// src/App.js

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Testing from './app/components/Testing/Testing'; 
import ResultsScreen from './app/components/Results/Results';
import Header from './app/components/Header/Header';
import Register from './app/components/Register/Register';
import User from './app/components/User/User'
import { AuthProvider, useAuth } from './context/AuthContext';
import Doctor from './app/components/Doctor/Doctor';
import ConsultationForm from './app/components/Consultation/ConsultationFrom';
import PatientDetailsForm from './app/components/PatientDetails/PatientDetailsForm';
import PatientDetail from './app/components/PatientDetail/PatientDetail';
const Stack = createStackNavigator();
const InsideStack = createStackNavigator();

function InsideLayout() {
  return (
    <InsideStack.Navigator initialRouteName='Test'>
       <InsideStack.Screen name="PatientDetailsForm" component={PatientDetailsForm} options={{ headerShown: false }} />
      <InsideStack.Screen name="Test" component={Testing} options={{ headerShown: false }} />
      <InsideStack.Screen name="Results" component={ResultsScreen} options={{ headerShown: false }} />
      <InsideStack.Screen name="ConsultationForm" component={ConsultationForm} />
      
    </InsideStack.Navigator>
  );
}
function DoctorLayout(){
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen name="Test" component={Doctor} options={{ headerShown: false }} />
      <InsideStack.Screen name="PatientDetail" component={PatientDetail} />
    </InsideStack.Navigator>
  );
}
function UserLayout(){
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen name="Test" component={User} options={{ headerShown: false }} />
      
    </InsideStack.Navigator>
  );
}

function App() {
  const { user, role } = useAuth();
console.log(role)
  return (
    <NavigationContainer>
      <Header />
      <Stack.Navigator initialRouteName="Register">
        {user ? (
          role === 'doctor' ? (
            <Stack.Screen name="DoctorDashboard" component={DoctorLayout} options={{ headerShown: false }} />
          ) : role === 'patient' ? (
            <>
           
            <Stack.Screen name="PatientDashboard" component={InsideLayout} options={{ headerShown: false }} />
            </>
          ) : role === 'accuser' ? (
            <Stack.Screen name="AccuserDashboard" component={UserLayout} options={{ headerShown: false }} />
          ) : (
            // Add more role-based conditions if needed
            <Stack.Screen name="Inside" component={InsideLayout} options={{ headerShown: false }} />
          )
        ) : (
          <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
