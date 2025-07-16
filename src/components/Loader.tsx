import { View, Animated, Easing } from 'react-native'
import React, { useEffect, useRef } from 'react'
import Svg, { Circle } from 'react-native-svg'
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

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference * 0.25 // Shows 75% of the circle

  return (
    <View style={{ 
      width: size, 
      height: size, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <Animated.View
        style={{
          transform: [{ rotate: spin }],
        }}
      >
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  )
}

export default Loader