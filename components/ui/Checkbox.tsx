import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState, useTransition } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

export interface CheckboxProps {
  value?: any;
  checkedValue?: any;
  unCheckedValue?: any;
  defaultValue?: any;
  onValueChange?: (value: any) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  label?: React.ReactNode;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

/**
 * Checkbox - 支持受控/非受控，indeterminate，disabled，简单动画
 *
 * 使用:
 * <Checkbox label="同意协议" defaultChecked onValueChange={v => console.log(v)} />
 */
export default function Checkbox({
  value,
  checkedValue=1,
  unCheckedValue=0,
  defaultValue,
  onValueChange,
  disabled = false,
  indeterminate = false,
  label,
  color = "#e40614",
  size = 22,
  style,
  labelStyle,
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState<boolean>(
    defaultValue == checkedValue || value == checkedValue
  );
  const [isTransition,startTransition] = useTransition()
  const toggle = () => {
    if (disabled) return;
    const next = !internalChecked;
    setInternalChecked(next);
    startTransition(()=>{
      onValueChange?.(next?checkedValue:unCheckedValue);
    })
  };

  return (
    <Pressable
      onPress={toggle}
      style={[styles.container, style]}
      disabled={disabled}
    >
      <>
        {indeterminate ? (
          // 中间横线表示 indeterminate
          <MaterialIcons
            name="indeterminate-check-box"
            size={size}
            color={color}
          />
        ) : (
          <>
            {internalChecked ? (
              <MaterialIcons
                name="check-box"
                size={size}
                color={color}
                style={[disabled && styles.boxDisabled]}
              />
            ) : (
              <MaterialIcons
                name="check-box-outline-blank"
                size={size}
                color="#666"
              />
            )}
          </>
        )}
      </>
      {/* label */}
      {label ? (
        <Text
          style={[styles.label, labelStyle, disabled && styles.labelDisabled]}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  boxDisabled: {
    opacity: 0.5,
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
