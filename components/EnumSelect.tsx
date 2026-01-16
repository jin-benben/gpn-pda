import { EnumItem, enumStore, getEnumItem } from '@/store/enum';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useStore } from '@tanstack/react-store';
import React, { useState } from 'react';
import { View,Text,TouchableOpacity, ScrollView, StyleSheet, Pressable, TouchableWithoutFeedback } from 'react-native';
import Popup from './ui/Popup';
import theme from '@/const/theme';
export interface EnumSelectProps {
  value?: string;
  enumKey: string;
  onChange?: (value: string,r:EnumItem) => void;
  label?:string;
}
const EnumSelect = ({enumKey,value,onChange,label}:EnumSelectProps) => {
  const [visible,setVisible]=useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value);
  const enumValueList = useStore(enumStore, (state) => state[enumKey]);
  
  const onValueChange=(itemVlaue:string,itemIndex:number)=>{
    console.log(itemVlaue,itemIndex)
    setSelectedValue(selectedValue)
    onChange?.(itemVlaue,enumValueList![itemIndex])
    setVisible(false)
  }
  return (
    <>
      <TouchableWithoutFeedback onPress={()=>setVisible(true)}>
        <View style={styles.container}>
          <Text className='flex-1'>
            {label ? label : ""}
            {(value && getEnumItem(enumKey,value)?.name) || "请选择"}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="black" />
        </View>
      </TouchableWithoutFeedback>
      <Popup title='选择' visible={visible} onClose={()=>setVisible(false)} modalStyle={{height:'50%'}}> 
        <ScrollView contentContainerStyle={{justifyContent:'center'}}>
          {enumValueList?.map((item,index)=>(
            <TouchableOpacity key={item.value} onPress={()=>onValueChange(item.value,index)} style={styles.enumItem}>
              <Text className=' text-center' style={{color:value==item.value ? theme.blue600 :""}}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Popup>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:'row',
    height:40,
  },
  enumItem:{
    height:36,
    justifyContent:'center',
  }
});


export default EnumSelect