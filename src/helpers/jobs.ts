import cron from 'node-cron';
import { notificationService } from '../modules';

export function scheduleDailyNotification() {
  cron.schedule('0 11 * * *', async () => {
    // send notifications at 12:00 PM every day
    await notificationService.sendEventsNotifications();
  });
}
