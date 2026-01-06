import { commonRequestFetch } from '@/lib/commonServices'
import { EnumItem, setEnumStore } from '@/store/enum'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
interface ParamsValueObj { 
  code:string,filter?:Record<string,any[]>
}
type ParamsValue = string | ParamsValueObj
interface Params {
  params:ParamsValue[]
}
const useEnum = ({params}:Params) => {
  const {data,status,isFetching} = useQuery({
    queryKey:['enum',params],
    queryFn:()=>{
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
    }
  })
  useEffect(()=>{ 
    if(data){
      Object.keys(data).forEach(item=>{
        setEnumStore(item,data[item])
      })
    }
  },[data]) 
  return {status,data,isFetching}
}

export default useEnum