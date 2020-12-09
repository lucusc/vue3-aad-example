import { FrameworkOptions, iMsal, MsalOptions, AuthData } from '../types';
import { reactive } from 'vue';
import {
  Configuration,
  AccountInfo,
  AuthenticationResult,
  PublicClientApplication,
  RedirectRequest,
  PopupRequest,
  SilentRequest,
  SsoSilentRequest,
  EndSessionRequest,
  InteractionRequiredAuthError,
  InteractionType,
} from '@azure/msal-browser';

export class Msal implements iMsal {
  private msalLibrary: PublicClientApplication;
  private frameworkOptions: FrameworkOptions;
  private loginRequest: PopupRequest | RedirectRequest | SsoSilentRequest;
  private accountInfo: AccountInfo | null;
  private accessTokenRequest: SilentRequest;

  private defaultFrameworkOptions: FrameworkOptions = {
    interactionType: InteractionType.Redirect,
    loginOnLoad: true,
  };

  private defaultLoginRequest: RedirectRequest = { scopes: [] };
  private defaultAccessTokenRequest: SilentRequest = {
    scopes: [],
    account: { environment: '', homeAccountId: '', localAccountId: '', tenantId: '', username: '' },
  };
  constructor(options: MsalOptions) {
    let config: Configuration = {
      auth: options.auth,
      system: options.system,
      cache: options.cache,
    };

    this.frameworkOptions = { ...this.defaultFrameworkOptions, ...options.framework };
    this.loginRequest = { ...this.defaultLoginRequest, ...options.loginRequest };

    this.msalLibrary = new PublicClientApplication(config);
    // check if we are already logged in
    this.accountInfo = this.getAccount();

    this.accessTokenRequest = { ...this.defaultAccessTokenRequest, ...options.accessTokenRequest };

    if (this.accountInfo) {
      this.accessTokenRequest.account = this.accountInfo;
      this.acquireTokenSilent();
    } else if (options.framework.loginOnLoad) {
      this.signIn();
    }
  }

  public data: AuthData = reactive({
    isAuthenticated: false,
    accessToken: '',
    idToken: '',
    user: { name: '', userName: '', email: '' },
    account: { environment: '', homeAccountId: '', localAccountId: '', tenantId: '', username: '' },
  });

  async signIn(): Promise<void> {
    switch (this.frameworkOptions.interactionType) {
      case InteractionType.Popup:
        this.msalLibrary.loginPopup(this.loginRequest as PopupRequest).then((response) => this.handleReponse(this, response));
        break;
      case InteractionType.Redirect:
        // make sure that the handle redirect is setup
        this.msalLibrary.handleRedirectPromise().then((response) => this.handleReponse(this, response));
        this.msalLibrary.loginRedirect(this.loginRequest as RedirectRequest);
        break;
      case InteractionType.Silent:
        this.msalLibrary.ssoSilent(this.loginRequest as SsoSilentRequest);
        break;
      default:
        throw 'Invalid interation type provided.';
    }
  }

  /**
   * Calls getAllAccounts and determines the correct account to sign into, currently defaults to first account found in cache.
   * TODO: Add account chooser code
   *
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
   */
  private getAccount(): AccountInfo | null {
    const currentAccounts = this.msalLibrary.getAllAccounts();
    if (currentAccounts === null || currentAccounts.length === 0) {
      console.log('No accounts detected');
      return null;
    } else if (currentAccounts.length > 1) {
      // Add choose account code here
      console.log('Multiple accounts detected using the first one, need to add choose account code.');
      return currentAccounts[0];
    } else {
      return currentAccounts[0];
    }
  }

  private handleReponse(msal: Msal, response: AuthenticationResult | null) {
    if (response !== null) {
      msal.data.account = response.account;
      msal.accessTokenRequest.account = response.account;

      msal.data.accessToken = response.accessToken;
      msal.data.idToken = response.idToken;
      msal.data.isAuthenticated = true;
      msal.data.user.name = response.account.name ?? '';
      msal.data.user.userName = response.account.username;
    } else {
      msal.data.account = msal.getAccount();
      this.accessTokenRequest.account = msal.data.account;
    }
  }

  async signOut(): Promise<any> {
    const logOutRequest: EndSessionRequest = {
      account: this.accountInfo ?? undefined,
    };

    return this.msalLibrary.logout(logOutRequest);
  }

  async acquireTokenSilent(): Promise<void> {
    try {
      const response: AuthenticationResult = await this.msalLibrary.acquireTokenSilent(this.accessTokenRequest);
      this.handleReponse(this, response);
    } catch (e) {
      console.log('silent token acquisition fails.');
      if (e instanceof InteractionRequiredAuthError) {
        console.log('acquiring token using redirect');
        switch (this.frameworkOptions.interactionType) {
          case InteractionType.Popup:
          case InteractionType.Silent:
            return await this.msalLibrary.acquireTokenPopup(this.loginRequest as PopupRequest).then((response) => this.handleReponse(this, response));
          case InteractionType.Redirect:
            return await this.msalLibrary.acquireTokenRedirect(this.loginRequest as RedirectRequest);
          default:
            throw 'Invalid interation type provided';
        }
      } else {
        console.error(e);
        return Promise.reject(e);
      }
    }
  }

  isAuthenticated(): boolean {
    return this.msalLibrary.getAllAccounts() !== null;
  }
}
