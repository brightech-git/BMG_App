import React, { useState, useEffect } from 'react';
import { useTheme } from '@react-navigation/native';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Platform, 
  Alert,
  ActivityIndicator
} from 'react-native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import CustomInput from '../../components/Input/CustomInput';
import Button from '../../components/Button/Button';
import { ScrollView } from 'react-native-gesture-handler';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { useAddress } from '../../Context/AddressContext';

type SavedAddressesScreenProps = StackScreenProps<RootStackParamList, 'SavedAddresses'>;

const SavedAddresses = ({ navigation, route }: SavedAddressesScreenProps) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const { createAddress, updateAddress, loading } = useAddress();

    const addressTypes = ["Home", "Office"];
    const [activeType, setActiveType] = useState(addressTypes[0]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        pincode: '',
        addressLine: '',
        locality: '',
        city: '',
        state: '',
        landmark: '',
        alternatePhone: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [addressId, setAddressId] = useState<number | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (route.params?.address) {
            const { address } = route.params;
            initializeEditForm(address);
        }
    }, [route.params?.address]);

    const initializeEditForm = (address: any) => {
        setFormData({
            name: address.name,
            phone: address.phone,
            pincode: address.pincode,
            addressLine: address.addressLine,
            locality: address.locality,
            city: address.city,
            state: address.state,
            landmark: address.landmark || '',
            alternatePhone: address.alternatePhone || ''
        });
        setActiveType(address.name);
        setIsEditing(true);
        setAddressId(address.id);
    };

    const handleInputChange = (key: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        // Clear error when user types
        if (formErrors[key]) {
            setFormErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        const requiredFields: Array<keyof typeof formData> = [
            'name', 'phone', 'pincode', 'addressLine', 'locality', 'city', 'state'
        ];

        requiredFields.forEach(field => {
            if (!formData[field].trim()) {
                errors[field] = 'This field is required';
            }
        });

        // Validate phone number
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            errors.phone = 'Enter a valid 10-digit phone number';
        }

        // Validate pincode
        if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
            errors.pincode = 'Enter a valid 6-digit pincode';
        }

        // Validate alternate phone if provided
        if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone)) {
            errors.alternatePhone = 'Enter a valid 10-digit phone number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveAddress = async () => {
        if (!validateForm()) return;

        const addressData = {
            name: activeType,
            phone: formData.phone,
            pincode: formData.pincode,
            addressLine: formData.addressLine,
            locality: formData.locality,
            city: formData.city,
            state: formData.state,
            landmark: formData.landmark,
            alternatePhone: formData.alternatePhone
        };

        try {
            if (isEditing && addressId) {
                await updateAddress(addressId, addressData);
                Alert.alert('Success', 'Address updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                await createAddress(addressData);
                Alert.alert('Success', 'Address created successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save address. Please try again.');
            console.error('Error saving address:', error);
        }
    };

    const isFormValid = () => {
        return (
            formData.name.trim() &&
            formData.phone.trim() &&
            formData.pincode.trim() &&
            formData.addressLine.trim() &&
            formData.locality.trim() &&
            formData.city.trim() &&
            formData.state.trim() &&
            /^\d{10}$/.test(formData.phone) &&
            /^\d{6}$/.test(formData.pincode) &&
            (!formData.alternatePhone || /^\d{10}$/.test(formData.alternatePhone))
        );
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={isEditing ? "Edit Delivery Address" : "Add Delivery Address"}
                leftIcon={"back"}
                onPressLeft={() => navigation.goBack()}
            />

            <ScrollView 
                contentContainerStyle={{ paddingBottom: 80 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={GlobalStyleSheet.container}>
                    <Text style={{ ...FONTS.Marcellus, fontSize: 18, color: colors.title, marginBottom: 5 }}>
                        Contact Details
                    </Text>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>
                            Full Name*
                        </Text>
                        <CustomInput
                            value={formData.name}
                            onChangeText={(value: string) => handleInputChange('name', value)}
                            background
                            error={formErrors.name}
                        />
                        {formErrors.name && (
                            <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: COLORS.danger, marginTop: 3 }}>
                                {formErrors.name}
                            </Text>
                        )}
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>
                            Mobile No.*
                        </Text>
                        <CustomInput
                            value={formData.phone}
                            onChangeText={(value: string) => handleInputChange('phone', value)}
                            background
                            keyboardType={'phone-pad'}
                            maxLength={10}
                            error={formErrors.phone}
                        />
                        {formErrors.phone && (
                            <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: COLORS.danger, marginTop: 3 }}>
                                {formErrors.phone}
                            </Text>
                        )}
                    </View>

                    <Text style={{ ...FONTS.fontSemiBold, fontSize: 16, color: colors.title, marginBottom: 10 }}>
                        Address Details
                    </Text>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>
                            Pin Code*
                        </Text>
                        <CustomInput
                            value={formData.pincode}
                            onChangeText={(value: string) => handleInputChange('pincode', value)}
                            background
                            keyboardType={'number-pad'}
                            maxLength={6}
                            error={formErrors.pincode}
                        />
                        {formErrors.pincode && (
                            <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: COLORS.danger, marginTop: 3 }}>
                                {formErrors.pincode}
                            </Text>
                        )}
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>
                            Address (House No, Building, Street, Area)*
                        </Text>
                        <CustomInput
                            value={formData.addressLine}
                            onChangeText={(value: string) => handleInputChange('addressLine', value)}
                            background
                            multiline
                            numberOfLines={3}
                            error={formErrors.addressLine}
                        />
                        {formErrors.addressLine && (
                            <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: COLORS.danger, marginTop: 3 }}>
                                {formErrors.addressLine}
                            </Text>
                        )}
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>
                            Locality/Town*
                        </Text>
                        <CustomInput
                            value={formData.locality}
                            onChangeText={(value: string) => handleInputChange('locality', value)}
                            background
                            error={formErrors.locality}
                        />
                        {formErrors.locality && (
                            <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: COLORS.danger, marginTop: 3 }}>
                                {formErrors.locality}
                            </Text>
                        )}
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>
                            City/District*
                        </Text>
                        <CustomInput
                            value={formData.city}
                            onChangeText={(value: string) => handleInputChange('city', value)}
                            background
                            error={formErrors.city}
                        />
                        {formErrors.city && (
                            <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: COLORS.danger, marginTop: 3 }}>
                                {formErrors.city}
                            </Text>
                        )}
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>
                            State*
                        </Text>
                        <CustomInput
                            value={formData.state}
                            onChangeText={(value: string) => handleInputChange('state', value)}
                            background
                            error={formErrors.state}
                        />
                        {formErrors.state && (
                            <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: COLORS.danger, marginTop: 3 }}>
                                {formErrors.state}
                            </Text>
                        )}
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>
                            Landmark (Optional)
                        </Text>
                        <CustomInput
                            value={formData.landmark}
                            onChangeText={(value: string) => handleInputChange('landmark', value)}
                            background
                        />
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, marginBottom: 5 }}>
                            Alternate Phone (Optional)
                        </Text>
                        <CustomInput
                            value={formData.alternatePhone}
                            onChangeText={(value: string) => handleInputChange('alternatePhone', value)}
                            background
                            keyboardType={'phone-pad'}
                            maxLength={10}
                            error={formErrors.alternatePhone}
                        />
                        {formErrors.alternatePhone && (
                            <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: COLORS.danger, marginTop: 3 }}>
                                {formErrors.alternatePhone}
                            </Text>
                        )}
                    </View>

                    <Text style={{ ...FONTS.Marcellus, fontSize: 18, color: colors.title, marginBottom: 10 }}>
                        Save Address As
                    </Text>

                    <View style={{
                        flexDirection: 'row',
                        paddingTop: 5,
                        paddingBottom: 15,
                        flexWrap: 'wrap'
                    }}>
                        {addressTypes.map((type, index) => (
                            <View
                                key={index}
                                style={[{
                                    shadowColor: "rgba(195,135,95,0.30)",
                                    shadowOffset: { width: -5, height: 15 },
                                    shadowOpacity: .1,
                                    shadowRadius: 5,
                                    marginBottom: 10,
                                    marginRight: 10
                                }, Platform.OS === "ios" && {
                                    backgroundColor: colors.card,
                                    borderRadius: 10
                                }]}
                            >
                                <TouchableOpacity
                                    onPress={() => setActiveType(type)}
                                    style={[{
                                        height: 40,
                                        paddingHorizontal: 20,
                                        borderRadius: 10,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: colors.card
                                    }, activeType === type && {
                                        backgroundColor: COLORS.primary,
                                    }]}
                                >
                                    <Text style={[
                                        { ...FONTS.fontMedium, fontSize: 13, color: colors.title }, 
                                        activeType === type && { color: colors.card }
                                    ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={[{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                shadowColor: 'rgba(195, 123, 95, 0.25)',
                shadowOffset: { width: 2, height: -20 },
                shadowOpacity: .1,
                shadowRadius: 5,
            }, Platform.OS === "ios" && {
                backgroundColor: colors.card,
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                bottom: 30
            }]}>
                <View style={{ 
                    height: 88, 
                    backgroundColor: colors.card, 
                    borderTopLeftRadius: 25, 
                    borderTopRightRadius: 25 
                }}>
                    <View style={[
                        GlobalStyleSheet.container, 
                        { paddingHorizontal: 10, marginTop: 15, paddingTop: 0 }
                    ]}>
                        <Button
                            title={isEditing ? "Update Address" : "Save Address"}
                            btnRounded
                            onPress={handleSaveAddress}
                            color={COLORS.primary}
                            disabled={!isFormValid()}
                            loading={loading}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default SavedAddresses;