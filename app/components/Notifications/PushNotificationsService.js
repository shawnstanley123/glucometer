import * as Notifications from 'expo-notifications';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../../backend/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as NotificationPermissions from 'expo-notifications/build/NotificationPermissions';
export const registerForPushNotificationsAsync = async () => {
  try {
    const { status: existingStatus } = await NotificationPermissions.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await NotificationPermissions.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    const userId = FIREBASE_AUTH.currentUser.uid;
 
    await updateDoc(doc(FIRESTORE_DB, 'users', userId), {
      deviceToken: token,
    });
  } catch (error) {
    console.error('Error fetching push token: ', error);
  }
};

export const sendNotificationToDoctor = async (doctorId, consultationId,username) => {
  try {
    const doctorDoc = await getDoc(doc(FIRESTORE_DB, 'users', doctorId));
    console.log(doctorDoc.data())
    if (doctorDoc.exists()) {
      const doctorData = doctorDoc.data();
      console.log('Doctor data:', doctorData);
      const message = {
        to: doctorData.deviceToken,
        sound: 'default',
        title: 'New Consultation Request',
        body: `You have a new consultation request from ${username}. Consultation ID: ${consultationId}`,
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log('Notification sent successfully');
      } else {
        console.log('Error sending notification: A', response.statusText);
      }
    }
  } catch (error) {
    console.log('Error sending notification: B', error);
  }
};
