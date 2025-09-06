import React, { useRef } from "react";
import {
  View,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
} from "react-native";
import { Option, StateSetter } from "../constants/interfaces";
import { ImageNameType, MyImage } from "./MyImages";
import { MyIcon } from "./MyIcon";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width / 5;

const LOOP_MULTIPLIER = 3; // repeat data to simulate infinity

export default function AvatarSelector({
  value,
  onChangeValue,
  options,
}: {
  value: string | number | null;
  onChangeValue: StateSetter<string | number | null>;
  options: Option[];
}) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<Animated.FlatList<any>>(null);

  const loopData = Array.from(
    { length: options.length > 1 ? LOOP_MULTIPLIER : 1 },
    () => options ?? []
  ).flat();

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_SIZE);

    onChangeValue?.(
      options.find((_, ind) => index % options.length === ind)?.id ?? ""
    );

    if (index >= loopData.length - options.length) {
      listRef.current?.scrollToOffset({
        offset: ((index % options.length) + options.length) * ITEM_SIZE,
        animated: false,
      });
    }
  };

  return (
    <View style={{ justifyContent: "center", marginVertical: 5 }}>
      <Animated.FlatList
        ref={listRef}
        data={loopData}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_SIZE}
        decelerationRate="fast"
        bounces={false}
        getItemLayout={(_, index) => ({
          length: ITEM_SIZE,
          offset: ITEM_SIZE * index,
          index,
        })}
        onMomentumScrollEnd={handleScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: (width - ITEM_SIZE) / 2,
        }}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 2) * ITEM_SIZE,
            (index - 1) * ITEM_SIZE,
            index * ITEM_SIZE,
            (index + 1) * ITEM_SIZE,
            (index + 2) * ITEM_SIZE,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 0.8, 1, 0.8, 0.6],
            extrapolate: "clamp",
          });

          return (
            <View style={{ width: ITEM_SIZE, alignItems: "center" }}>
              <Animated.View style={{ transform: [{ scale }] }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: item.color ?? "white",
                    borderWidth: 1,
                    borderRadius: 100000,
                    width: 80,
                    aspectRatio: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon ? (
                    <MyIcon icon={item.icon} size={40} />
                  ) : (
                    <MyImage
                      image={
                        (
                          item.name.replace(" ", "") as string
                        ).toLowerCase() as ImageNameType
                      }
                      width={40}
                    />
                  )}
                  <Text style={{ textAlign: "center" }}>{item.id}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          );
        }}
      />
    </View>
  );
}
