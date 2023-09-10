import cron from 'node-cron';
import { notificationService, pushNotificationService } from '../modules';

export function eventsNotificationsEveryDay() {
  cron.schedule('0 11 * * *', async () => {
    // send notifications at 12:00 PM every day
    await pushNotificationService.registerUsersToNovu();
    await notificationService.sendEventsNotifications();
  });
}
