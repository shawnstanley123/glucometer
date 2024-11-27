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
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, 
    shouldPlaySound: true, 
    shouldSetBadge: false, 
  }),
});
export const sendNotificationToUser = async (userId,bloodSugarLevel,username) => {
  try {
    const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
    console.log(userDoc.data())
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('Doctor data:', userData);
      let title = '';
      let condition = '';
      if(bloodSugarLevel < 70){
        title = 'Low Blood Sugar Level';
        condition = 'Hypoglycemia'
      }
      else if(bloodSugarLevel > 180){
        title = 'High Blood Sugar Level';
        condition = 'Hyperglycemia'
        }
      const message = {
        to: userData.deviceToken,
        sound: 'default',
        title: title,
        body: `${username}. is under ${condition} \n Blood sugar level: ${bloodSugarLevel}`,
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
        //
      } else {
        console.log('Error sending notification: A', response.statusText);
      }
    }
  } catch (error) {
    console.log('Error sending notification: B', error);
  }
};
