import { Novu, PushProviderIdEnum } from '@novu/node';
import { NOVU_API_KEY } from '../../../config';

export class NovuService {
  private readonly novu: Novu;
  private readonly WORKFLOW = 'push-notification';

  constructor() {
    this.novu = new Novu(NOVU_API_KEY);
  }

  async identifyUser(id: string) {
    await this.novu.subscribers.identify(id, {});
  }

  async setFcmDeviceToken(id: string, deviceToken: string) {
    await this.novu.subscribers.setCredentials(id, PushProviderIdEnum.FCM, {
      deviceTokens: [deviceToken],
    });
  }

  async removeFcmDeviceToken(id: string) {
    await this.novu.subscribers.deleteCredentials(id, PushProviderIdEnum.FCM);
  }

  async triggerNotification(
    payload: { title: string; description: string },
    id: string,
  ) {
    await this.novu.trigger(this.WORKFLOW, {
      to: { subscriberId: id },
      payload,
    });
  }
}

export const novuService = new NovuService();
