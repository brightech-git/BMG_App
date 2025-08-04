import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';

import Header from '../../layout/Header';
import CardStyle3 from '../../components/Card/CardStyle3';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';

import {
  fetchWishList,
  removeProductFromWishList,
} from '../../redux/reducer/wishListReducer';

import {
  addItemToCart,
  fetchCartItems,
} from '../../redux/reducer/cartReducer';

const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

type WishlistScreenProps = StackScreenProps<RootStackParamList, 'Wishlist'>;

const Wishlist = ({ navigation }: WishlistScreenProps) => {
  const dispatch = useDispatch();
  const { colors }: { colors: any } = useTheme();

  const wishList = useSelector((state: any) => state.wishList.wishList);
  const loading = useSelector((state: any) => state.wishList.loading);

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchWishList());
    }, [dispatch])
  );

  const handleRemove = async (sno: string) => {
    try {
      await dispatch(removeProductFromWishList(sno)).unwrap();
      Alert.alert('Removed', 'Item removed from wishlist.');
    } catch (err) {
      Alert.alert('Error', 'Failed to remove item from wishlist.');
    }
  };

  const handleAddToCart = async (item: any, imageUrl: string) => {
    try {
      const cartPayload = {
        itemTagSno: item.SNO,
        imagePath: imageUrl,
      };

      await dispatch(addItemToCart(cartPayload)).unwrap();
      await dispatch(fetchCartItems());
      Alert.alert('Success', 'Item added to cart.');
      navigation.navigate('MyCart');
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchWishList());
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <Header title="Wishlist" rightIcon2="search" leftIcon="back" />

      <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
        <View style={{ marginHorizontal: -15, flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 15,
              paddingBottom: 190,
              flexGrow: 1,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          >
            <View style={{ marginTop: -10 }}>
              {loading ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 100,
                  }}
                >
                  <Text style={{ ...FONTS.fontMedium, color: colors.text }}>
                    Loading favorites...
                  </Text>
                </View>
              ) : wishList.length > 0 ? (
                wishList.map((data: any, index: number) => {
                  if (!data?.SNO) {
                    console.warn('⚠️ Skipping item with no SNO:', data);
                    return null;
                  }

                  let imageUrl = '';

                  try {
                    if (data.ImagePath) {
                      if (typeof data.ImagePath === 'string') {
                        const parsed = JSON.parse(data.ImagePath);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                          imageUrl = parsed[0];
                        }
                      } else if (Array.isArray(data.ImagePath)) {
                        imageUrl = data.ImagePath[0];
                      }
                    }
                  } catch (err) {
                    console.warn('ImagePath parse error:', err);
                  }

                  if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl =
                      BASE_IMAGE_URL +
                      (imageUrl.startsWith('/') ? '' : '/') +
                      imageUrl;
                  }

                  return (
                    <CardStyle3
                      id={data.SNO}
                      key={index}
                      title={data.ITEMNAME || 'Product'}
                      price={`₹${data.GrandTotal || data.GrossAmount || 0}`}
                      image={imageUrl}
                      discount={`₹${data.GrossAmount || 0}`}
                      onPress1={() => handleRemove(data.SNO)}
                      onPress2={() => handleAddToCart(data, imageUrl)}
                      onPress={() => {
                        console.log('🆔 Pressed SNO:', data.SNO);
                        navigation.navigate('ProductDetails', {
                          sno: data.SNO,
                        });
                      }}
                      review={`(${data.GRSWT}g • ${data.PURITY}% Pure)`}
                      CardStyle4
                    />
                  );
                })
              ) : (
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 220,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      height: 60,
                      width: 60,
                      borderRadius: 60,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: COLORS.primaryLight,
                      marginBottom: 20,
                    }}
                  >
                    <Feather color={COLORS.primary} size={24} name="heart" />
                  </View>
                  <Text style={{ ...FONTS.h5, color: colors.title, marginBottom: 8 }}>
                    Your Wishlist is Empty!
                  </Text>
                  <Text
                    style={{
                      ...FONTS.fontSm,
                      color: colors.text,
                      textAlign: 'center',
                      paddingHorizontal: 40,
                      marginBottom: 30,
                    }}
                  >
                    Add product to your favourite and shop now.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Wishlist;
