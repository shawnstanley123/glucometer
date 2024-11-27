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
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import ViewConsultation from './app/components/Consultation/ViewConsultation';
import SetAlarms from './app/components/SetAlarms/SetAlarms';
import CreateRoutine from './app/components/Routine/CreateRoutine';
import ShareData from './app/components/ShareData/ShareData';
const Stack = createStackNavigator();
const InsideStack = createStackNavigator();

function InsideLayout() {
  return (
    <InsideStack.Navigator initialRouteName='Test'>
       <InsideStack.Screen name="PatientDetailsForm" component={PatientDetailsForm} options={{ headerShown: false }} />
      <InsideStack.Screen name="Test" component={Testing} options={{ headerShown: false }} />
      <InsideStack.Screen name="Results" component={ResultsScreen} options={{ headerShown: false }} />
      <InsideStack.Screen name="ConsultationForm" component={ConsultationForm} />
      <InsideStack.Screen name="CreateRoutine" component={CreateRoutine} />
      <InsideStack.Screen name="SetAlarms" component={SetAlarms} />
      <InsideStack.Screen name="ShareData" component={ShareData} />
    </InsideStack.Navigator>
  );
}
function DoctorLayout(){
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen name="Test" component={Doctor} options={{ headerShown: false }} />
      <InsideStack.Screen name="PatientDetail" component={PatientDetail} />
      <InsideStack.Screen name="ConsultationDetail" component={ViewConsultation} />
    </InsideStack.Navigator>
  );
}
function UserLayout(){
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen name="Test" component={User} options={{ headerShown: false }} />
      <InsideStack.Screen name="PatientDetail" component={PatientDetail} />
    </InsideStack.Navigator>
  );
}

function App() {
  const { user, role } = useAuth();
  return (
    <NavigationContainer>
      <GestureHandlerRootView>
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
    </GestureHandlerRootView>
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
