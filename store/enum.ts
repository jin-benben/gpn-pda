import { Store } from "@tanstack/react-store";

export interface EnumItem {
  name: string;
  value: string;
  description?: string,
  extend?: Record<string, any>
  labelStyle?:any
}

export const enumStore = new Store<Record<string, EnumItem[] | undefined>>({});

export function setEnumStore(key:string, value:EnumItem[]){
  if(!enumStore.state.hasOwnProperty(key)){
    enumStore.setState(state=>{
      return {
        ...state,
        [key]:value
      }
    })
  }
}

export function getEnumStore(key:string){
  return enumStore.state[key]
}

export function getEnumItem(key:string, value:string){
  return enumStore.state[key]?.find(item=>item.value==value)
}