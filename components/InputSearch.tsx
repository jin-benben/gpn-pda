// components/InputSearch.tsx
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface InputSearchProps extends TextInputProps {
  onSearch?: (text: string) => void;
}

const InputSearch: React.FC<InputSearchProps> = ({ 
  onSearch, 
  onSubmitEditing,
  ...props 
}) => {
  const inputRef = useRef<TextInput>(null);
  const [value, onChangeText] = useState('');
  const handleSearch = () => {
    onSearch?.(value);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: any) => {
    onSubmitEditing?.(e);
    onSearch?.(e.nativeEvent.text);
    inputRef.current?.blur();
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons style={styles.searchButton}  name="line-scan" size={16} color="#e40614" />
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="搜索..."
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        onChangeText={onChangeText}
        selectTextOnFocus
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: "100%",
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: 36,
  },
  searchButton: {
    padding: 5,
  },
});

export default InputSearch;