import { REALTIME_DB } from "../../backend/firebaseConfig";
import {ref, set, onValue,push} from "firebase/database";


/**
 * Create a new call and store the WebRTC offer.
 * @param {Object} offer - The WebRTC SDP offer.
 * @returns {string} - The unique call ID.
 */
export const createCall = async (offer) => {
    const callRef = push(ref(REALTIME_DB, 'calls')); // Create a new call reference
    await set(callRef, { offer }); // Store the offer
    return callRef.key; // Return the unique call ID
  };
  
  /**
   * Listen for an answer to a specific call.
   * @param {string} callId - The ID of the call.
   * @param {function} onAnswer - Callback function for the answer.
   */
  export const listenForAnswer = (callId, onAnswer) => {
    onValue(ref(REALTIME_DB, `calls/${callId}/answer`), (snapshot) => {
      if (snapshot.exists()) {
        onAnswer(snapshot.val()); // Invoke the callback with the answer data
      }
    });
  };
  
  /**
   * Send an answer to a specific call.
   * @param {string} callId - The ID of the call.
   * @param {Object} answer - The WebRTC SDP answer.
   */
  export const sendAnswer = async (callId, answer) => {
    await set(ref(REALTIME_DB, `calls/${callId}/answer`), answer); // Store the answer
  };