import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { PinchView, PinchViewProvider } from 'react-native-pinch-view';

export default function App() {
  return (
    <PinchViewProvider>
      <View style={styles.container}>
        <PinchView minScale={0.5} maxScale={2}>
          <Image style={styles.image} source={require('./cat.jpeg')} resizeMode="contain" />
        </PinchView>

        <PinchView>
          <Image style={styles.image} source={require('./cat.jpeg')} resizeMode="contain" />
        </PinchView>
      </View>
    </PinchViewProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'purple',
  },
  image: {
    width: 200,
    height: 200,
    backgroundColor: '#000',
    marginBottom: 50,
  },
});
