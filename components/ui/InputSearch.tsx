// components/InputSearch.tsx
import theme from '@/const/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { RefObject } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface InputSearchProps extends TextInputProps {
  onSearch?: (text: string) => void;
  ref?:RefObject<TextInput | null>;
}

const InputSearch: React.FC<InputSearchProps> = ({ 
  onSearch, 
  onSubmitEditing,
  ...props 
}) => {
  
  const handleSubmit = (e: any) => {
    onSubmitEditing?.(e);
    onSearch?.(e.nativeEvent.text);
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons style={styles.searchButton} name="line-scan" size={16} color={theme.main} />
      <TextInput
        style={styles.input}
        placeholder="搜索..."
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
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