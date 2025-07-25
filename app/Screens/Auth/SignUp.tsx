import React, { useEffect, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  ScrollView,
  
} from 'react-native';
import { FONTS, COLORS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CustomInput from '../../components/Input/CustomInput';
import Button from '../../components/Button/Button';
import { Feather, FontAwesome } from '@expo/vector-icons';
import SocialBtn from '../../components/Socials/SocialBtn';
import { Checkbox } from 'react-native-paper';
import { IMAGES } from '../../constants/Images';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { useDispatch, useSelector } from 'react-redux';
import { signup, resetAuth } from '../../redux/reducer/SignUpReducer';
import { RootState, AppDispatch } from '../../redux/store';

type SignUpScreenProps = StackScreenProps<RootStackParamList, 'SignUp'>;

const SignUp = ({ navigation }: SignUpScreenProps) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, isError, isSuccess, message } = useSelector((state: RootState) => state.signUp);

  const [isChecked, setIsChecked] = useState(false);

  const [form, setForm] = useState({
    username: '',
    contactNumber: '',
    email: '',
    password: '',
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

const handleSignup = () => {
  if (!isChecked) {
    Alert.alert('Terms', 'You must agree to the terms before signing up.');
    return;
  }

  const { username, contactNumber, email, password } = form;

  if (!username || !email || !contactNumber || !password) {
    Alert.alert('Error', 'Please fill all required fields.');
    return;
  }
console.log(form)
  dispatch(signup(form));
};


useEffect(() => {
  if (isSuccess) {
    Alert.alert('Success', 'Signup successful!', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('SignIn'),
      },
    ]);
  }

  if (isError) {
    Alert.alert('Signup Failed', message || 'Something went wrong.');
  }

  return () => {
    dispatch(resetAuth());
  };
}, [isSuccess, isError]);


  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
        {/* Top Banner */}
        <View>
          <View
            style={{
              width: 600,
              height: 500,
              backgroundColor: COLORS.primary,
              borderRadius: 250,
              marginLeft: -95,
              marginTop: -220,
              overflow: 'hidden',
            }}
          >
            <Image
              style={{
                height: undefined,
                aspectRatio: 2.3 / 1.2,
                resizeMode: 'contain',
                width: '100%',
                marginTop: 220,
              }}
              source={IMAGES.item5}
            />
            <View
              style={{
                width: 600,
                height: 500,
                backgroundColor: '#360F00',
                borderRadius: 250,
                position: 'absolute',
                opacity: 0.8,
              }}
            />
          </View>
          <View style={{ position: 'absolute', top: 20, left: 20 }}>
            <Text style={{ ...FONTS.Marcellus, fontSize: 23, color: COLORS.card }}>
              Create your{"\n"}Account
            </Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={[GlobalStyleSheet.container, { paddingTop: 0, marginTop: -200 }]}>
          <View
            style={[
              {
                shadowColor: 'rgba(195, 123, 95, 0.20)',
                shadowOffset: { width: 2, height: 20 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
              },
              Platform.OS === 'ios' && {
                backgroundColor: colors.card,
                borderRadius: 35,
              },
            ]}
          >
            <View style={{ backgroundColor: colors.card, padding: 30, borderRadius: 40, paddingBottom: 40 }}>
              <Text style={{ ...FONTS.Marcellus, fontSize: 18, color: colors.title, lineHeight: 24 }}>
                Welcome Back! Please Enter{"\n"}Your Details
              </Text>

              {/* Inputs */}
              <View style={{ marginBottom: 8, marginTop: 20 }}>
                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>
                  Name<Text style={{ color: '#FF0000' }}>*</Text>
                </Text>
                <CustomInput onChangeText={(val) => handleChange('username', val)} value={form.username} />
              </View>

              <View style={{ marginBottom: 8, marginTop: 20 }}>
                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>
                  Mobile Number<Text style={{ color: '#FF0000' }}>*</Text>
                </Text>
                <CustomInput
                  onChangeText={(val) => handleChange('contactNumber', val)}
                  value={form.contactNumber}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={{ marginBottom: 8 }}>
                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>
                  Email Address<Text style={{ color: '#FF0000' }}>*</Text>
                </Text>
                <CustomInput
                  onChangeText={(val) => handleChange('email', val)}
                  value={form.email}
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>
                  Password<Text style={{ color: '#FF0000' }}>*</Text>
                </Text>
                <CustomInput
                  type="password"
                  onChangeText={(val) => handleChange('password', val)}
                  value={form.password}
                />

                <Checkbox.Item
                  onPress={() => setIsChecked(!isChecked)}
                  position="leading"
                  label="I agree to all Term, Privacy and Fees"
                  color={colors.title}
                  uncheckedColor={colors.textLight}
                  status={isChecked ? 'checked' : 'unchecked'}
                  style={{ paddingHorizontal: 0, paddingVertical: 5 }}
                  labelStyle={{
                    ...FONTS.fontRegular,
                    fontSize: 15,
                    color: colors.title,
                    textAlign: 'left',
                  }}
                />
              </View>
            </View>
          </View>

          {/* Signup Button */}
          <View style={{ paddingHorizontal: 60, marginTop: -30 }}>
            <Button
              title={isLoading ? 'Signing Up...' : 'Sign Up'}
              btnRounded
              fullWidth
              disabled={isLoading}
              onPress={handleSignup}
              icon={<Feather size={24} color={COLORS.primary} name={'arrow-right'} />}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Social Logins */}
        <View style={[GlobalStyleSheet.container, { paddingHorizontal: 20, flex: 1, paddingTop: 5 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ height: 1, flex: 1, backgroundColor: colors.title }} />
            <Text style={{ ...FONTS.fontMedium, color: colors.text, marginHorizontal: 15, fontSize: 13 }}>
              Or continue with
            </Text>
            <View style={{ height: 1, flex: 1, backgroundColor: colors.title }} />
          </View>
          <View>
            <View style={{ marginBottom: 10 }}>
              <SocialBtn
                icon={<Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={IMAGES.google2} />}
                rounded
                color={theme.dark ? '#000' : '#FFFFFF'}
                text={'Sign in with google'}
              />
            </View>
            <View>
              <SocialBtn
                icon={<FontAwesome name="apple" size={20} color={colors.title} />}
                rounded
                color={theme.dark ? '#000' : '#FFFFFF'}
                text={'Sign in with apple'}
              />
            </View>
          </View>
        </View>

        {/* Footer Navigation */}
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            flex: 1,
            paddingBottom: 10,
          }}
        >
          <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text
              style={{
                ...FONTS.fontMedium,
                borderBottomWidth: 1,
                borderBottomColor: colors.title,
                color: colors.title,
              }}
            >
              {' '}
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default SignUp;
