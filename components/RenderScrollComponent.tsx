import React from "react";
import { ScrollView, ScrollViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const RenderScrollComponent = React.forwardRef<ScrollView, ScrollViewProps>(
  (props, ref) => <KeyboardAwareScrollView {...props} ref={ref} />,
);

export default RenderScrollComponent;