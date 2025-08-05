import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, SafeAreaView, TextInput, Image, ActivityIndicator,
    TouchableOpacity, Platform
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { IMAGES } from '../../constants/Images';
import CardStyle3 from '../../components/Card/CardStyle3';
import Cardstyle2 from '../../components/Card/Cardstyle2';
import { BlurView } from 'expo-blur';
import { useDispatch } from 'react-redux';
import { addTowishList } from '../../redux/reducer/wishListReducer';
import { addToCart } from '../../redux/reducer/cartReducer';
import BottomSheet2 from '../Shortcode/BottomSheet2';
import { productService, ProductItem } from '../../Services/ProductService';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { API_BASE_URL } from '../Config/baseUrl';

type ProductsScreenProps = StackScreenProps<RootStackParamList, 'Products'>;

const sliderData = [
    { title: "Crazy Deals" },
    { title: "Budget Buys" },
    { title: "Best Offer" },
    { title: "Woman" },
    { title: "Dress" },
    { title: "Unisex" },
];

const Products = ({ navigation }: ProductsScreenProps) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    const dispatch = useDispatch();
    const sheetRef = useRef<any>();
    const scrollViewRef = useRef<any>();
    const [showGrid, setShowGrid] = useState(true);
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (pageNum: number = 0, append: boolean = false) => {
        if (pageNum > 0 && !hasMore) return;

        try {
            setLoadingMore(pageNum > 0);
            if (pageNum === 0) setLoading(true);

            const data = await productService.getFilteredProducts(pageNum, PAGE_SIZE);
            console.log('Fetched products:', data); // ✅ DEBUG HERE

            if (data.length < PAGE_SIZE) {
                setHasMore(false);
            }

            setProducts(prev => append ? [...prev, ...data] : data);
        } catch (err) {
            console.error('Error fetching products:', err); // ✅ DEBUG HERE
            setError('Failed to load products');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleScroll = ({ nativeEvent }: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

        if (isCloseToBottom && hasMore && !loadingMore) {
            setPage(prev => {
                const nextPage = prev + 1;
                fetchProducts(nextPage, true);
                return nextPage;
            });
        }
    };

    const addItemToWishList = (data: ProductItem) => dispatch(addTowishList(data));
    const addItemToCart = (data: ProductItem) => dispatch(addToCart(data));

    const renderProducts = () => {
        if (loading && page === 0) {
            return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
        }

        if (error) {
            return <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{error}</Text>;
        }

        if (products.length === 0) {
            return <Text style={{ color: colors.text, textAlign: 'center', marginTop: 20 }}>No products found</Text>;
        }

        if (showGrid) {
            return (
                <View style={[GlobalStyleSheet.row, { marginTop: 5 }]}>
                    {products.map((data, index) => (
                        <View key={index} style={[GlobalStyleSheet.col50, { marginBottom: 20 }]}>
                            <Cardstyle2
                                id={data.ITEMID}
                                title={data.SUBITEMNAME}
                                price={`₹${data.GrandTotal !== "0.00" ? data.GrandTotal : data.RATE}`}
                                image={data.ImagePaths?.[0]}
                            />
                        </View>
                    ))}
                </View>
            );
        }

        return (
            <View style={{ marginTop: -10 }}>
                {products.map((data, index) => (
                    <CardStyle3
                        key={index}
                        id={data.ITEMID}
                        image={data.ImagePaths?.[0] ?? IMAGES.placeholder}
                        title={data.ITEMNAME}
                        price={`₹${data.Rate}`}
                        discount={`₹${data.GrossAmount}`}
                        review={'(2k Reviews)'}
                        offer={data.Top_Trending ? 'Top Trending' : 'Best Seller'}
                        success={data.Featured_Products}
                        onPress={() => navigation.navigate('MyCart')}
                        onPress1={() => addItemToWishList(data)}
                        onPress2={() => {
                            addItemToCart(data);
                            navigation.navigate('MyCart');
                        }}
                        CardStyle4
                        CardStyle5
                        likeBtn
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            {/* Header */}
            <View style={[Platform.OS === "ios" && { shadowColor: 'rgba(195, 123, 95, 0.20)', shadowOffset: { width: 2, height: 4 }, shadowOpacity: .6, shadowRadius: 5 }]}>
                <View style={{
                    height: 60,
                    backgroundColor: theme.dark ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.4)',
                    borderBottomLeftRadius: 25,
                    borderBottomRightRadius: 25,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    {/* Back button */}
                    <View style={{ height: 40, width: 40, borderRadius: 15, backgroundColor: colors.card, justifyContent: 'center', marginLeft: 10 }}>
                        <IconButton
                            onPress={() => navigation.goBack()}
                            icon={props => <MaterialIcons name="arrow-back-ios" {...props} />}
                            iconColor={colors.title}
                            size={20}
                        />
                    </View>

                    {/* Search */}
                    <View style={{ height: 40, backgroundColor: colors.card, borderRadius: 10, marginLeft: 10, flex: 1 }}>
                        <TextInput
                            placeholder="Search Products"
                            placeholderTextColor={theme.dark ? 'rgba(255, 255, 255, .6)' : 'rgba(0, 0, 0, 0.6)'}
                            style={{ ...FONTS.fontRegular, fontSize: 16, color: colors.title, paddingLeft: 40, flex: 1, borderRadius: 15 }}
                        />
                        <View style={{ position: 'absolute', top: 9, left: 10 }}>
                            <Image style={{ height: 20, width: 20, tintColor: colors.title }} source={IMAGES.search} />
                        </View>
                    </View>

                    {/* Toggle & Cart */}
                    <TouchableOpacity onPress={() => setShowGrid(!showGrid)} style={{ padding: 10, marginLeft: 10 }}>
                        <Image style={{ height: 22, width: 22, tintColor: colors.title }} source={showGrid ? IMAGES.list : IMAGES.grid} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('MyCart')} style={{ padding: 10, marginRight: 10 }}>
                        <Image style={{ height: 20, width: 20, tintColor: colors.title }} source={IMAGES.shopping2} />
                        <View style={[GlobalStyleSheet.notification, { position: 'absolute', right: 3, bottom: 22 }]}>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 10, color: COLORS.white }}>14</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Category Tabs */}
            <View style={[GlobalStyleSheet.container, { paddingTop: 20 }]}>
                <View style={{ marginHorizontal: -15, marginBottom: 10 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {sliderData.map((data, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        backgroundColor: colors.card,
                                        height: 40,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 12,
                                        paddingHorizontal: 20
                                    }}
                                >
                                    <Text style={{ ...FONTS.fontMedium, fontSize: 13, color: colors.title }}>{data.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Product Grid/List */}
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={{ paddingBottom: 230, paddingHorizontal: 15 }}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    {renderProducts()}
                    {loadingMore && (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
                    )}
                </ScrollView>
            </View>

            {/* Bottom Sheet Filter Bar */}
            <View style={{
                width: '100%',
                position: 'absolute',
                bottom: 0,
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
            }}>
                <BlurView
                    style={{ width: '100%', height: Platform.OS === "ios" ? 80 : 60, borderRadius: 50 }}
                    blurType="light"
                    blurAmount={10}
                />
                <View style={{
                    backgroundColor: theme.dark ? 'rgba(0,0,0,0.50)' : 'rgba(255, 255, 255, 0.50)',
                    height: Platform.OS === "ios" ? 80 : 60,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25
                }}>
                    {[
                        { icon: IMAGES.user2, label: 'GENDER', key: 'gender' },
                        { icon: IMAGES.arrowup, label: 'SORT', key: 'short' },
                        { icon: IMAGES.filter, label: 'FILTER', key: 'filter' }
                    ].map(({ icon, label, key }) => (
                        <TouchableOpacity key={key} onPress={() => sheetRef.current.openSheet(key)} style={{ alignItems: 'center' }}>
                            <Image source={icon} style={{ height: 20, width: 20, tintColor: colors.title }} />
                            <Text style={{ ...FONTS.fontMedium, fontSize: 15, color: colors.title }}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* BottomSheet2 component */}
            <BottomSheet2 ref={sheetRef} />
        </SafeAreaView>
    );
};

export default Products;