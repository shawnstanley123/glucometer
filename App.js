import { StyleSheet, Text, View,SafeAreaView,Platform,StatusBar } from 'react-native';
import {useLayout,useDeviceOrientation} from '@react-native-community/hooks'
import Testing from './app/components/Testing/Testing';
import Layout from './Layout'
export default function App() {
  console.log(useDeviceOrientation());
  return (
    <SafeAreaView className="flex-1 h-full ">
     <Layout/>
    </SafeAreaView> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  header: {
    width: '100%',
    height: '5%',
    backgroundColor: 'blue',
    color: 'white',
  }
});
