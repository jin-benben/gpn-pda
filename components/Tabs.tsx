import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export type TabItem = {
  key: string;
  title: string;
  badge?: number;
  // content can be a React node (component) or a function returning a node
  content: React.ReactNode | (() => React.ReactNode);
};

type Props = {
  tabs: TabItem[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  lazy?: boolean; // default true
  tabBarStyle?: ViewStyle;
  tabTextStyle?: TextStyle;
  activeTintColor?: string;
  inactiveTintColor?: string;
  indicatorStyle?: ViewStyle;
};

export default function Tabs({
  tabs,
  initialIndex = 0,
  onIndexChange,
  lazy = true,
  tabBarStyle,
  tabTextStyle,
  activeTintColor = "#0f62fe",
  inactiveTintColor = "#222",
  indicatorStyle,
}: Props) {
  const windowWidth = useRef(Dimensions.get("window").width).current;
  const [containerWidth, setContainerWidth] = useState(windowWidth);
  const [index, setIndex] = useState(initialIndex);
  const scrollX = useRef(new Animated.Value(initialIndex * windowWidth)).current;
  const scrollRef = useRef<ScrollView | null>(null);

  // store measured layouts of each tab (x, width)
  const [tabLayouts, setTabLayouts] = useState<Array<{ x: number; width: number } | null>>(
    () => tabs.map(() => null)
  );

  const [visited, setVisited] = useState<Set<number>>(() => new Set([initialIndex]));

  useEffect(() => {
    // if initialIndex changes from parent, move
    scrollToIndex(initialIndex, false);
    setIndex(initialIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIndex]);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth(w);
    // reposition to current index after width changes
    setTimeout(() => scrollToIndex(index, false), 0);
  };

  const onTabLayout = (i: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts((prev) => {
      const next = prev.slice();
      next[i] = { x, width };
      return next;
    });
  };

  const layoutsReady = useMemo(() => tabLayouts.every((l) => l !== null), [tabLayouts]);

  const scrollToIndex = (i: number, animated = true) => {
    const x = i * containerWidth;
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x, y: 0, animated });
    }
    setIndex(i);
    onIndexChange?.(i);
    setVisited((s) => {
      const next = new Set(s);
      next.add(i);
      return next;
    });
  };

  const handleTabPress = (i: number) => {
    scrollToIndex(i, true);
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false } 
  );

  // Animated values for indicator
  const indicatorTranslateX = layoutsReady
    ? scrollX.interpolate({
        inputRange: tabs.map((_, i) => i * containerWidth),
        outputRange: tabLayouts.map((l) => (l ? l.x : 0)),
        extrapolate: "clamp",
      })
    : scrollX.interpolate({
        inputRange: tabs.map((_, i) => i * containerWidth),
        outputRange: tabs.map((_, i) => (i * containerWidth) / tabs.length),
        extrapolate: "clamp",
      });

  const indicatorWidth = layoutsReady
    ? scrollX.interpolate({
        inputRange: tabs.map((_, i) => i * containerWidth),
        outputRange: tabLayouts.map((l) => (l ? l.width : containerWidth / tabs.length)),
        extrapolate: "clamp",
      })
    : new Animated.Value(containerWidth / Math.max(1, tabs.length));

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
    if (newIndex !== index) {
      setIndex(newIndex);
      onIndexChange?.(newIndex);
      setVisited((s) => {
        const next = new Set(s);
        next.add(newIndex);
        return next;
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.tabBar, tabBarStyle]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScroll}>
          {tabs.map((t, i) => {
            const active = i === index;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => handleTabPress(i)}
                onLayout={onTabLayout(i)}
                style={styles.tabButton}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabText, tabTextStyle, { color: active ? activeTintColor : inactiveTintColor }]}>
                  {t.title}
                </Text>
                {typeof t.badge === "number" && t.badge > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{t.badge}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
          {/* indicator */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              indicatorStyle,
              {
                transform: [{ translateX: indicatorTranslateX }],
                width: indicatorWidth,
              },
            ]}
          />
        </ScrollView>
      </View>

      <View style={{ flex: 1 }} onLayout={onContainerLayout}>
        <AnimatedScrollView
          ref={(r) => {
            // AnimatedScrollView types a bit weird; cast
            // @ts-ignore
            scrollRef.current = r;
          }}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEnd}
          contentContainerStyle={{ width: containerWidth * tabs.length }}
        >
          {tabs.map((t, i) => {
            const shouldRender = !lazy || visited.has(i) || i === index;
            return (
              <View key={t.key} style={{ width: containerWidth, flex: 1 }}>
                {shouldRender ? (typeof t.content === "function" ? t.content() : t.content) : null}
              </View>
            );
          })}
        </AnimatedScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  tabBarScroll: {
    position: "relative",
    alignItems: "center",
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  badge: {
    marginLeft: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ff3b30",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    height: 2,
    backgroundColor: "#0f62fe",
    bottom: 0,
    left: 0,
  },
});