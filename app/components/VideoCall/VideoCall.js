import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { RTCPeerConnection,RTCView, mediaDevices } from 'react-native-webrtc';
import { createCall, listenForAnswer, sendAnswer } from '../../utils/signaling';

export default function VideoCall({ route, navigation }) {
    const { callId, doctorId } = route.params; // Getting the callId and doctorId from route params
    const [remoteStream, setRemoteStream] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const peerConnection = useRef(null);
    const localStreamRef = useRef(null);
  
    useEffect(() => {
      // Step 1: Get user media (video and audio)
      const setupLocalStream = async () => {
        const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream;
      };
  
      setupLocalStream();
  
      // Step 2: Set up the peer connection
      peerConnection.current = new RTCPeerConnection();
  
      // Step 3: Add local stream to the connection
      localStream?.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream);
      });
  
      // Step 4: Listen for remote stream
      peerConnection.current.onaddstream = (event) => {
        setRemoteStream(event.stream);
      };
  
      // Step 5: Listen for answer from the doctor
      listenForAnswer(callId, async (answer) => {
        if (answer) {
          await peerConnection.current.setRemoteDescription(answer);
        }
      });
  
      // Step 6: Create an offer if it's the first time connecting
      const createOffer = async () => {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        sendAnswer(callId, offer); // Send the offer to the doctor
      };
  
      createOffer();
  
      return () => {
        // Cleanup on component unmount
        localStream?.getTracks().forEach((track) => track.stop());
        peerConnection.current.close();
      };
    }, [localStream, callId]);
  
    // Step 7: End call
    const endCall = () => {
      // Close peer connection and stop local stream
      localStream?.getTracks().forEach((track) => track.stop());
      peerConnection.current.close();
      navigation.goBack(); // Navigate back to previous screen
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.videoContainer}>
          {localStream && (
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.localVideo}
              mirror={Platform.OS === 'ios' ? true : false} // Optional: mirror the local video
            />
          )}
  
          {remoteStream && (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={styles.remoteVideo}
            />
          )}
        </View>
  
        <View style={styles.controls}>
          <TouchableOpacity onPress={endCall} style={styles.endCallButton}>
            <Text style={styles.endCallText}>End Call</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
      justifyContent: 'center',
    },
    videoContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    localVideo: {
      width: '40%',
      height: 200,
      borderRadius: 10,
      margin: 10,
    },
    remoteVideo: {
      width: '60%',
      height: 200,
      borderRadius: 10,
      margin: 10,
    },
    controls: {
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    endCallButton: {
      backgroundColor: 'red',
      padding: 10,
      borderRadius: 5,
    },
    endCallText: {
      color: 'white',
      fontSize: 18,
    },
  });
