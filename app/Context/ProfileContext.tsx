import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextProps {
  profileImage: string | null;
  setProfileImage: (uri: string | null) => void;
}

export const UserContext = createContext<UserContextProps>({
  profileImage: null,
  setProfileImage: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      const image = await AsyncStorage.getItem('user_profile_image');
      if (image) setProfileImage(image);
    };
    loadImage();
  }, []);

  return (
    <UserContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </UserContext.Provider>
  );
};
