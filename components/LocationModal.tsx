import { queryListFetch } from '@/lib/commonServices'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import InputSearch from './ui/InputSearch'
import Popup from './ui/Popup'

export interface LocationItem {
  code: string;
  name: string;
  areaType: string;
}
export interface LocationModalProps {
  whsCode: string;
  areaType:number[],
  onChange?:(v:LocationItem)=>void,
  value?:string,
  visible:boolean;
  onClose:()=>void;
}
const LocationModal = ({whsCode,areaType,visible,onClose,onChange}:LocationModalProps) => {
  const [searchText, setSearchText] = React.useState('');
  const {data,refetch} = useQuery({
    queryKey:["Mdm0096",searchText],
    enabled:!!visible,
    queryFn:()=>{
      return queryListFetch<any,LocationItem>({
        functionCode:"mdm0096",
        prefix:"mdm2",
        data:{
          whsCode,
          areaType,
          size:20,
          page:1,
          searchText,
          orderBy:[
            {
              field:"orderId",
              type:"asc"
            }
          ]
        }
      })
    }
  })
  const onSelect=(v:LocationItem)=>{
    onChange?.(v)
    onClose()
  }
  return (
    <Popup title='库位选择' visible={visible} onClose={onClose} modalStyle={{height:"80%"}}>
      <View className='px-2 flex-1 '>
        <InputSearch placeholder='请输入或扫 描库位' onSearch={setSearchText}/>
        <FlatList
          data={data?.rows}
          style={{height:100}}
          keyExtractor={(item)=>item.code}
          ListEmptyComponent={
            <View className='justify-center items-center p-4'>
              <Text>暂无数据</Text>
            </View>
          }
          renderItem={({item})=>(
            <TouchableOpacity className='p-4' onPress={()=>onSelect(item)}>
              <Text style={{fontSize:12}}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Popup>
  )
}

export default LocationModal