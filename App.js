import { View, Text, SafeAreaView, ScrollView, Dimensions, Image, ImageBackground } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import Video from 'react-native-video'
import { createThumbnail } from "react-native-create-thumbnail";

const data = [
  {
    attachments: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
    is_video: 0
  },
  {
    attachments: "https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg",
    is_video: 0
  },
  {
    attachments: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    is_video: 1,
    img: "file:///data/user/0/com.silderapp/cache/thumbnails/thumb-44521a7d-69ea-4705-a889-ce3e37a27313"
  },
  {
    attachments: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    is_video: 1,
    img: "file:///data/user/0/com.silderapp/cache/thumbnails/thumb-b0a7bde8-38e7-4774-b635-4c05bd87a709"
  }
]
const App = () => {

  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplayActive, setAutoplayActive] = useState(true);
  const scrollViewRef = useRef();
  const autoplayInterval = 5000;
  const [onSwipe, setOnSwipe] = useState(false);

  useEffect(() => {
    let autoplayTimer;
    if (data.length > 0) {
      let isPlay = data[currentIndex].is_video == 1 ? false : true;
      if (isPlay) {
        autoplayTimer = setTimeout(() => {
          const nextIndex = (currentIndex + 1) % data.length;
          scrollViewRef.current.scrollTo({
            x: nextIndex * Dimensions.get('window').width * 0.9,
            animated: true,
          });
          setCurrentIndex(nextIndex);
        }, autoplayInterval);
      }
    }
    return () => clearTimeout(autoplayTimer);
  }, [autoplayActive, currentIndex, data]);

  useEffect(() => {
    // Initialize videoRefs array with refs for all videos
    videoRefs.current = Array(data.length)
      .fill()
      .map((_, index) => videoRefs.current[index] || React.createRef());
  }, [data.length]);


  const handleVideoEnd = () => {
    const nextIndex = (currentIndex + 1) % data.length;
    scrollViewRef.current.scrollTo({
      x: nextIndex * Dimensions.get('window').width * 0.9,
      animated: false,
    });



    setTimeout(() => {
      setAutoplayActive(true);
      setCurrentIndex(nextIndex);
      videoRefs.current.forEach((videoRef, index) => {
        if (videoRef && videoRef.current) {
          if (index == currentIndex)
            videoRef.current.seek(0);
        }
      });
    }, 1000);
  };

  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const contentWidth = event.nativeEvent.contentSize.width;
    const viewportWidth = Dimensions.get('window').width;
    const currentIndex = Math.round(scrollOffset / viewportWidth);
    setCurrentIndex(currentIndex);

    // Determine if the scroll is at the last index based on the scroll position and content width
    const isAtLastIndex = scrollOffset + viewportWidth >= contentWidth - 1;
    const isAtFirstIndex = scrollOffset === 0;


    if (isAtLastIndex) {
      setCurrentIndex(data.length - 1)
    }
    if (isAtLastIndex && data[currentIndex].is_video === 1) {
      setAutoplayActive(false); // Pause autoplay when scrolling to a video
    } else {
      setAutoplayActive(true); // Resume autoplay for images or when not at last index
    }
  };

  const scrollToIndex = (index) => {
    scrollViewRef.current.scrollTo({
      x: index * Dimensions.get('window').width,
      animated: false,
    });
  };


  return (
      <View
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text
          style={{
            top: '20%',
            width: '80%',
            textAlign: 'center',
            fontSize: 25,
            fontWeight: '600',
            color: "#000"
          }}
        >
          React Native image and video silder
        </Text>
        <View
          style={{
            top: '15%',
            width: '100%',
            height: Dimensions.get('window').width * 0.9,
            alignItems: 'center'
          }}
        >
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled={true}  // Enables paging behavior
            showsHorizontalScrollIndicator={false}  // Hides horizontal scroll indicators
            style={{
              flex: 1,
              width: Dimensions.get('window').width * 0.9
            }}
            clipChildren={true}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onScrollBeginDrag={(event) => {
              setOnSwipe(true)
            }}
            overScrollMode="never"
            bounces={false}
            onScrollEndDrag={(event) => {
              if (onSwipe) {
                const contentOffsetX = event.nativeEvent.contentOffset.x;
                const contentSizeWidth = event.nativeEvent.contentSize.width;
                const layoutMeasurementWidth = event.nativeEvent.layoutMeasurement.width;

                // Check if at the first index and trying to scroll left
                if (contentOffsetX === 0 && currentIndex == 0) {

                  scrollToIndex(data.length - 1)
                }

                // Check if at the last index and trying to scroll right
                if (contentOffsetX + layoutMeasurementWidth === contentSizeWidth && currentIndex == data.length - 1) {

                  scrollToIndex(0)
                }
                videoRefs.current.forEach((videoRef, index) => {
                  if (videoRef && videoRef.current) {
                    videoRef.current.seek(0); // Reset all videos to the beginning
                  }
                });
              }
              setOnSwipe(false)
            }}
          >
            {data.map((item, index) => {
              return (
                <View
                  key={index}
                  style={{
                    width: Dimensions.get('window').width * 0.9, // Use the full width of the screen
                    height: Dimensions.get('window').width * 0.9,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.is_video == 0 ? (<Image
                    source={{ uri: item.attachments }}
                    resizeMode='cover'
                    style={{
                      width: Dimensions.get('window').width * 0.9,  // Making the image a bit narrower than the container for aesthetics
                      height: Dimensions.get('window').width * 0.9, // Fill the container height
                      borderRadius: 10
                    }}
                  />) : (
                    <Video
                      ref={videoRefs.current[index]}
                      source={{ uri: item.attachments }}
                      controls={false}
                      paused={index !== currentIndex} // Pause video if it's not the current slide
                      repeat={false}
                      onEnd={handleVideoEnd}
                      resizeMode="cover"
                      poster={item.img}
                      posterResizeMode="cover"
                      style={{
                        width: '100%',
                        height: Dimensions.get('window').width * 0.9,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        borderWidth: 1,
                        borderColor: "#000",
                        borderRadius: 10
                      }}
                    />
                  )}
                </View>
              )
            })}
          </ScrollView>

          <View style={{ position: 'absolute', flexDirection: 'row', justifyContent: 'center', bottom: 10 }}>
            {data.length > 1 && data.map((item, index) => (
              index == currentIndex ? (<View
                style={{
                  height: 8,
                  width: 15,
                  backgroundColor: "#24C9B6",
                  borderRadius: 50,
                  bottom: 10,
                  marginHorizontal: 5
                }}
              />) :
                (<View
                  style={{
                    height: 8,
                    width: 8,
                    backgroundColor: "#58595B",
                    borderRadius: 50,
                    bottom: 10,
                    marginHorizontal: 5
                  }}
                />)
            ))}
          </View>
        </View>
      </View >
  )
}

export default App