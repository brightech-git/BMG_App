import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../Config/baseUrl';

type Address = {
  id?: number;
  customerId?: string;
  name: string;
  phone: string;
  pincode: string;
  locality: string;
  addressLine: string;
  city: string;
  state: string;
  landmark: string;
  alternatePhone: string;
};

type AddressContextType = {
  addresses: Address[];
  loading: boolean;
  getAddresses: () => Promise<void>;
  createAddress: (data: Address) => Promise<void>;
  updateAddress: (addressId: number, data: Address) => Promise<void>;
  deleteAddress: (addressId: number) => Promise<void>;
};

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getAuth = async () => {
    const token = await AsyncStorage.getItem('user_token');
    const customerId = await AsyncStorage.getItem('user_id');
    if (!token || !customerId) throw new Error('Missing token or customer ID');
    return { token, customerId };
  };

  const getAddresses = async () => {
    setLoading(true);
    try {
      const { token, customerId } = await getAuth();

      const response = await fetch(`${API_BASE_URL}/addresses/customer/${customerId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || 'Failed to fetch addresses');
      }

      setAddresses(json);
    } catch (error: any) {
      console.error('❌ Error fetching addresses:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const createAddress = async (data: Address) => {
    setLoading(true);
    try {
      const { token } = await getAuth();

      const response = await fetch(`${API_BASE_URL}/addresses/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get('content-type');
      const result = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(result.message || result || 'Failed to create address');
      }

      console.log('✅ Address created:', result);
      await getAddresses();
    } catch (error: any) {
      console.error('❌ Error creating address:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (addressId: number, data: Address) => {
    setLoading(true);
    try {
      const { token } = await getAuth();

      const response = await fetch(`${API_BASE_URL}/addresses/update/${addressId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get('content-type');
      const result = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(result.message || result || 'Failed to update address');
      }

      console.log('✅ Address updated:', result);
      await getAddresses();
    } catch (error: any) {
      console.error('❌ Error updating address:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId: number) => {
    setLoading(true);
    try {
      const { token } = await getAuth();

      const response = await fetch(`${API_BASE_URL}/addresses/delete/${addressId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type');
      const result = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(result.message || result || 'Failed to delete address');
      }

      console.log('✅ Address deleted:', result);
      await getAddresses();
    } catch (error: any) {
      console.error('❌ Error deleting address:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        loading,
        getAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = (): AddressContextType => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};
