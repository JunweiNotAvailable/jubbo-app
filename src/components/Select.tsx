import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '../lib/constants';

interface SelectOption {
  id: string;
  name: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  containerStyle?: any;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onSelect,
  containerStyle,
  disabled = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedOption = options.find(option => option.id === value);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.selectorDisabled
        ]}
        activeOpacity={0.7}
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.selectorContent}>
          <View style={styles.selectorLeft}>
            <Text style={[
              styles.selectorTitle,
              !selectedOption && styles.selectorPlaceholder
            ]}>
              {selectedOption?.name || placeholder}
            </Text>
          </View>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={disabled ? "#ccc" : "#666"} 
          />
        </View>
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <BlurView intensity={20} style={styles.modalBlurView}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsModalVisible(false)}
          >
            <BlurView intensity={20} style={styles.modalContent}>
              <ScrollView style={{ maxHeight: 300 }}>
                {options.map((option, index) => (
                  <React.Fragment key={option.id}>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        onSelect(option.id);
                        setIsModalVisible(false);
                      }}
                    >
                      <View style={styles.optionContent}>
                        <Text style={[
                          styles.optionTitle,
                          value === option.id && styles.optionTitleSelected
                        ]}>
                          {option.name}
                        </Text>
                      </View>
                      {value === option.id && (
                        <Ionicons name="checkmark" size={20} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                    {index !== options.length - 1 && (
                      <View style={styles.optionSeparator} />
                    )}
                  </React.Fragment>
                ))}
              </ScrollView>
            </BlurView>
          </TouchableOpacity>
        </BlurView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  selector: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#eee',
  },
  selectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  selectorLeft: {
    flex: 1,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 2,
  },
  selectorPlaceholder: {
    color: '#999',
    fontWeight: '400',
  },
  selectorDescription: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalBlurView: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fffc',
    borderRadius: 20,
    width: '85%',
    maxHeight: '70%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  optionSeparator: {
    height: 1,
    backgroundColor: '#ddd',
  },
});

export default Select; 