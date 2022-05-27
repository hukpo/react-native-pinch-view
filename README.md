<p align="center">
  <h1 align="center">React Native Pinch View</h1>
  <h3 align="center">Instagram like pinch to zoom for React Native.</h3>
</p>

## Demo

![screencast](https://user-images.githubusercontent.com/40897161/170602850-b001f810-eef1-4388-a396-b4f1d011f848.gif)

See [`Example`](https://github.com/hukpo/react-native-pinch-view/tree/master/example) folder.

## Installation

```bash
# yarn
yarn add react-native-pinch-view
# npm
npm i react-native-pinch-view
```

## Usage

First, you will need to add `PinchViewProvider` to your root component.

```tsx
import { PinchViewProvider } from 'react-native-pinch-view';

export const App = () => (
  <PinchViewProvider>
  {... your app goes here}
  </PinchViewProvider>
);
```

Last, you wrap the content that you want to pinch with `PinchView`.

```js
import { PinchView } from 'react-native-pinch-view';

<PinchView>
  <Image source={...}>
</PinchView>
```

### Properties

| Prop                   | Description                     | Default |
| ---------------------- | ------------------------------- | ------- |
| **`minScale`**         | The minimum allowed scale. | `1`          |
| **`maxScale`**         | The maximum allowed scale. | `Infinity`   |

## License

[MIT License](http://opensource.org/licenses/mit-license.html). © Pavlo Huk 2022 - present
