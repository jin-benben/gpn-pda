import { enumStore, getEnumItem } from '@/store/enum';
import { useStore } from '@tanstack/react-store';
import React from 'react';
import { Text } from 'react-native';
interface EnumLabelProps {
  value: string;
  enumKey: string;
  className?:string;
}
const EnumLabel = ({value,enumKey,className}: EnumLabelProps) => {
  useStore(enumStore,state=>state[enumKey])
  return (
    <Text className={className}>{getEnumItem(enumKey,value)?.name}</Text>
  )
}

export default EnumLabel