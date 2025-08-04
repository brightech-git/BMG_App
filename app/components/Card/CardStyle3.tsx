import React from 'react';
import { useTheme } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import LikeBtn from '../LikeBtn';
import { IMAGES } from '../../constants/Images';

type Props = {
  id: string;
  title: string;
  color?: any;
  price: string;
  image?: any;
  offer?: string;
  btntitel?: any;
  CardStyle4?: boolean;
  removebtn?: boolean;
  discount?: string;
  grid?: boolean;
  review?: string;
  likeBtn?: boolean;
  onPress?: () => void;
  CardStyle5?: boolean;
  success?: boolean;
  onPress1?: () => void;
  onPress2?: () => void;
};

const CardStyle3 = ({
  onPress1,
  onPress2,
  id,
  title,
  CardStyle4,
  price,
  discount,
  image,
  btntitel,
  onPress,
  removebtn,
  grid,
  review,
  likeBtn,
  offer,
  CardStyle5,
  success,
}: Props) => {
  const theme = useTheme();
  const { colors } = theme;

  const getImageUrl = (): string => {
    const BASE_IMAGE_URL = 'https://app.bmgjewellers.com/uploads/';
    let imageUrl = '';

    if (!image) return 'https://yourdomain.com/default-image.png';

    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;

      try {
        const parsed = JSON.parse(image);
        if (Array.isArray(parsed) && parsed.length > 0) {
          imageUrl = parsed[0];
        } else {
          imageUrl = image;
        }
      } catch {
        imageUrl = image;
      }
    } else if (Array.isArray(image) && image.length > 0) {
      imageUrl = image[0];
    }

    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = BASE_IMAGE_URL + imageUrl.replace(/^\/+/, '');
    }

    return imageUrl || 'https://yourdomain.com/default-image.png';
  };

  return (
    <View
      style={[
        {
          shadowColor: 'rgba(195, 123, 95, 0.25)',
          shadowOffset: { width: 2, height: 20 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          marginTop: 15,
        },
        Platform.OS === 'ios' && {
          backgroundColor: colors.card,
          borderRadius: 20,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.card,
          borderRadius: 20,
        }}
        onPress={onPress} // ✅ Use the passed in onPress function
      >
        <Image
          style={{
            height: null,
            width: 150,
            aspectRatio: 1 / 1,
            resizeMode: 'contain',
          }}
          source={{ uri: getImageUrl() }}
        />

        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={onPress}>
            <Text
              numberOfLines={1}
              style={{
                ...FONTS.Marcellus,
                fontSize: 18,
                color: colors.title,
                flex: 1,
              }}
            >
              {title}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              marginTop: 5,
            }}
          >
            <Text style={{ ...FONTS.Marcellus, fontSize: 18, color: colors.title }}>{price}</Text>
            {discount && (
              <Text
                style={{
                  ...FONTS.Marcellus,
                  fontSize: 14,
                  textDecorationLine: 'line-through',
                  color: theme.dark ? 'rgba(255,255,255,.7)' : 'rgba(0, 0, 0, 0.70)',
                }}
              >
                {discount}
              </Text>
            )}
            {(grid || CardStyle4) && (
              <Text
                style={{
                  ...FONTS.fontRegular,
                  fontSize: 14,
                  color: theme.dark ? 'rgba(255,255,255,.5)' : 'rgba(0, 0, 0, 0.50)',
                }}
              >
                {review || '(2K Review)'}
              </Text>
            )}
          </View>

          {grid && (
            <Text
              style={{
                ...FONTS.fontMedium,
                fontSize: 16,
                color: COLORS.success,
                marginTop: 5,
              }}
            >
              In Delivery
            </Text>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}
          >
            {grid ? (
              <Text
                style={{
                  ...FONTS.fontMedium,
                  fontSize: 14,
                  color: COLORS.danger,
                }}
              >
                {offer}
              </Text>
            ) : CardStyle5 ? (
              <Text
                style={{
                  ...FONTS.fontMedium,
                  fontSize: 14,
                  color: success ? COLORS.success : COLORS.danger,
                }}
              >
                {offer}
              </Text>
            ) : (
              <TouchableOpacity activeOpacity={0.5} onPress={onPress1}>
                <Text
                  style={{
                    ...FONTS.fontMedium,
                    fontSize: 14,
                    color: '#B75151',
                  }}
                >
                  Remove From Wishlist
                </Text>
              </TouchableOpacity>
            )}

            {!removebtn && (
              <TouchableOpacity
                activeOpacity={0.5}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  position: 'absolute',
                  right: 0,
                  bottom: Platform.OS === 'web' ? -49 : -49,
                  backgroundColor: COLORS.primary,
                  borderBottomRightRadius: 20,
                  borderTopLeftRadius: 20,
                  height: 45,
                  width: 45,
                  justifyContent: 'center',
                }}
                onPress={onPress2}
              >
                <Image
                  style={{
                    height: 24,
                    width: 24,
                    resizeMode: 'contain',
                    tintColor: colors.card,
                  }}
                  source={IMAGES.shopping}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {likeBtn && (
          <TouchableOpacity style={{ position: 'absolute', top: 0, left: 0 }}>
            <LikeBtn onPress={onPress1} id={id} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CardStyle3;
