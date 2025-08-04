import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS } from '../../constants/theme';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';

import Header from '../../layout/Header';
import Button from '../../components/Button/Button';
import SwiperBox2 from '../../components/SwiperBox2';

import { cartService, Product, CartItem } from '../../Services/CartService';
import { fetchCartItems } from '../../redux/reducer/cartReducer';

type CartItemWithDetails = CartItem & {
  fullDetails: Product;
};

const Shopping = ({ navigation }: any) => {
  const theme = useTheme();
  const { colors } = theme;
  const dispatch = useDispatch();

  const cartItems = useSelector((state: any) => state.cart?.items || []);
  const [cartProducts, setCartProducts] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCartProducts = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const [detailedProducts, cartItems] = await Promise.all([
        cartService.getDetailedCartProducts(),
        cartService.getItemsByPhone(),
      ]);

      const merged: CartItemWithDetails[] = cartItems
        .map((item) => {
          const product = detailedProducts.find((p) => p.SNO === item.itemTagSno);
          if (!product) return null;
          return { ...item, fullDetails: product };
        })
        .filter((item): item is CartItemWithDetails => item !== null);

      setCartProducts(merged);
    } catch (err) {
      console.error('❌ Error loading cart data:', err);
      Alert.alert('Error', 'Failed to load cart items.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCartProducts();
      dispatch(fetchCartItems());
    }, [dispatch])
  );

  const onRefresh = useCallback(() => {
    fetchCartProducts();
    dispatch(fetchCartItems());
  }, [dispatch]);

  const handleRemove = async (item: CartItemWithDetails) => {
    try {
      await cartService.removeItem(item.sno);
      fetchCartProducts();
      dispatch(fetchCartItems());
    } catch (err) {
      Alert.alert('Error', 'Failed to remove item from cart.');
    }
  };

  const getImageUrl = (imagePath?: string): string => {
    try {
      if (!imagePath || imagePath.length < 5) return 'https://via.placeholder.com/150';
      const parsed = JSON.parse(imagePath);
      let image = parsed?.[0] || '';
      if (!image || typeof image !== 'string') return 'https://via.placeholder.com/150';
      if (!image.startsWith('http')) {
        image = `https://app.bmgjewellers.com${image}`;
      }
      return image;
    } catch (err) {
      console.warn('🟡 Image parse error:', err);
      return 'https://via.placeholder.com/150';
    }
  };

  const subtotal = useMemo(() => {
    return cartProducts.reduce((acc, item) => {
      const price = parseFloat(item?.fullDetails?.GrandTotal || '0');
      return acc + price;
    }, 0);
  }, [cartProducts]);

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <Header title="My Cart" leftIcon="back" rightIcon2="search" />

      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          <View style={{ paddingTop: 20 }}>
            {loading && !refreshing ? (
              <View style={{ alignItems: 'center', marginTop: 50 }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ ...FONTS.fontRegular, color: colors.text, marginTop: 10 }}>
                  Loading cart items...
                </Text>
              </View>
            ) : cartProducts.length > 0 ? (
              cartProducts.map((item) => {
                const imageUri = getImageUrl(item.fullDetails?.ImagePath);
                return (
                  <SwiperBox2
                    key={item.sno}
                    data={item}
                    navigation={navigation}
                    theme={theme}
                    colors={colors}
                    handleDelete={() => handleRemove(item)}
                    image={imageUri}
                    onPress={() => {
                      console.log('Clicked product SNO:', item.fullDetails?.SNO);
                      navigation.navigate('ProductDetails', { sno: item.fullDetails?.SNO });
                    }}
                  />

                );
              })
            ) : (
              <View style={{ alignItems: 'center', marginTop: 100 }}>
                <Feather name="shopping-cart" size={40} color={COLORS.primary} />
                <Text style={{ ...FONTS.h5, color: colors.title, marginTop: 20 }}>
                  Your shopping cart is empty.
                </Text>
                <Text style={{ ...FONTS.fontSm, color: colors.text, marginTop: 5 }}>
                  Add items from your wishlist.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </GestureHandlerRootView>

      {cartProducts.length > 0 && !loading && (
        <View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.card,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              paddingHorizontal: 20,
              paddingVertical: 20,
              shadowColor: 'rgba(195, 123, 95, 0.25)',
              shadowOffset: { width: 2, height: -10 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 5,
            },
            Platform.OS === 'ios' && {
              backgroundColor: colors.card,
            },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text style={{ ...FONTS.fontRegular, fontSize: 18, color: colors.title }}>
              Subtotal
            </Text>
            <Text style={{ ...FONTS.fontBold, fontSize: 18, color: colors.title }}>
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>
          <Button
            title={`Proceed to Buy (${cartProducts.length})`}
            btnRounded
            color={COLORS.primary}
            onPress={() => navigation.navigate('Checkout')}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Shopping;
