import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
interface TabItem {
  key:string;
  title:string; 
}
interface TabsProps {
  items:TabItem[],
  activeKey:string;
  onChange:(key:string)=>void
}
const Tabs = ({items,activeKey,onChange}:TabsProps) => {
  return (
    <View style={styles.tabItemWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} > 
        {
          items.map(item=>(
            <TouchableOpacity key={item.key} style={[styles.tabItem]} onPress={()=>onChange(item.key)}>
              <Text style={{color:activeKey===item.key?"#3b82f6":"#333"}}>{item.title}</Text>
              {
                activeKey===item.key && <View style={styles.line}></View>
              }
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  tabItemWrapper:{
    backgroundColor:"#fff",
  },
  tabItem:{
    paddingVertical:10,
    paddingHorizontal:20,
  },
  line:{
    height:2,
    backgroundColor:"#60a5fa",
    marginHorizontal:10,
    marginTop:4
  }
});

export default Tabs