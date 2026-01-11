import { useField, useFormikContext } from "formik";
import { TextInput, TextInputProps } from "react-native";
import LocationModal, { LocationItem, LocationModalProps } from "./LocationModal";
import LocationPicker, { LocationPickerProps } from "./LocationPicker";
import Checkbox, { CheckboxProps } from "./ui/Checkbox";
import EnumSelect, { EnumSelectProps } from "./EnumSelect";
interface FormikTextInputProps extends TextInputProps {
  name: string;
  className?:string;
  [key: string]: any;
}
export function FormikTextInput({ name,...props }:FormikTextInputProps) {
  const [field, meta, helpers] = useField(name);
  return (
    <TextInput
      value={field.value?.toString()}
      selectTextOnFocus
      onChangeText={(text) => helpers.setValue(text)}
      onBlur={() => helpers.setTouched(true)}
      {...props}
    />
  );
}
interface FormikCheckboxProps extends CheckboxProps{
  name: string;
  className?:string;
  [key: string]: any;
}
export function FormikCheckbox({ name,...props }:FormikCheckboxProps) {
  const [field, meta, helpers] = useField(name);
  return (
    <Checkbox
      color="blue"
      size={20}
      value={field.value}
      onValueChange={helpers.setValue}
      {...props}
    />
  );
}
interface FormikLocationPickerProps extends LocationPickerProps{
  name: string;
  codeName:string;
  onSubmit?:(r:LocationItem)=>void
}
export function FormikLocationPicker({ name,onSubmit,...props }:FormikLocationPickerProps) {
  const [field, meta, helpers] = useField(name);
  const formik = useFormikContext();
  const onSelect = (row:LocationItem) => {
    helpers.setValue(row.name);
    formik.setFieldValue(props.codeName,row.code)
    onSubmit?.(row);
    
  };
  return (
    <LocationPicker
      value={field.value}
      onChange={helpers.setValue}
      onSelect={onSelect}
      {...props}
    />
  );
}
interface FormikLocationModalProps extends LocationModalProps{
  name: string;
  codeName:string
  onSubmit?:()=>void
}
export function FormikLocationModal({name,codeName,onSubmit,...props}:FormikLocationModalProps){
  const formik = useFormikContext();
  const onChange=(v:LocationItem)=>{
    formik.setFieldValue(name,v.name);
    formik.setFieldValue(codeName,v.code);
    onSubmit?.();
  }
  return (
    <LocationModal
      onChange={onChange}
      {...props}
    />
  );
}
interface FormikEnumSelectProps extends Omit<EnumSelectProps,"value" | "onChange">{
  name: string;
}
export function FormikEnumSelect({name,...props}:FormikEnumSelectProps){
  const [field, meta, helpers] = useField(name);
  const onChange=(v:any)=>{
    helpers.setValue(v);
  }
  return (
    <EnumSelect
      value={field.value}
      onChange={onChange}
      {...props}
    />
  );
}