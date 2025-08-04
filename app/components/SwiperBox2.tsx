import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { COLORS, FONTS } from '../constants/theme';
import { IMAGES } from '../constants/Images';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default class SwiperBox2 extends Component {
  _swipeableRow: any;

  updateRef = (ref: any) => {
    this._swipeableRow = ref;
  };

  close = () => {
    this._swipeableRow?.close();
  };

  rightSwipe = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [45, 90],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        onPress={() => {
          this.close();
          this.props.handleDelete();
        }}
        activeOpacity={0.6}
      >
        <View
          style={[
            styles.deleteBox,
            {
              backgroundColor: this.props.theme.dark
                ? COLORS.white
                : COLORS.primary,
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Image
              source={IMAGES.delete}
              style={{
                height: 20,
                width: 20,
                resizeMode: 'contain',
                tintColor: this.props.theme.dark
                  ? COLORS.primary
                  : COLORS.white,
              }}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  getFirstImage = (imagePathString: string) => {
    try {
      const parsed = JSON.parse(imagePathString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0].startsWith('http')
          ? parsed[0]
          : `https://app.bmgjewellers.com${parsed[0]}`;
      }
    } catch (e) {
      console.warn('Failed to parse ImagePath:', e);
    }
    return null;
  };

  render() {
    const { data, colors, theme, onPress } = this.props;
    const product = data?.fullDetails || data;

    const title = product?.ITEMNAME?.trim() || 'Unnamed Product';
    const price = product?.GrandTotal ? `₹${parseFloat(product.GrandTotal).toFixed(2)}` : '₹0';
    const imageUri = this.getFirstImage(product?.ImagePath || '');

    const tagKey = product?.TAGKEY || 'N/A';
    const grswt = product?.GRSWT?.toFixed(3) || '0.000';
    const purity = product?.PURITY?.toFixed(2) || '0.00';

    const sno = product?.SNO;

    return (
      <Swipeable
        ref={this.updateRef}
        friction={2}
        renderRightActions={this.rightSwipe}
        rightThreshold={40}
      >
        <TouchableOpacity
          onPress={() => {
            if (onPress && sno) {
              onPress(sno);
            }
          }}
          activeOpacity={0.8}
          style={[styles.container, Platform.OS === 'ios' && { backgroundColor: colors.card }]}
        >
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.imageContainer}>
              <Image
                source={imageUri ? { uri: imageUri } : IMAGES.placeholder}
                style={styles.productImage}
              />
            </View>

            <View style={styles.detailsContainer}>
              <Text
                style={[styles.title, { color: colors.title }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {title}
              </Text>

              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: colors.title }]}>
                  {price}
                </Text>
              </View>

              <View style={styles.metaContainer}>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: colors.text }]}>
                    Tag No:
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>
                    {tagKey}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: colors.text }]}>
                    GR.WT:
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>
                    {grswt}g
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: colors.text }]}>
                    Purity:
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>
                    {purity}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    shadowColor: 'rgba(195, 123, 95, 0.25)',
    shadowOffset: { width: 2, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  imageContainer: {
    marginRight: 15,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...FONTS.Marcellus,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 5,
  },
  priceContainer: {
    marginBottom: 10,
  },
  price: {
    ...FONTS.Marcellus,
    fontSize: 16,
    fontWeight: '500',
  },
  metaContainer: {
    marginTop: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaLabel: {
    ...FONTS.Marcellus,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
    minWidth: 60,
  },
  metaValue: {
    ...FONTS.Marcellus,
    fontSize: 14,
  },
  deleteBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginRight: 15,
  },
});
