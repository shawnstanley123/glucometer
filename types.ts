interface User {
    _redirectEventId?: undefined;
    apiKey: string;
    appName: string;
    createdAt: string;
    displayName?: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    lastLoginAt: string;
    phoneNumber?: string;
    photoURL?: string;
    providerData: {
        // Assuming this is an array of objects with specific properties, adjust as needed
        [key: string]: any; // Or provide a more specific type if known
    }[];
    stsTokenManager: {
        accessToken: string;
        expirationTime: number;
        refreshToken: string;
    };
    tenantId?: string;
    uid: string;
  }