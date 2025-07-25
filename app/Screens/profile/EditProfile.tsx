import {
    View,
    Text,
    SafeAreaView,
    Image,
    TouchableOpacity,
    Platform,
    Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@react-navigation/native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import Button from '../../components/Button/Button';
import { ScrollView } from 'react-native-gesture-handler';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { UserContext } from '../../Context/ProfileContext'; // Adjust path based on your structure


type EditProfileScreenProps = StackScreenProps<RootStackParamList, 'EditProfile'>;

const EditProfile = ({ navigation }: EditProfileScreenProps) => {
    const [username, setUsername] = useState<string>('');
    const [mobile, setMobile] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [userid, setUserid] = useState<string>('');
    const { profileImage, setProfileImage } = useContext(UserContext);


    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const name = await AsyncStorage.getItem('user_name');
                const contact = await AsyncStorage.getItem('user_contact');
                const email = await AsyncStorage.getItem('user_email');
                const user_id = await AsyncStorage.getItem('user_id');

                if (name) setUsername(name);
                if (contact) setMobile(contact);
                if (email) setEmail(email);
                if (user_id) setUserid(user_id);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        getUserDetails();
    }, []);


    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'We need permission to access your photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setProfileImage(uri); // update global context
            await AsyncStorage.setItem('user_profile_image', uri); // persist
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header title={'Your Profile'} leftIcon={'back'} />
            <ScrollView>
                <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <View
                            style={{
                                borderWidth: 2,
                                borderColor: COLORS.primary,
                                height: 150,
                                width: 150,
                                borderRadius: 150,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                style={{ height: 140, width: 140, borderRadius: 100 }}
                                source={
                                    profileImage
                                        ? { uri: profileImage }
                                        : IMAGES.itemDetails2
                                }
                            />
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={pickImage}
                            style={{
                                height: 45,
                                width: 45,
                                borderRadius: 45,
                                backgroundColor: colors.background,
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'absolute',
                                bottom: 0,
                                right: 120,
                            }}
                        >
                            <View
                                style={{
                                    height: 40,
                                    width: 40,
                                    borderRadius: 40,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: COLORS.primary,
                                }}
                            >
                                <Image
                                    style={{
                                        height: 18,
                                        width: 18,
                                        resizeMode: 'contain',
                                        tintColor: colors.card,
                                    }}
                                    source={IMAGES.write}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Read-only fields */}
                    {[
                        { label: 'User Name', value: username },
                        { label: 'Mobile Number', value: mobile },
                        { label: 'Email', value: email },
                        // { label: 'User ID', value: userid },
                    ].map(({ label, value }) => (
                        <View style={{ marginBottom: 15, marginTop: label === 'User Name' ? 30 : 0 }} key={label}>
                            <Text
                                style={{
                                    ...FONTS.fontRegular,
                                    fontSize: 15,
                                    color: colors.title,
                                    marginBottom: 5,
                                }}
                            >
                                {label}
                            </Text>
                            <Text
                                style={{
                                    ...FONTS.fontMedium,
                                    fontSize: 16,
                                    color: colors.text,
                                    backgroundColor: colors.card,
                                    padding: 10,
                                    borderRadius: 8,
                                }}
                            >
                                {value || 'N/A'}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View
                style={[
                    {
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        shadowColor: 'rgba(195, 123, 95, 0.25)',
                        shadowOffset: { width: 2, height: -20 },
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                    },
                    Platform.OS === 'ios' && {
                        backgroundColor: colors.card,
                        borderTopLeftRadius: 25,
                        borderTopRightRadius: 25,
                        bottom: 30,
                    },
                ]}
            >
                <View
                    style={{
                        height: 88,
                        width: '100%',
                        backgroundColor: colors.card,
                        borderTopLeftRadius: 25,
                        borderTopRightRadius: 25,
                    }}
                >
                    {/* <View
                        style={[GlobalStyleSheet.container, { paddingHorizontal: 10, marginTop: 20, paddingTop: 0 }]}
                    >
                        <Button
                            title={'Update Profile'}
                            color={COLORS.primary}
                            onPress={() => navigation.navigate('Profile')}
                            btnRounded
                        />
                    </View> */}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default EditProfile;
