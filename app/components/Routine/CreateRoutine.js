import {  Text, SafeAreaView, View, TouchableOpacity, Alert, Modal, TextInput, ScrollView, StyleSheet, Platform} from 'react-native';
import React, { useEffect ,useState} from 'react';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../../backend/firebaseConfig';
import { query, where, getDocs, collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
const CreateRoutine = () => {
    const [consultations, setConsultations] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [routineStack, setRoutineStack] = useState([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState(null);
  const [selectedUserId,setSelectedUserId] = useState(null)
  const handleAddRoutine = () => {
    if (description.trim() === '') {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }

    const newRoutine = {
      description: description,
      time: date.toLocaleTimeString(),
    };

    setRoutineStack([...routineStack, newRoutine]);
    setDescription('');
    setDate(new Date());
    setText('');
  };

  const onChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      let tempDate = new Date(selectedDate);
      let hours = String(tempDate.getHours()).padStart(2, '0');
      let minutes = String(tempDate.getMinutes()).padStart(2, '0');
      let formattedTime = `${hours}:${minutes}`;
      setText(formattedTime);
    }
  };

  const showPicker = () => {
    setShowDatePicker(true);
  };
    const handleSubmit = async () => {
        try {
          // Reference to the routines collection
          const routinesRef = collection(FIRESTORE_DB, 'routines');
          
          // Query to check if a document with the specified userId exists
          const q = query(routinesRef, where('userId', '==', selectedUserId));
          const querySnapshot = await getDocs(q);
      
          if (!querySnapshot.empty) {
            // Document found, update it
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, {
              routines: routineStack, // Overwrite existing routines
            });
          } else {
            // No document found, create a new one
            await addDoc(routinesRef, {
              userId: selectedUserId,
              routines: routineStack,
            });
          }
      
          // Update the consultation document's status to complete
      
          // Clear routineStack and close modal
          resetStack();
        } catch (error) {
          console.error('Error submitting routines and updating consultation:', error);
          Alert.alert('Error', 'Failed to submit routines and update consultation. Please try again.');
        }
      };
      const resetStack = () => {
        setRoutineStack([]);
      };
  useEffect(() => {
    const fetchUserId = async () => {
        try {
          const user = FIREBASE_AUTH.currentUser;
          if (user) {
         
            setSelectedUserId(user.uid)
          }
        } catch (error) {
          console.error("Error fetching consultations:", error);
          Alert.alert('Error', 'Failed to fetch consultations. Please try again.');
        }
      };
  
      fetchUserId();
  }, []);

  return (
    <View>
        <View className="bg-white rounded-lg m-4 shadow-md shadow-gray-600">
          <View className="p-4">
            <Text style={styles.modalTitle}>Create Routine</Text>
            <View className="flex flex-row gap-2 p-1">
      <View className="flex-1">
        <TextInput
          className="bg-gray-100 p-2 rounded-md w-full"
          placeholder="Enter Description"
          value={description}
          onChangeText={setDescription}
        />
      </View>
      <View className="flex-[0.45]">
      <TouchableOpacity
          className="bg-gray-100 p-2 rounded-md w-full justify-center"
          onPress={showPicker}
        >
          <TextInput
            className="text-gray-700"
            value={text}
            placeholder="Time"
            editable={false} // Makes the TextInput non-editable
            pointerEvents="none" // Prevents interaction with the TextInput
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="default"
            onChange={onChange}
          />
        )}
      </View>
      <TouchableOpacity
        className="flex-[0.2] p-2 rounded-md justify-center items-center" style={{backgroundColor:"#101929"}}
        onPress={handleAddRoutine}
      >
        <Text className="text-white font-bold">Add</Text>
      </TouchableOpacity>
    </View>
            <ScrollView className="w-full p-1">
            {routineStack.map((item, index) => (
        <View key={index} className="flex-row items-center border-b border-gray-300 py-2">
          <View className="flex-3">
            <Text className="text-base">{item.description}</Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-base">{item.time}</Text>
          </View>
        </View>
      ))}
            </ScrollView>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#101929' }]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
    </View>
  );
};
const styles = StyleSheet.create({
    container: {
      margin: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    consultationItem: {
      marginBottom: 24,
    },
    patientName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    details: {
      fontSize: 14,
      marginBottom: 4,
    },
    createButton: {
      backgroundColor: '#2196F3',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      marginBottom: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      width: '80%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    stackContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    stackItem: {
      flex: 1,
      marginRight: 10,
    },
    input: {
      borderColor: 'gray',
      borderWidth: 1,
      padding: 10,
      borderRadius: 5,
      flex: 1,
      marginRight: 10,
    },
    addButton: {
      backgroundColor: '#2196F3',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stackList: {
      maxHeight: 150,
      marginBottom: 10,
      width: '100%',
    },
    stackListItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 10,
    },
    button: {
      flex: 1,
      backgroundColor: '#2196F3',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 5,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });
export default CreateRoutine;
