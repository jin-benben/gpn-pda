import { queryOneFetch } from '@/lib/commonServices';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useRef } from 'react';
import { TextInput, TextInputSubmitEditingEvent, ToastAndroid, TouchableOpacity, View } from 'react-native';

interface LocationItem {
  code: string;
  name: string;
  areaType: string;
}

export interface LocationPickerProps {
  whsCode:string
  onChange?:(v:string)=>void,
  onSelect?:(row:LocationItem)=>void,
  value?:string,
  onOpenModal?:()=>void,
  focus?:boolean
}

const LocationPicker = ({value,onChange,onOpenModal,whsCode,onSelect,focus}:LocationPickerProps) => {
  const inputRef = useRef<TextInput>(null);
  const onSubmitEditing = (e:TextInputSubmitEditingEvent)=>{
    const name = e.nativeEvent.text;
    if(!name || !whsCode){
      return
    }
    queryOneFetch<any,LocationItem>({
      functionCode:'mdm0096',
      prefix:'mdm2',
      data:{
        name,
        whsCode
      }
    }).then((res:any)=>{
      if(!res.code){
        ToastAndroid.show("未找到库位",3000)
      }else{
        onSelect?.(res)
      }
    })
  }
  useEffect(()=>{
    if(focus!==undefined && inputRef.current){
      if(focus){
        inputRef.current?.focus()
      }else{
        inputRef.current?.blur()
      }
    }
  },[focus,inputRef.current])
  return (
    <>
      <View className='flex-row border border-gray-300 rounded-md flex-1 items-center'>
        <TextInput ref={inputRef} value={value} onChangeText={onChange} onSubmitEditing={onSubmitEditing} className='flex-1 p-2' selectTextOnFocus placeholder='请选择库位'/>
        <TouchableOpacity className='px-3' onPress={() => onOpenModal?.()}>
          <MaterialIcons name="search" size={20} color="gray" />
        </TouchableOpacity>
      </View>
      
    </>
  )
}

export default LocationPicker