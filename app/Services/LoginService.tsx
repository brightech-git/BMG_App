import { LoginPayload } from '../redux/reducer/types.d';
import { API_BASE_URL } from '../Config/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (userData: LoginPayload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      throw {
        type: 'INVALID_RESPONSE',
        message: 'Server did not return JSON',
      };
    }

    const data = await response.json(); // No `.body` — your API returns the object directly

    if (!response.ok) {
      throw {
        type: 'LOGIN_FAILED',
        message: data.message || 'Login failed',
      };
    }

    // Store values in AsyncStorage
    await AsyncStorage.setItem('user_id', data.id.toString());
    await AsyncStorage.setItem('user_token', data.token);
    await AsyncStorage.setItem('user_name', data.username);
    await AsyncStorage.setItem('user_email', data.email);
    await AsyncStorage.setItem('user_contact', data.contact);
    await AsyncStorage.setItem('user_roles', JSON.stringify(data.roles));
    await AsyncStorage.setItem('user_data', JSON.stringify(data));

    console.log("User logged in:", data.username);
    console.log("User token:", data.token);
    return data;
  } catch (error: any) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const keysToKeep = ['alreadyLaunched']; // Optional: keep any app-level flags
    const keysToRemove = keys.filter(key => !keysToKeep.includes(key));

    await AsyncStorage.multiRemove(keysToRemove);
    console.log('User logged out: credentials cleared');
  } catch (error) {
    console.error('Logout error:', error);
    throw {
      type: 'LOGOUT_FAILED',
      message: 'Failed to logout user',
    };
  }
};