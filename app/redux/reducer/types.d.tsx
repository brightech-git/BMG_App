// Global types for auth

//SignUpPayLoad
export interface SignupPayload {
  username: string;
  email: string;
  contactNumber: string;
  password: string;
}


export interface AuthState {
  user: any;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
}

//LoginPayLoad
export interface LoginPayload {
  contactOrEmailOrUsername: string;
  password: string;
}

export interface LoginState {
  user:any;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
}
