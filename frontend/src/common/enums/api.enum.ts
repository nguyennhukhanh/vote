export enum GroupApiEnum {
  User = '/user',
  Admin = '/admin',
}

export enum AuthApiEnum {
  LoginWithGoogle = '/auth/login/google',
  GetNonce = '/auth/nonce',
  LoginWithMetamask = '/auth/login/wallet',
  RefreshToken = '/auth/refresh-token',
  Logout = '/auth/logout',
}

export enum UserApiEnum {}
