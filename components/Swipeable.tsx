import React from 'react';
import { ViewStyle } from 'react-native';

import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import {
  SharedValue
} from 'react-native-reanimated';

interface SwipeableProps {
  containerStyle?: ViewStyle;
  renderRightActions: (prog: SharedValue<number>, drag: SharedValue<number>) => React.ReactNode;
  children: React.ReactNode;
}

export default function Swipeable({renderRightActions,containerStyle,children}:SwipeableProps) {
  return (
    <ReanimatedSwipeable
      containerStyle={[containerStyle]}
      friction={2}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      renderRightActions={renderRightActions}>
      {children}
    </ReanimatedSwipeable>
  );
}
