import { MsalOptions } from './types';
import { Msal } from './src/msal';
import { msalPluginSymbol } from './useAPI';

export default class MsalAuth {
  static install(app: any, options: MsalOptions) {
    if (!options.auth || !options.auth.clientId) {
      throw new Error('auth.clientId is required');
    }

    var auth = new Msal(options);

    app.config.globalProperties.$auth;
    app.provide(msalPluginSymbol, auth);
  }
}
