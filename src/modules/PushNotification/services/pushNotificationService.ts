import { NOVU_API_KEY } from '../../../config';
import { Novu, PushProviderIdEnum } from '@novu/node';
import { userService } from '../../User';

export class PushNotificationService {
  private readonly WORKFLOW = 'digest-workflow-example';
  async registerUsersToNovu() {
    try {
      const novu = new Novu(NOVU_API_KEY);
      const usersDeviceToken = await userService.findUsersDeviceToken();
      usersDeviceToken.forEach(async (UserAndToken) => {
        try {
          await novu.subscribers.get(UserAndToken.id.toString());
        } catch {
          await novu.subscribers.identify(UserAndToken.id.toString(), {});
          if (UserAndToken.DeviceToken?.token) {
            await novu.subscribers.setCredentials(
              UserAndToken.id.toString(),
              PushProviderIdEnum.FCM,
              { deviceTokens: [UserAndToken?.DeviceToken?.token] },
            );
          }
        }
      });
    } catch {
      throw new Error();
    }
  }

  async notificationsTrigger(
    payload: { title: string; description: string },
    id: string,
  ) {
    try {
      const novu = new Novu(NOVU_API_KEY);
      await novu.trigger(this.WORKFLOW, {
        to: { subscriberId: id },
        payload: { title: payload.title, description: payload.description },
      });
      console.log('Notification sent successfully');
    } catch {
      throw new Error();
    }
  }
}

export const pushNotificationService = new PushNotificationService();
