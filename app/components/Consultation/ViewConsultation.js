import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, View, TouchableOpacity, Alert, Modal, TextInput, ScrollView, StyleSheet, Platform } from 'react-native';
import { query, where, getDocs, collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../backend/firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ViewConsultation({ navigation }) {
  const [consultations, setConsultations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [routineStack, setRoutineStack] = useState([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState(null);
  const [selectedUserId,setSelectedUserId] = useState(null)
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          const consultationQuery = query(collection(FIRESTORE_DB, 'consultations'), where('doctorId', '==', user.uid), where('status', '==', 'pending'));
          const consultationSnapshot = await getDocs(consultationQuery);

          const consultationsData = consultationSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setConsultations(consultationsData);
        }
      } catch (error) {
        console.error("Error fetching consultations:", error);
        Alert.alert('Error', 'Failed to fetch consultations. Please try again.');
      }
    };

    fetchConsultations();
  }, []);

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
      const consultationDocRef = doc(FIRESTORE_DB, 'consultations', selectedConsultationId);
      await updateDoc(consultationDocRef, {
        status: 'complete',
      });
  
      // Clear routineStack and close modal
      setIsModalVisible(false);
      resetStack();
    } catch (error) {
      console.error('Error submitting routines and updating consultation:', error);
      Alert.alert('Error', 'Failed to submit routines and update consultation. Please try again.');
    }
  };
  

  const resetStack = () => {
    setRoutineStack([]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.container} >
          <Text style={styles.title}>Consultations</Text>
          {consultations.map(consultation => (
            <View key={consultation.id} style={styles.consultationItem}>
              <Text style={styles.patientName}>Patient Name: {consultation.patientName}</Text>
              <Text style={styles.details}>Age: {consultation.age}</Text>
              <Text style={styles.details}>Blood Sugar Level: {consultation.bloodSugarLevel}</Text>
              <Text style={styles.details}>Height: {consultation.height}</Text>
              <Text style={styles.details}>Weight: {consultation.weight}</Text>
              <Text style={styles.details}>Notes: {consultation.patientNotes}</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => {
                  setSelectedConsultationId(consultation.id);
                  setSelectedUserId(consultation.patientId)
                  setIsModalVisible(true);
                }}
              >
                <Text style={styles.buttonText}>Create Routine</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
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
        className="flex-[0.2] bg-blue-500 p-2 rounded-md justify-center items-center"
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
                style={[styles.button, { backgroundColor: '#2196F3' }]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#FF0000' }]}
                onPress={() => {
                  setIsModalVisible(false);
                  resetStack();
                }}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
