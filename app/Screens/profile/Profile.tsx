import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import { View, Text, SafeAreaView, Image, TouchableOpacity, SectionList, ScrollView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { FONTS, COLORS } from '../../constants/theme';

import ListItem from '../../components/list/ListItem';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

import { useContext } from 'react';
import { UserContext } from '../../Context/ProfileContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutUser } from '../../Services/LoginService';


const btnData = [
    {
        title: "Your Order",
        navigate: 'Myorder',
    },
    {
        title: "Wishlist",
        navigate: 'Wishlist',
    },
    {
        title: "Coupons",
        navigate: 'Coupons',
    },
    {
        title: "Track Order",
        navigate: 'Trackorder',
    },
]


const ListwithiconData = [
    {
        title: 'Account Settings',
        data: [
            {
                icon: IMAGES.user2,
                title: "Your Profile",
                navigate: 'EditProfile'
            },
            {
                icon: IMAGES.card2,
                title: "Saved Cards & Wallet",
                navigate: 'Payment'
            },
            {
                icon: IMAGES.map2,
                title: "Saved Addresses",
                navigate: 'SaveAddress'
            },
            {
                icon: IMAGES.translation,
                title: "Select Language",
                navigate: 'Language'
            },
            {
                icon: IMAGES.bell2,
                title: "Notifications Settings",
                navigate: 'Notification'
            },
        ],
    },
    {
        title: 'My Activity',
        data: [
            {
                icon: IMAGES.star,
                title: "Reviews",
                navigate: 'WriteReview'
            },
            {
                icon: IMAGES.comment,
                title: "Questions & Answers",
                navigate: 'Questions'
            },
        ],
    },

];

type ProfileScreenProps = StackScreenProps<RootStackParamList, 'Profile'>;

const Profile = ({ navigation }: ProfileScreenProps) => {

    const [username, setUsername] = useState<string>(''); // State to hold username
    const { profileImage } = useContext(UserContext); // State to hold username
    const { setProfileImage } = useContext(UserContext);

    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    useEffect(() => {
        const getUserDetails = async () => {
            const name = await AsyncStorage.getItem('user_name');
            if (name) setUsername(name);
        };
        getUserDetails();
    }, []);



    return (

        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1, }}>
            {theme.dark ?
                null
                :
                <LinearGradient colors={['#C37B5F', '#F9F5F3']}
                    style={{ width: '100%', height: 230, top: 0, position: 'absolute' }}
                >
                </LinearGradient>
            }
            <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5 }}>
                        <Image
                            style={{ height: 50, width: 50, resizeMode: 'contain', }}
                            source={IMAGES.logo}
                        />
                        <Text style={{ ...FONTS.Marcellus, fontSize: 24, color: colors.title, marginTop: 8 }}>BMG</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                "Logout",
                                "Are you sure you want to logout?",
                                [
                                    {
                                        text: "Cancel",
                                        style: "cancel"
                                    },
                                    {
                                        text: "Logout",
                                        style: "destructive",
                                        onPress: async () => {
                                            try {
                                                await logoutUser();
                                                setProfileImage(null); // 👈 clear context image
                                                navigation.reset({
                                                    index: 0,
                                                    routes: [{ name: 'SignIn' }],
                                                });
                                            } catch (err) {
                                                console.error('Logout error:', err);
                                            }
                                        }
                                    }
                                ]
                            );
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Image
                            style={{ height: 18, width: 18, resizeMode: 'contain', tintColor: colors.title }}
                            source={IMAGES.logout}
                        />
                        <Text style={{ ...FONTS.fontRegular, fontSize: 16, color: colors.title, marginLeft: 5 }}>Logout</Text>
                    </TouchableOpacity>


                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 20, paddingBottom: 30 }}>
                    <View style={{ height: 45, width: 45, borderRadius: 50, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                            style={{ height: 50, width: 50, resizeMode: 'cover', borderRadius: 25 }}
                            source={
                                profileImage
                                    ? { uri: profileImage }
                                    : IMAGES.user2
                            }
                        />


                    </View>
                    <Text style={{ ...FONTS.Marcellus, fontSize: 24, color: colors.title }}> Hello, {username || 'Guest'}</Text>
                </View>
                <View style={[GlobalStyleSheet.row]}>
                    {btnData.map((data: any, index: any) => {
                        return (
                            <View key={index} style={[GlobalStyleSheet.col50, { marginBottom: 15 }]}>
                                <View
                                    style={[{
                                        shadowColor: 'rgba(195,135,95,0.20)',
                                        shadowOffset: {
                                            width: 2,
                                            height: 15,
                                        },
                                        shadowOpacity: .1,
                                        shadowRadius: 5,
                                    }, Platform.OS === "ios" && {
                                        backgroundColor: colors.card,
                                        borderRadius: 10
                                    }]}
                                >
                                    <TouchableOpacity
                                        activeOpacity={.9}
                                        onPress={() => navigation.navigate(data.navigate)}
                                        style={{
                                            height: 48,
                                            backgroundColor: colors.card,
                                            //width: 180,
                                            borderRadius: 15,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{data.title}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    })}
                </View>
                <View style={{ marginHorizontal: -15, marginTop: 0, flex: 1 }}>
                    <SectionList
                        sections={ListwithiconData}
                        keyExtractor={(item: any, index) => item + index}
                        renderItem={({ item }) => (
                            <ListItem
                                icon={
                                    <Image
                                        style={{
                                            height: 20,
                                            width: 20,
                                            tintColor: COLORS.primary,
                                            resizeMode: 'contain',
                                        }}
                                        source={item.icon}
                                    />
                                }
                                title={item.title}
                                onPress={() => navigation.navigate(item.navigate)}
                            />
                        )}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={{ ...FONTS.Marcellus, fontSize: 20, color: colors.title, paddingLeft: 20, paddingBottom: 10, paddingTop: 20, backgroundColor: colors.background }}>{title}</Text>
                        )}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Profile