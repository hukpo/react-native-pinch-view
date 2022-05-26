import { Portal } from '@gorhom/portal';
import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  LayoutChangeEvent,
  StyleSheet,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureTouchEvent,
  GestureUpdateEvent,
  GestureStateChangeEvent,
  PinchGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

const INITIAL_VALUES = {
  scale: 1,
  originX: 0,
  originY: 0,
  translateX: 0,
  translateY: 0,
  diffFocalX: 0,
  diffFocalY: 0,
  twoPointersLastFocalX: 0,
  twoPointersLastFocalY: 0,
};

export type PinchViewProps = {
  minScale?: number;
  maxScale?: number;
};

export const PinchView: FC<PinchViewProps> = ({
  children,
  minScale = 1,
  maxScale = Infinity,
}) => {
  /**
   * When the user releases second pointer, the focal changes
   * and we need to have the difference to prevent the child jumping
   */
  const diffFocalX = useSharedValue(INITIAL_VALUES.diffFocalX);
  const diffFocalY = useSharedValue(INITIAL_VALUES.diffFocalY);
  const twoPointersLastFocalX = useSharedValue(
    INITIAL_VALUES.twoPointersLastFocalX
  );
  const twoPointersLastFocalY = useSharedValue(
    INITIAL_VALUES.twoPointersLastFocalY
  );

  const scale = useSharedValue(INITIAL_VALUES.scale);
  const originX = useSharedValue(INITIAL_VALUES.originX);
  const originY = useSharedValue(INITIAL_VALUES.originY);
  const translateX = useSharedValue(INITIAL_VALUES.translateX);
  const translateY = useSharedValue(INITIAL_VALUES.translateY);
  const isActive = useDerivedValue(
    () =>
      scale.value !== INITIAL_VALUES.scale ||
      originX.value !== INITIAL_VALUES.originX ||
      originY.value !== INITIAL_VALUES.originY ||
      translateX.value !== INITIAL_VALUES.translateX ||
      translateY.value !== INITIAL_VALUES.translateY,
    []
  );

  const [childLayout, setChildLayout] = useState({ width: 0, height: 0 });
  const [pinchablePosition, setPinchablePosition] = useState({
    top: 0,
    left: 0,
  });

  const onChildLayout = ({
    nativeEvent: { layout },
  }: LayoutChangeEvent): void => {
    setChildLayout({ width: layout.width, height: layout.height });
  };

  const onTouchesDown = ({
    allTouches: [touch],
    numberOfTouches,
  }: GestureTouchEvent): void => {
    if (numberOfTouches === 2) {
      runOnJS(setPinchablePosition)({
        top: touch.absoluteY - touch.y,
        left: touch.absoluteX - touch.x,
      });
    }
  };

  const onPinchStart = (
    event: GestureStateChangeEvent<PinchGestureHandlerEventPayload>
  ): void => {
    originX.value = event.focalX - childLayout.width / 2;
    originY.value = event.focalY - childLayout.height / 2;
  };
  const onPinchUpdate = (
    event: GestureUpdateEvent<PinchGestureHandlerEventPayload>
  ): void => {
    let diffX = diffFocalX.value;
    let diffY = diffFocalY.value;

    if (event.numberOfPointers === 2) {
      twoPointersLastFocalX.value = event.focalX;
      twoPointersLastFocalY.value = event.focalY;
    } else if (!diffFocalX.value && !diffFocalY.value) {
      diffFocalX.value = diffX = twoPointersLastFocalX.value - event.focalX;
      diffFocalY.value = diffY = twoPointersLastFocalY.value - event.focalY;
    }

    scale.value =
      event.scale > minScale && event.scale < maxScale
        ? event.scale
        : event.scale < minScale
        ? minScale
        : maxScale;
    translateX.value =
      diffX + event.focalX - childLayout.width / 2 - originX.value;
    translateY.value =
      diffY + event.focalY - childLayout.height / 2 - originY.value;
  };
  const onPinchEnd = useCallback(() => {
    scale.value = withTiming(INITIAL_VALUES.scale);
    originX.value = withTiming(INITIAL_VALUES.originX);
    originY.value = withTiming(INITIAL_VALUES.originY);
    translateX.value = withTiming(INITIAL_VALUES.translateX);
    translateY.value = withTiming(INITIAL_VALUES.translateY);

    diffFocalX.value = INITIAL_VALUES.diffFocalX;
    diffFocalY.value = INITIAL_VALUES.diffFocalY;
    twoPointersLastFocalX.value = INITIAL_VALUES.twoPointersLastFocalX;
    twoPointersLastFocalY.value = INITIAL_VALUES.twoPointersLastFocalY;
  }, [
    scale,
    originX,
    originY,
    diffFocalX,
    diffFocalY,
    translateX,
    translateY,
    twoPointersLastFocalX,
    twoPointersLastFocalY,
  ]);

  const animatedChildStyle = useAnimatedStyle(() => ({
    opacity: isActive.value ? 0 : 1,
  }));

  const animatedPinchableStyle = useAnimatedStyle(() => ({
    opacity: isActive.value ? 1 : 0,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { translateX: originX.value },
      { translateY: originY.value },
      { scale: scale.value },
      { translateX: -originX.value },
      { translateY: -originY.value },
    ],
  }));

  useEffect(() => {
    const listener = (state: AppStateStatus) => {
      if (state === 'active') {
        onPinchEnd();
      }
    };

    AppState.addEventListener('change', listener);

    return () => AppState.removeEventListener('change', listener);
  }, [onPinchEnd]);

  return (
    <>
      <GestureDetector
        gesture={Gesture.Pinch()
          .onTouchesDown(onTouchesDown)
          .onStart(onPinchStart)
          .onUpdate(onPinchUpdate)
          .onEnd(onPinchEnd)}
      >
        <Animated.View onLayout={onChildLayout} style={animatedChildStyle}>
          {children}
        </Animated.View>
      </GestureDetector>

      <Portal>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pinchableContainer,
            pinchablePosition,
            childLayout,
            animatedPinchableStyle,
          ]}
        >
          {children}
        </Animated.View>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  pinchableContainer: {
    position: 'absolute',
  },
});
