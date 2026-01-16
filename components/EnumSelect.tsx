import { EnumItem, enumStore, getEnumItem } from '@/store/enum';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { useStore } from '@tanstack/react-store';
import React, { useState } from 'react';
import { View,Text,TouchableOpacity, ScrollView } from 'react-native';
import Popup from './ui/Popup';
import theme from '@/const/theme';
export interface EnumSelectProps {
  value?: string;
  enumKey: string;
  onChange?: (value: string,r:EnumItem) => void;
  className?:string;
  style?:any;
  
}
const EnumSelect = ({enumKey,value,onChange,className,style}:EnumSelectProps) => {
  const [visible,setVisible]=useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value);
  const enumValueList = useStore(enumStore, (state) => state[enumKey]);
  
  const onValueChange=(itemVlaue:string,itemIndex:number)=>{
    setSelectedValue(selectedValue)
    onChange?.(itemVlaue,enumValueList![itemIndex])
    setVisible(false)
  }
  return (
    <>
      <TouchableOpacity onPress={()=>setVisible(true)} style={style} className={className}>
        <View className='flex-row items-center py-2'>
          <Text className='flex-1'>{value && getEnumItem(enumKey,value)?.name || "请选择"}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="black" />
        </View>
      </TouchableOpacity>
      <Popup title='选择' visible={visible} onClose={()=>setVisible(false)} modalStyle={{height:'50%'}}> 
        <ScrollView contentContainerStyle={{justifyContent:'center'}}>
          {enumValueList?.map((item,index)=>(
            <TouchableOpacity key={item.value} onPress={()=>onValueChange(item.value,index)} className='h-10 px-2'>
              <Text className=' text-center' style={{color:value==item.value ? theme.blue600 :""}}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Popup>
    </>
  )
}

export default EnumSelect