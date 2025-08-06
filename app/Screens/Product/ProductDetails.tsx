import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';

import Header from '../../layout/Header';
import Button from '../../components/Button/Button';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { FONTS, COLORS } from '../../constants/theme';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

import { addItemToCart, fetchCartItems } from '../../redux/reducer/cartReducer';
import { fetchWishList } from '../../redux/reducer/wishListReducer';
import { RootState } from '../../redux/store';
import { API_BASE_URL } from '../../Config/baseUrl';
import { favoriteService } from '../../Services/FavouriteService';
import { cartService } from '../../Services/CartService';
import fallbackImage from '../../assets/images/item/pic6.png'

type Props = StackScreenProps<RootStackParamList, 'ProductDetails'>;

const ProductDetails = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;
  const dispatch = useDispatch();
  const [imageError, setImageError] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [imageArray, setImageArray] = useState<string[]>([]);
  const [isInCart, setIsInCart] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);
  const [cartLoading, setCartLoading] = useState<boolean>(false);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const wishList = useSelector((state: any) => state.wishList.wishList);
  const sno = route?.params?.sno || '';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/product/getSnofilter?sno=${sno}`);
        const text = await response.text();

        const data = text ? JSON.parse(text) : null;
        const prod = Array.isArray(data) ? data[0] : data?.result?.[0] || data;

        if (prod) {
          setProduct(prod);
          if (prod.SIZENAME) setActiveSize(prod.SIZENAME);

          try {
            const parsedImages = prod.ImagePath ? JSON.parse(prod.ImagePath) : [];
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              const fullImageArray = parsedImages.map((img: string) => `https://app.bmgjewellers.com${img}`);
              setImageArray(fullImageArray);
              setSelectedImage(fullImageArray[0]);
            }
          } catch (err) {
            console.warn('⚠️ ImagePath parse failed:', err);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error(`❌ Error fetching product for SNO ${sno}:`, err);
        Alert.alert('Error', 'Failed to load product details.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (sno) {
      fetchProduct();
    } else {
      Alert.alert('Invalid Product', 'No product SNO provided.');
      setLoading(false);
    }
  }, [sno]);

  // Check if product is in cart
  useEffect(() => {
    const checkCartStatus = async () => {
      if (product?.SNO) {
        try {
          const inCart = await cartService.isItemInCart(product.SNO);
          setIsInCart(inCart);
        } catch (error) {
          console.error('Error checking cart status:', error);
        }
      }
    };

    checkCartStatus();
  }, [product, cartItems]);

  // Check if product is in favorites
  useEffect(() => {
    if (product?.SNO && Array.isArray(wishList)) {
      const inFavorites = wishList.some((item: any) => item.SNO === product.SNO);
      setIsFavorite(inFavorites);
    }
  }, [product, wishList]);

  // Initial load of wishlist
  useEffect(() => {
    dispatch(fetchWishList());
  }, [dispatch]);

  const handleAddToCart = async () => {
    if (!product || !product.SNO || cartLoading) return;

    setCartLoading(true);
    try {
      const cartPayload = {
        itemTagSno: product.SNO,
        imagePath: selectedImage,
      };

      await dispatch(addItemToCart(cartPayload)).unwrap();
      await dispatch(fetchCartItems());
      setIsInCart(true);
      Alert.alert('Success', 'Item added to cart.');
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    } finally {
      setCartLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!product?.SNO || favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFromFavorites(product.SNO);
        setIsFavorite(false);
      } else {
        await favoriteService.addToFavorites(product.SNO);
        setIsFavorite(true);
      }
      dispatch(fetchWishList());
    } catch (error) {
      console.error('❌ Favorite toggle error:', error);
      Alert.alert('Error', `Failed to ${isFavorite ? 'remove from' : 'add to'} wishlist`);
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ ...FONTS.h5, color: colors.title }}>Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ position: 'absolute', width: '100%', zIndex: 99, top: Platform.OS === 'ios' ? 47 : 0 }}>
        <Header
          title="Product Details"
          leftIcon="back"
          rightIcon="cart"
          color
          onPress={() => navigation.navigate('MyCart')}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Main Image with Favorite Button */}
        <View style={{ position: 'relative' }}>
          <Image
            style={{ width: '100%', aspectRatio: 1 / 1.2, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
            source={imageError || !selectedImage ? fallbackImage : { uri: selectedImage }}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />


          {/* Favorite Heart Button */}
          {/* <TouchableOpacity
            style={[
              styles.favoriteButton,
              {
                backgroundColor: isFavorite ? COLORS.primary : 'rgba(255, 255, 255, 0.9)',
              }
            ]}
            onPress={handleFavoriteToggle}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color={isFavorite ? COLORS.white : COLORS.primary} />
            ) : (
              <Feather
                name="heart"
                size={24}
                color={isFavorite ? COLORS.white : '#666'}
              />
            )}
          </TouchableOpacity> */}
        </View>

        {/* Thumbnails */}
        {Array.isArray(imageArray) && imageArray.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10, paddingHorizontal: 10 }}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {imageArray.map((uri, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(uri)}
                style={{
                  marginRight: 10,
                  borderWidth: selectedImage === uri ? 2 : 0,
                  borderColor: COLORS.primary,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                <Image
                  source={{ uri }}
                  style={{ width: 70, height: 70, borderRadius: 10 }}
                  resizeMode="cover"
                  onError={(e) => {
                    e.currentTarget.setNativeProps({
                      src: [fallbackImage],
                    });
                  }}
                />

              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={[GlobalStyleSheet.container, { marginTop: 5 }]}>
          <Text style={{ ...FONTS.Marcellus, fontSize: 24, color: colors.title }}>
            {product.ITEMNAME?.trim()}
          </Text>

          <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title, opacity: 0.7, marginTop: 10 }}>
            {product.GSTPer || 0} GST
          </Text>

          <View style={{ flexDirection: 'row', gap: 60, marginTop: 20 }}>
            <View>
              <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>Price:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }}>
                <Text style={{ ...FONTS.fontMedium, fontSize: 20, color: colors.title }}>₹{product.GrandTotal}</Text>
                <Text style={{
                  ...FONTS.fontRegular,
                  fontSize: 15,
                  color: colors.title,
                  textDecorationLine: 'line-through',
                }}>
                  ₹{product.GrossAmount}
                </Text>
              </View>
            </View>

            {product.SIZENAME && (
              <View>
                <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>Size:</Text>
                <TouchableOpacity
                  onPress={() => setActiveSize(product.SIZENAME)}
                  style={{
                    height: 40,
                    width: 60,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeSize === product.SIZENAME ? COLORS.primary : colors.card,
                    marginTop: 10,
                  }}
                >
                  <Text style={{
                    ...FONTS.fontSemiBold,
                    fontSize: 12,
                    color: activeSize === product.SIZENAME ? COLORS.white : colors.title,
                  }}>
                    {product.SIZENAME}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Product Details Grid */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ ...FONTS.fontSemiBold, fontSize: 16, color: colors.title, marginBottom: 10 }}>Product Details:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
              {product.TAGKEY && (
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, opacity: 0.7 }}>Tag No:</Text>
                  <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title }}>{product.TAGKEY}</Text>
                </View>
              )}
              {product.GRSWT && (
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, opacity: 0.7 }}>Weight:</Text>
                  <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title }}>{product.GRSWT}g</Text>
                </View>
              )}
              {product.PURITY && (
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, opacity: 0.7 }}>Purity:</Text>
                  <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title }}>{product.PURITY}%</Text>
                </View>
              )}
              {product.CATNAME && (
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, opacity: 0.7 }}>Category:</Text>
                  <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.title }}>{product.CATNAME}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ ...FONTS.fontSemiBold, fontSize: 16, color: colors.title }}>Description:</Text>
            <Text style={{
              ...FONTS.fontRegular,
              fontSize: 15,
              color: colors.title,
              opacity: 0.7,
              marginTop: 10,
              lineHeight: 22,
            }}>
              {product.Description || 'Elevate your ethnic look with this premium silver ornament crafted with precision and attention to detail.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[
        styles.bottomContainer,
        {
          backgroundColor: colors.card,
          shadowColor: 'rgba(195,123,95,0.25)',
        },
      ]}>
        <View style={[GlobalStyleSheet.container, { paddingHorizontal: 15 }]}>
          <View style={styles.buttonRow}>
            {/* Favorite Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={isFavorite ? 'In Wishlist' : 'Add to Fav'}
                onPress={handleFavoriteToggle}
                color={isFavorite ? COLORS.success : COLORS.secondary}
                textColor={isFavorite ? COLORS.white : colors.title}
                btnRounded
                icon={
                  <Feather
                    name="heart"
                    size={18}
                    color={isFavorite ? COLORS.black : colors.title}
                    style={{ marginRight: 8 }}
                  />
                }
                loading={favoriteLoading}
                disabled={favoriteLoading}
              />
            </View>

            {/* Cart Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={
                  cartLoading
                    ? 'Adding...'
                    : isInCart
                      ? 'Go to Cart'
                      : 'Add To Cart'
                }
                onPress={() => {
                  if (isInCart) {
                    navigation.navigate('MyCart');
                  } else {
                    handleAddToCart();
                  }
                }}
                color={COLORS.primary}
                btnRounded
                loading={cartLoading}
                disabled={cartLoading}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  favoriteButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 15,
    right: 20,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 15,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowOffset: { width: 2, height: -20 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  buttonContainer: {
    flex: 1,
  },
});

export default ProductDetails;