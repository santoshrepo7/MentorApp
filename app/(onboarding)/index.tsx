import { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';

const slides = [
  {
    id: '1',
    title: 'Find Your Perfect Mentor',
    quote: '"The delicate balance of mentoring someone is not creating them in your own image, but giving them the opportunity to create themselves."',
    author: '— Steven Spielberg',
    image: 'https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Connect with industry experts who can guide you on your professional journey.'
  },
  {
    id: '2',
    title: 'Learn from the Best',
    quote: '"A mentor is someone who allows you to see the hope inside yourself."',
    author: '— Oprah Winfrey',
    image: 'https://images.pexels.com/photos/7516339/pexels-photo-7516339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Gain insights and knowledge from experienced professionals in your field.'
  },
  {
    id: '3',
    title: 'Achieve Your Goals',
    quote: '"The greatest good you can do for another is not just to share your riches but to reveal to him his own."',
    author: '— Benjamin Disraeli',
    image: 'https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Transform your career with personalized guidance and support.'
  }
];

// Separate functional component for rendering slides
function SlideItem({ item, index, screenWidth, translateX }) {
  const inputRange = [
    (index - 1) * screenWidth,
    index * screenWidth,
    (index + 1) * screenWidth
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      translateX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity
    };
  });

  return (
    <View style={[styles.slide, { width: screenWidth }]}>
      <Animated.View style={[styles.slideContent, animatedStyle]}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.overlay} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.quote}>{item.quote}</Text>
          <Text style={styles.author}>{item.author}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      router.replace('/sign-in');
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true
      });
    }
  };

  const handleSkip = () => {
    router.replace('/sign-in');
  };

  const renderItem = ({ item, index }) => (
    <SlideItem
      item={item}
      index={index}
      screenWidth={screenWidth}
      translateX={translateX}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          translateX.value = nativeEvent.contentOffset.x;
          setCurrentIndex(Math.round(nativeEvent.contentOffset.x / screenWidth));
        }}
        scrollEventThrottle={16}
        keyExtractor={item => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.previousButton]}
              onPress={handlePrevious}>
              <ChevronLeft size={24} color="#0891b2" />
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <ChevronRight size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {currentIndex < slides.length - 1 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
  },
  imageContainer: {
    height: '60%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  textContainer: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  quote: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  author: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#0891b2',
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 120,
  },
  previousButton: {
    backgroundColor: '#f1f5f9',
  },
  previousButtonText: {
    color: '#0891b2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#0891b2',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  skipButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    padding: 8,
  },
  skipButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
});
