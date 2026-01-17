import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import LockScreen from "../components/LockScreen";
import { createTables } from "../database/schema";
import { getBusiness, getReminderTime } from "../services/businessService";
import { initializeNotifications } from "../services/notificationService";

export default function RootLayout() {
   const [initialized, setInitialized] = useState(false);
   const [unlocked, setUnlocked] = useState(false);

   useEffect(() => {
      createTables();
      console.log("Database initialized");
      
      // Initialize notifications
      const business = getBusiness();
      if (business) {
        const reminderTime = getReminderTime(business.id);
        initializeNotifications(reminderTime).catch(console.error);
      }
      
      setInitialized(true);
   }, []);

   // If there's a business with a password and user hasn't unlocked, show lock
   const business = getBusiness();
   const requiresLock = !!business && !!business.password;

   if (!initialized) return null;

   if (requiresLock && !unlocked) {
      return <LockScreen onUnlock={() => setUnlocked(true)} />;
   }

   return (
     <Stack screenOptions={{ headerShown: false }}>
       <Stack.Screen name="index" />
       <Stack.Screen name="business-setup" />
       <Stack.Screen name="dashboard" />
       <Stack.Screen name="products" />
       <Stack.Screen name="settings" />
     </Stack>
   );
}

