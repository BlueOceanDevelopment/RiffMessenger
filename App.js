// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
// import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import './config/firebase';
import RootNavigation from './navigation';

// import LandingPage from './LandingPage';
// import Constants from 'expo-constants';
// import axios from 'axios';
// import Register1 from './Register1'
// import MainPage from './MainPage'

const Stack = createNativeStackNavigator();

// export default function App() {
  // const [testData, setTestData] = useState('initial Data');
  // useEffect(() => {
  //   axios.get(`${Constants.expoConfig.extra.apiUrl}/test`)// look in app.config.js to configure this variable
  //     .then((response) => {
  //       setTestData(response.data);
  //     })
  //     .catch((err) => {
  //       console.log('ERROR :', err.message);
  //     })
  // }, []);

  // return (
  //   <NavigationContainer>
  //     <Stack.Navigator initialRouteName="Landing">

  //       <Stack.Screen
  //         name="Landing"
  //         component={LandingPage}
  //         options={{title: 'Riff', headerShown: false}}
  //       />

  //       <Stack.Screen
  //         name="Register1"
  //         component={Register1}
  //         options={{title: 'Register', headerShown: false}}
  //       />

  //     </Stack.Navigator>
  //     <StatusBar style="auto" />
  //   </NavigationContainer>
  // );
// }

  export default function App() {
    return (
      <RootNavigation />
    );
  }