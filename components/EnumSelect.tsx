import { EnumItem, enumStore } from '@/store/enum';
import { Picker } from '@react-native-picker/picker';
import { useStore } from '@tanstack/react-store';
import React from 'react';
export interface EnumSelectProps {
  value?: string;
  enumKey: string;
  onChange?: (value: string,r:EnumItem) => void;
  className?:string;
  style?:any;
}
const EnumSelect = ({enumKey,value,onChange,className,style}:EnumSelectProps) => {
  const [selectedValue, setSelectedValue] = React.useState(value);
  const enumValueList = useStore(enumStore, (state) => state[enumKey]);
  const onValueChange=(itemVlaue:string,itemIndex:number)=>{
    setSelectedValue(selectedValue)
    onChange?.(itemVlaue,enumValueList![itemIndex])
  }
  return (
    <Picker
      selectedValue={selectedValue}
      style={style}
      onValueChange={onValueChange}>
        {
          enumValueList?.map((item:EnumItem,index:number)=>(
            <Picker.Item key={index} label={item.name} value={item.value} />
          ))
        }
    </Picker>
  )
}

export default EnumSelect