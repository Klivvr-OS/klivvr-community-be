import { Novu, PushProviderIdEnum } from '@novu/node';
import { NOVU_API_KEY } from '../../../config';
import { userService } from '../../User';

export class NovuService {
  private readonly novu: Novu;
  private readonly WORKFLOW = 'digest-workflow-example';

  constructor() {
    this.novu = new Novu(NOVU_API_KEY);
  }

  async registerUsersToNovu() {
    try {
      const usersDeviceToken = await userService.findUsersDeviceToken();
      usersDeviceToken.forEach(async (UserAndToken) => {
        try {
          await this.novu.subscribers.get(UserAndToken.id.toString());
        } catch {
          await this.novu.subscribers.identify(UserAndToken.id.toString(), {});
          if (UserAndToken.DeviceToken?.token) {
            await this.novu.subscribers.setCredentials(
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
      await this.novu.trigger(this.WORKFLOW, {
        to: { subscriberId: id },
        payload: { title: payload.title, description: payload.description },
      });
      console.log('Notification sent successfully');
    } catch {
      throw new Error();
    }
  }
}

export const novuService = new NovuService();
