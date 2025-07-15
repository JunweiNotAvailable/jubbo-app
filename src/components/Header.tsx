import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StyleProp, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/constants';

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  showBackButton?: boolean;
  titleStyle?: StyleProp<TextStyle>;
}

export default function Header({ 
  title, 
  onBackPress, 
  rightComponent, 
  showBackButton = true,
  titleStyle
}: HeaderProps) {
  return (
    <View style={styles.header}>
      {/* Left side - Back button or spacer */}
      <View style={styles.headerLeft}>
        {showBackButton && onBackPress ? (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="chevron-back-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>

      {/* Center - Title */}
      <Text style={[styles.title, titleStyle]}>{title}</Text>

      {/* Right side - Custom component or spacer */}
      <View style={styles.headerRight}>
        {rightComponent || <View style={styles.spacer} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  spacer: {
    width: 20,
  },
  backButton: {
    width: 20,
    justifyContent: 'center',
  },
  title: {
    flex: 2,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 