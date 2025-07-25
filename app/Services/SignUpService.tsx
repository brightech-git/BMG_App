// src/redux/reducer/SignUp/SignUpService.ts
import { SignupPayload } from '../redux/reducer/types.d';
import { API_BASE_URL } from '../Config/baseUrl';

export const registerUser = async (userData: SignupPayload) => {
  console.log(userData)
  const response = await fetch(`${API_BASE_URL}/auth/user/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  // Handle known failure case
  if (!response.ok || (data.message && data.message.toLowerCase().includes('already exists'))) {
    throw new Error(data.message || 'Registration failed.');
  }

  return data;
};
