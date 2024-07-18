import React, { useState, useEffect } from "react";
import { TextInput, Button, Text, View } from "react-native";
import { FIREBASE_AUTH } from "../../../backend/firebaseConfig";
import { FIRESTORE_DB } from "../../../backend/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import DropdownComponent from "../DropDown/Dropdown";
import { TouchableOpacity } from "react-native-gesture-handler";
const Register = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [login, setLogin] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const role = [
    { label: "User", value: "accuser" },
    { label: "Patient", value: "patient" },
    { label: "Doctor", value: "doctor" },
  ];
  const getDefaultOptionForFilter = () => {
    return role[0].value; // Default to null if no filter selected
  };
  useEffect(() => {
    setSelectedOption(getDefaultOptionForFilter()); // Set default option based on selected filter
  }, []);
  function generateFriendCode(length = 8) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let friendCode = "";
    for (let i = 0; i < length; i++) {
      friendCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return friendCode;
  }
  const switchLogin = () => {
    setLogin(!login);
  }
  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      await setDoc(doc(FIRESTORE_DB, "users", userCredential.user.uid), {
        userId: userCredential.user.uid,
        name,
        email,
        role: selectedOption,
        deviceToken: "", // Update with actual device token if available
      });
      const friendCode = generateFriendCode();
      let documentData = {
        userId: userCredential.user.uid,
        name,
        email,
        friendCode,
      };

      switch (selectedOption) {
        case "accuser":
          documentData.patient = [];

          break;
        case "patient":
          documentData.user = [];
          documentData.doctor = [];
          break;
        case "doctor":
          documentData.patient = [];
          break;
        default:
          console.error(`Unknown option: ${selectedOption}`);
      }

      await setDoc(
        doc(FIRESTORE_DB, selectedOption, userCredential.user.uid),
        documentData
      );
      if (selectedOption === "patient") {
        console.log(userCredential.user.uid);
        navigation.navigate("PatientDetailsForm", {
          userId: userCredential.user.uid,
          name: name,
        });
      } else {
        alert("Registration successful!");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed.");
    }
  };
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      alert("Login successful!");
      setLogin(false);
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed.");
    }
  };

  return (
    <View className="p-10 w-full m-auto">
      {!login && (
        <View>
          <Text className="font-semibold text-base text-center mb-5">
            Register
          </Text>
          <TextInput
            placeholder="Name"
            onChangeText={setName}
            value={name}
            className="border border-gray-600 p-2 rounded mb-5 bg-white"
          />
          <TextInput
            placeholder="Email"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            className="border border-gray-600 p-2 rounded mb-5 bg-white"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
            className="border border-gray-600 p-2 rounded mb-5 bg-white"
            value={password}
          />
          <View className="mb-5">
            <DropdownComponent
              data={role}
              placeholder="Select option"
              searchPlaceholder="Search option"
              onSelect={(value) => setSelectedOption(value)}
              defaultValue={getDefaultOptionForFilter()}
            />
          </View>
          <TouchableOpacity
            title="Register"
            onPress={handleRegister}
            className="bg-slate-600 py-3 rounded-lg"
          >
            <Text className="text-center text-white text-base">REGISTER</Text>
          </TouchableOpacity>
          <Text onPress={switchLogin} className="mt-5 text-slate-600">Already an user?&nbsp;Login here</Text>
        </View>
      )}
      {login && (
        <View>
          <Text className="font-semibold text-base text-center mb-5">
            Login
          </Text>
          <TextInput
            placeholder="Email"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-gray-600 p-2 rounded mb-5 bg-white"
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            className="border border-gray-600 p-2 rounded mb-5 bg-white"
          />
          <TouchableOpacity
            title="Register"
            onPress={handleLogin}
            className="bg-slate-600 py-3 rounded-lg"
          >
            <Text className="text-center text-white text-base">LOGIN</Text>
          </TouchableOpacity>
          <Text onPress={switchLogin} className="mt-5 text-slate-600">Haven't registered yet?&nbsp;Register here</Text>
        </View>
      )}
    </View>
  );
};

export default Register;
