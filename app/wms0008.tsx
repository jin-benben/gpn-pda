import Tabs, { TabItem } from "@/components/Tabs";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  const tabs: TabItem[] = [
    {
      key: "home",
      title: "Home",
      content: (
        <View style={styles.page}>
          <Text style={styles.title}>Home</Text>
          <Text>这是主页内容。</Text>
        </View>
      ),
    },
    {
      key: "search",
      title: "Search",
      badge: 3,
      content: (
        <View style={styles.page}>
          <Text style={styles.title}>Search</Text>
          <Text>搜索页，延迟渲染示例。</Text>
        </View>
      ),
    },
   
  ];

  return (
    <Tabs tabs={tabs} initialIndex={0} lazy />
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 20,
    backgroundColor: "red",
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
});