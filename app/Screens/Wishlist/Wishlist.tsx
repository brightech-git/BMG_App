import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import Header from '../../layout/Header';
import CardStyle3 from '../../components/Card/CardStyle3';
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
  const { colors } = useTheme();
  const { wishList, loading } = useSelector((state: any) => state.wishList);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchWishList());
    }, [dispatch])
  );

  const handleRemove = useCallback(async (sno: string) => {
    try {
      await dispatch(removeProductFromWishList(sno)).unwrap();
      Alert.alert('Removed', 'Item removed from wishlist.');
    } catch (err) {
      Alert.alert('Error', 'Failed to remove item from wishlist.');
    }
  }, [dispatch]);

  const handleAddToCart = useCallback(async (item: any, imageUrl: string) => {
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
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  }, [dispatch, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchWishList());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const EmptyWishlist = useMemo(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Feather color={COLORS.primary} size={24} name="heart" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.title }]}>
        Your Wishlist is Empty!
      </Text>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        Add product to your favourite and shop now.
      </Text>
    </View>
  ), [colors]);

  const renderItem = useCallback((data: any, index: number) => {
    if (!data?.SNO) {
      console.warn('Skipping item with no SNO:', data);
      return null;
    }

    let imageUrl = '';
    try {
      if (data.ImagePath) {
        const parsed = typeof data.ImagePath === 'string' 
          ? JSON.parse(data.ImagePath) 
          : data.ImagePath;
        if (Array.isArray(parsed) && parsed.length > 0) {
          imageUrl = parsed[0];
        }
      }
    } catch (err) {
      console.warn('ImagePath parse error:', err);
    }

    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${BASE_IMAGE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    return (
      <CardStyle3
        id={data.SNO}
        key={`${data.SNO}-${index}`}
        title={data.ITEMNAME || 'Product'}
        price={`₹${data.GrandTotal || data.GrossAmount || 0}`}
        image={imageUrl}
        discount={`₹${data.GrossAmount || 0}`}
        onPress1={() => handleRemove(data.SNO)}
        onPress2={() => handleAddToCart(data, imageUrl)}
        onPress={() => navigation.navigate('ProductDetails', { sno: data.SNO })}
        review={`(${data.GRSWT}g • ${data.PURITY}% Pure)`}
        CardStyle4
      />
    );
  }, [handleAddToCart, handleRemove, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Wishlist" rightIcon2="search" leftIcon="back" />

      <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
        <View style={styles.scrollContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          >
            <View style={styles.listContainer}>
              {loading ? (
                <ActivityIndicator 
                  size="large" 
                  color={COLORS.primary} 
                  style={styles.loadingIndicator}
                />
              ) : wishList.length > 0 ? (
                wishList.map(renderItem)
              ) : (
                EmptyWishlist
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = {
  scrollContainer: {
    marginHorizontal: -15,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 190,
    flexGrow: 1,
  },
  listContainer: {
    marginTop: -10,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    height: 60,
    width: 60,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    marginBottom: 20,
  },
  emptyTitle: {
    ...FONTS.h5,
    marginBottom: 8,
  },
  emptyText: {
    ...FONTS.fontSm,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
};

export default Wishlist;