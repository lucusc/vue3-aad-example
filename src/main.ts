import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import MsalAuth from '@/plugins/msal-auth';
import { InteractionType, LogLevel } from '@azure/msal-browser';

createApp(App)
  .use(router)
  .use(MsalAuth, {
    framework: {
      globalMixin: true,
      interactionType: InteractionType.Popup,
    },
    auth: {
      clientId: process.env.VUE_APP_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${process.env.VUE_APP_TENANT_ID}`,
      redirectUri: 'http://localhost:8080',
      navigateToLoginRequestUrl: true,
    },
    loginRequest: {
      scopes: process.env.VUE_APP_SCOPES.split(','),
    },
    cache: {
      cacheLocation: 'localStorage',
    },
    system: {
      loggerOptions: {
        loggerCallback: (level: any, message: string, containsPii: boolean): void => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              return;
            case LogLevel.Info:
              console.info(message);
              return;
            case LogLevel.Verbose:
              console.debug(message);
              return;
            case LogLevel.Warning:
              console.warn(message);
              return;
          }
        },
        piiLoggingEnabled: false,
      },
    },
  })
  .mount('#app');
