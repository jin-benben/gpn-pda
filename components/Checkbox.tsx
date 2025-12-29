import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle
} from "react-native";

export type CheckboxProps = {
  // Controlled checked value. If provided, component is controlled.
  checked?: boolean;
  // Default for uncontrolled mode
  defaultChecked?: boolean;
  // Callback when value changes
  onValueChange?: (checked: boolean) => void;
  // Disabled state
  disabled?: boolean;
  // Indeterminate state (visual only). When indeterminate is true, box shows a dash.
  indeterminate?: boolean;
  // Optional label (rendered to the right)
  label?: React.ReactNode;
  // Color of checked box / indicator
  color?: string;
  // Size of the square box (px)
  size?: number;
  // Styles
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

/**
 * Checkbox - 支持受控/非受控，indeterminate，disabled，简单动画
 *
 * 使用:
 * <Checkbox label="同意协议" defaultChecked onValueChange={v => console.log(v)} />
 */
export default function Checkbox({
  checked,
  defaultChecked = false,
  onValueChange,
  disabled = false,
  indeterminate = false,
  label,
  color = "#e40614",
  size = 22,
  style,
  labelStyle,
}: CheckboxProps) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState<boolean>(defaultChecked);
  const isChecked = isControlled ? !!checked : internalChecked;




  const toggle = () => {
    if (disabled) return;
    const next = indeterminate ? true : !isChecked; // 点击 indeterminate 时走到 checked
    if (!isControlled) setInternalChecked(next);
    onValueChange?.(next);
  };

 
  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked, disabled }}
      accessibilityLabel={typeof label === "string" ? label : undefined}
      style={[styles.container, style]}
      disabled={disabled}
    >
      <View>
        <>
          {indeterminate ? (
            // 中间横线表示 indeterminate
            <MaterialIcons name="indeterminate-check-box" size={size} color={color} />
          ) : (
            <>
              {
                isChecked ? (
                  <MaterialIcons name="check-box" size={size} color={color} style={[disabled&&styles.boxDisabled]}/>
                ) : (
                  <MaterialIcons name="check-box-outline-blank" size={size} color="#666" />
                )
              }
              
            </>

          )}
        </>
      </View>
      {/* label */}
      {label ? <Text style={[styles.label, labelStyle, disabled && styles.labelDisabled]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  boxDisabled:{
    opacity:0.5
  },
  label: {
    marginLeft: 6,
    fontSize: 16,
    color: "#222",
  },
  labelDisabled: {
    color: "#999",
  },
});