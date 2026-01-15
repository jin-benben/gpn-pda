import { commonRequestFetch } from '@/lib/commonServices'
import { EnumItem, setEnumStore } from '@/store/enum'
import { useEffect } from 'react'
import useCustomMutation from './useMutation'
interface ParamsValueObj { 
  code:string,filter?:Record<string,any[]>
}
type ParamsValue = string | ParamsValueObj
interface Params {
  params:ParamsValue[]
}
const useEnum = ({params}:Params) => {
  const {data,mutate,isPending} = useCustomMutation({
    mutationFn:()=>{
      const lastParams:Record<string,ParamsValueObj> = {}
      params.forEach(item=>{
        if(typeof item === "string"){
          lastParams[item]={
            code:item
          }
        }else{
          lastParams[item.code]=item
        }
      })
      return commonRequestFetch<any,Record<string,EnumItem[]>>({
        functionCode:"smp0006",
        data:lastParams,
        prefix:"cts",
        url:'/get',
      })
    },
    onSuccess(data) { 
      Object.keys(data).forEach(item=>{
        setEnumStore(item,data[item])
      })
    },
  })
  useEffect(()=>{ 
    mutate()
  },[]) 
  return {data}
}

export default useEnum