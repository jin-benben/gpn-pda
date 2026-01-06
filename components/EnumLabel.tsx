import { getEnumItem } from '@/store/enum';
import React from 'react';
import { Text } from 'react-native';
interface EnumLabelProps {
  value: string;
  enumKey: string;
  className?:string;
}
const EnumLabel = ({value,enumKey,className}: EnumLabelProps) => {
  return (
    <Text className={className}>{getEnumItem(enumKey,value)?.name}</Text>
  )
}

export default EnumLabel