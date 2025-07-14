import { View, Animated, Easing } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Colors } from '../lib/constants'

interface LoaderProps {
  size?: number
  color?: string
  strokeWidth?: number
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 16, 
  color = Colors.primary + '80', 
  strokeWidth = 2 
}) => {
  const spinValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0)
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => spin())
    }
    spin()
  }, [spinValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View style={{ 
      width: size, 
      height: size, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          transform: [{ rotate: spin }],
        }}
      />
    </View>
  )
}

export default Loader