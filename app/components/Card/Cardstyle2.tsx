import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { FONTS, COLORS } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import LikeBtn from '../LikeBtn';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromwishList } from '../../redux/reducer/wishListReducer';

import fallbackImage from '../../assets/images/item/pic44.png'; // <-- your fallback image

type Props = {
  id: string;
  title: string;
  color?: any;
  price: string;
  image?: string | { uri: string };
  offer?: string;
  delivery?: any;
  mindiscount?: any;
  marginTop?: any;
  discount?: any;
  wishlist?: any;
  card3?: any;
  likebtn?: any;
  onPress?: () => void;
  onPress1?: (e: any) => void;
};

const Cardstyle2 = ({
  id,
  onPress1,
  image,
  price,
  discount,
  delivery,
  title,
  mindiscount,
  onPress,
  marginTop,
  likebtn,
}: Props) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const dispatch = useDispatch();
  const wishList = useSelector((state: any) => state.wishList.wishList);
  const [imageError, setImageError] = useState(false);

  const inWishlist = () => wishList.map((data: any) => data.id);
  const removeItemFromWishList = () => dispatch(removeFromwishList(id));

  // Validate image URL or fallback
  const imageSource = imageError
    ? fallbackImage
    : typeof image === 'string' && image
    ? { uri: image }
    : typeof image === 'object' && image?.uri
    ? image
    : fallbackImage;

  return (
    <View
      style={[
        {
          shadowColor: 'rgba(195, 123, 95, 0.25)',
          shadowOffset: { width: 5, height: 20 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          marginTop: marginTop ? 15 : 0,
        },
        Platform.OS === 'ios' && {
          backgroundColor: colors.card,
          borderRadius: 20,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={{ backgroundColor: colors.card, borderRadius: 20 }}
        onPress={onPress}
      >
        {/* Title */}
        <View style={{ paddingHorizontal: 15, paddingTop: 15, paddingRight: 0 }}>
          <Text style={{ ...FONTS.Marcellus, fontSize: 16, color: colors.title }}>
            {title ?? 'Untitled'}
          </Text>
        </View>

        {/* Image */}
        <Image
          style={{ width: '100%', height: undefined, aspectRatio: 1 / 0.8 }}
          source={imageSource}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />

        {/* Pricing */}
        <View style={{ padding: 15, paddingTop: 0, alignItems: mindiscount ? 'center' : undefined }}>
          {mindiscount ? (
            <Text style={{ ...FONTS.fontSemiBold, fontSize: 15, color: COLORS.success }}>
              {discount}
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={{ ...FONTS.fontSemiBold, fontSize: 14, color: colors.title }}>
                ₹{price}
              </Text>
              {discount && (
                <Text
                  style={{
                    ...FONTS.fontRegular,
                    fontSize: 12,
                    textDecorationLine: 'line-through',
                    color: theme.dark ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,0.7)',
                    marginRight: 5,
                  }}
                >
                  ₹{discount}
                </Text>
              )}
              {delivery && (
                <Text
                  numberOfLines={1}
                  style={{
                    ...FONTS.fontMedium,
                    fontSize: 13,
                    color: COLORS.success,
                    paddingRight: 40,
                  }}
                >
                  {delivery}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Like Button */}
        {likebtn && (
          <View style={{ position: 'absolute', right: 5, top: 5 }}>
            <TouchableOpacity
              style={{
                height: 38,
                width: 38,
                borderRadius: 38,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LikeBtn
                onPress={inWishlist().includes(id) ? removeItemFromWishList : onPress1}
                id={id}
                inWishlist={inWishlist}
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Cardstyle2;
