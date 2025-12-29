import Checkbox from "@/components/Checkbox";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CheckboxExample() {
  // 受控示例
  const [checked, setChecked] = useState(false);
  // indeterminate 示例（通常用于全选：部分选中）
  const [all, setAll] = useState<boolean | "indeterminate">("indeterminate");

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Checkbox
          label="非受控（默认选中）"
          size={24}
          defaultChecked
          onValueChange={(v) => console.log("uncontrolled changed", v)}
        />
      </View>

      <View style={styles.row}>
        <Checkbox
          label="受控 checkbox"
          checked={checked}
          onValueChange={(v) => setChecked(v)}
        />
        <Text style={styles.hint}> 当前：{checked ? "checked" : "unchecked"}</Text>
      </View>

      <View style={styles.row}>
        <Checkbox
          label="全选（indeterminate 示例）"
          // 当 all === "indeterminate" 时，我们把 indeterminate 设为 true 并置为 unchecked 视觉
          checked={all === true}
          indeterminate={all === "indeterminate"}
          onValueChange={(v) => setAll(v ? true : false)}
        />
        <Text style={styles.hint}> 状态：{all === "indeterminate" ? "indeterminate" : String(all)}</Text>
      </View>

      <View style={styles.row}>
        <Checkbox label="禁用示例" disabled defaultChecked />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20,backgroundColor:"#fff" },
  row: { marginBottom: 16, flexDirection: "row", alignItems: "center" },
  hint: { marginLeft: 8, color: "#666" },
});