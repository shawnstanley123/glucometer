const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNotificationToDoctor = functions.firestore
    .document('consultations/{consultationId}')
    .onCreate(async (snap, context) => {
        const consultation = snap.data();
        const doctorId = consultation.doctorId;

        try {
            const doctorDoc = await admin.firestore().collection('users').doc(doctorId).get();
            if (doctorDoc.exists) {
                const doctorData = doctorDoc.data();
                const payload = {
                    notification: {
                        title: 'New Consultation Request',
                        body: `You have a new consultation request from ${consultation.patientId}.`,
                    },
                };

                if (doctorData.deviceToken) {
                    await admin.messaging().sendToDevice(doctorData.deviceToken, payload);
                }
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    });
