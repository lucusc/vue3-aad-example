import { Configuration, InteractionType, PopupRequest, RedirectRequest, SsoSilentRequest, SilentRequest } from '@azure/msal-browser';

export type FrameworkOptions = {
  loginOnLoad: boolean = false;
  interactionType: InteractionType = InteractionType.Redirect;
};

export interface MsalOptions extends Configuration {
  loginRequest: PopupRequest | RedirectRequest | SsoSilentRequest;
  accessTokenRequest: SilentRequest;
  framework: FrameworkOptions;
}

export interface iMsal {
  data: AuthData;
  signIn: () => Promise<any> | void;
  signOut: () => Promise<any> | void;
  acquireTokenSilent: () => Promise<string | void>;
  isAuthenticated: () => boolean;
}

export type AuthData = {
  isAuthenticated: boolean;
  accessToken: string | null;
  idToken: string;
  user: User;
  account?: AccountInfo;
};

export type User = {
  name: string;
  userName: string;
  email: string;
};
