import { ErrorMessage } from "formik";
import { Text } from "react-native";
export default function FieldInfo({ name }: { name: string }) {
  return <ErrorMessage name={name}>{msg => <Text className="text-red-500">{msg}</Text>}</ErrorMessage>
}