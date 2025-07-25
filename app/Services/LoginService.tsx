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

    const responseBody = await response.json();

    if (!response.ok || responseBody.body?.error) {
      throw {
        type: 'LOGIN_FAILED',
        message: responseBody.body?.error || 'Login failed',
      };
    }

    const data = responseBody.body;

    // Store in AsyncStorage
    await AsyncStorage.setItem('user_id', data.id.toString());
    await AsyncStorage.setItem('user_token', data.token);
    await AsyncStorage.setItem('user_name', data.username);
    await AsyncStorage.setItem('user_email', data.email);
    await AsyncStorage.setItem('user_contact', data.contact);
    await AsyncStorage.setItem('user_roles', JSON.stringify(data.roles));
    await AsyncStorage.setItem('user_data', JSON.stringify(data));

    console.log("User Name:", data.username);
    return data;
  } catch (error: any) {
    throw error;
  }
};


/**
 * Logs out the user by clearing all stored credentials.
 */
export const logoutUser = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const keysToKeep = ['alreadyLaunched'];
    const keysToRemove = keys.filter(key => !keysToKeep.includes(key));

    await AsyncStorage.multiRemove(keysToRemove);
    console.log('User data cleared but kept: alreadyLaunched');
  } catch (error) {
    console.error('Logout error:', error);
    throw {
      type: 'LOGOUT_FAILED',
      message: 'Failed to logout user',
    };
  }
};
