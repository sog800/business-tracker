import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

// Schedule daily reminder
export async function scheduleDailyReminder(time: string): Promise<void> {
  // Cancel any existing reminders
  await cancelDailyReminder();
  
  // Parse time (format: "HH:MM")
  const [hours, minutes] = time.split(':').map(Number);
  
  // Schedule notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Time to Track Your Business!',
      body: 'Update your products and record today\'s sales.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
}

// Cancel daily reminder
export async function cancelDailyReminder(): Promise<void> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of notifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}

// Initialize notifications (call on app startup)
export async function initializeNotifications(reminderTime: string): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  
  if (hasPermission) {
    await scheduleDailyReminder(reminderTime);
  }
}
