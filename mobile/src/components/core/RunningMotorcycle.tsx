import React, { useRef, useEffect, useState } from "react";
import { View, Animated, Dimensions, StyleSheet, Easing } from "react-native";
import { MyIcon } from "../../blueprints/MyIcon";
// import MyIcon from './MyIcon'; // Adjust import path as needed

const { width: screenWidth } = Dimensions.get("window");

export const RunningMotorcycle = ({
  speed = 3000, // Duration in ms for one complete cycle
  iconSize = 40,
  iconColor = "white",
  backgroundColor = "transparent",
  multiple = true, // Show multiple motorcycles
  reverse = true, // Reverse direction
}) => {
  const translateX = useRef(new Animated.Value(-iconSize)).current;
  const translateX2 = useRef(
    new Animated.Value(-iconSize - screenWidth / 2)
  ).current;
  const rotateY = useRef(new Animated.Value(0)).current;

  // Speed lines animations
  const [speedLineAnims] = useState(() =>
    Array(6)
      .fill(0)
      .map(() => new Animated.Value(screenWidth))
  );

  useEffect(() => {
    const startPosition = reverse ? screenWidth + iconSize : -iconSize;
    const endPosition = reverse ? -iconSize : screenWidth + iconSize;

    // Set initial positions
    translateX.setValue(startPosition);
    if (multiple) {
      translateX2.setValue(startPosition - screenWidth / 2);
    }

    // Flip icon if going in reverse
    rotateY.setValue(reverse ? 1 : 0);

    const createAnimation = (animatedValue: Animated.Value, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: endPosition,
            duration: speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          // Reset to start position instantly
          Animated.timing(animatedValue, {
            toValue: startPosition,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start animations
    const animation1 = createAnimation(translateX);
    const animations = [animation1];

    if (multiple) {
      const animation2 = createAnimation(translateX2, speed / 2);
      animations.push(animation2);
    }

    animations.forEach((anim) => anim.start());

    // Animate speed lines
    const createSpeedLineAnimation = (
      animValue: Animated.Value,
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: -100,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: screenWidth,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const speedLineAnimations = speedLineAnims.map((anim, index) =>
      createSpeedLineAnimation(anim, index * 150)
    );

    speedLineAnimations.forEach((anim) => anim.start());

    // Cleanup
    return () => {
      animations.forEach((anim) => anim.stop());
      speedLineAnimations.forEach((anim) => anim.stop());
    };
  }, [speed, reverse, multiple, iconSize, speedLineAnims]);

  const motorcycleStyle = {
    transform: [
      { translateX },
      {
        rotateY: rotateY.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  const motorcycle2Style = multiple
    ? {
        transform: [
          { translateX: translateX2 },
          {
            rotateY: rotateY.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "180deg"],
            }),
          },
        ],
      }
    : null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Road lines for effect */}
      <View style={styles.road}>
        <View style={styles.roadLine} />
        <View style={[styles.roadLine, styles.roadLineBottom]} />
      </View>

      {/* First motorcycle */}
      <Animated.View style={[styles.motorcycle, motorcycleStyle]}>
        {/* Exhaust effect */}
        <View style={styles.exhaustContainer}>
          <View style={[styles.exhaust, styles.exhaust1]} />
          <View style={[styles.exhaust, styles.exhaust2]} />
          <View style={[styles.exhaust, styles.exhaust3]} />
        </View>
        <MyIcon icon="motorcycle" color={"cyan"} size={iconSize} />
      </Animated.View>

      {/* Second motorcycle (if multiple enabled) */}
      {multiple && (
        <Animated.View style={[styles.motorcycle, motorcycle2Style]}>
          <View style={styles.exhaustContainer}>
            <View style={[styles.exhaust, styles.exhaust1]} />
            <View style={[styles.exhaust, styles.exhaust2]} />
            <View style={[styles.exhaust, styles.exhaust3]} />
          </View>
          <MyIcon icon="motorcycle" color={"pink"} size={iconSize} />
        </Animated.View>
      )}

      {/* Speed lines effect */}
      <View style={styles.speedLines}>
        {speedLineAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.speedLine,
              {
                top: `${20 + i * 12}%`,
                transform: [{ translateX: anim }],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 120,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
  },
  road: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  roadLine: {
    position: "absolute",
    height: 2,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    top: "45%",
  },
  roadLineBottom: {
    top: "55%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: 1,
  },
  motorcycle: {
    position: "absolute",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  exhaustContainer: {
    flexDirection: "row",
    marginLeft: -8,
    alignItems: "center",
  },
  exhaust: {
    width: 8,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginLeft: 2,
    borderRadius: 1,
  },
  exhaust1: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  exhaust2: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    width: 6,
  },
  exhaust3: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    width: 4,
  },
  speedLines: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  speedLine: {
    position: "absolute",
    height: 1,
    width: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    left: "10%",
    opacity: 0.5,
  },
});

export default RunningMotorcycle;
