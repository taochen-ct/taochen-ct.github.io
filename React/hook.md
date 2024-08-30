# React Hook

React 是一个用于构建用户界面的 JavaScript 库。React 中的 Hook 是一组能够让你在函数组件中使用 state 及其他 React 特性的函数。以下是一些常用的 React Hook 及其详细说明：

### 1. useState
useState 是最常见的 Hook，用于在函数组件中添加状态。

```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

useState 接受一个初始状态，并返回一个状态变量和一个更新该状态的函数。
count 是当前的状态值，setCount 是用于更新 count 的函数。

### 2. useEffect
useEffect 是用于在函数组件中执行副作用的 Hook，比如数据获取、订阅、手动修改 DOM 等。

```jsx
import React, { useEffect, useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```
useEffect 接受一个函数，该函数在组件渲染后执行。
第二个参数是依赖数组，只有在数组中的值发生变化时，才会重新运行 effect。

### 3. useContext
useContext 用于在组件树中传递数据而不必通过每一级的 props。

```jsx
import React, { useContext } from 'react';

const ThemeContext = React.createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);

  return <button style={{ background: theme === 'light' ? '#fff' : '#333' }}>Themed Button</button>;
}
```
useContext 接受一个 context 对象（由 React.createContext 返回），并返回 context 的当前值。

### 4. useReducer
useReducer 是 useState 的替代方案，通常用于处理复杂状态逻辑。

```jsx
import React, { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  );
}
```
useReducer 接受一个 reducer 函数和一个初始状态，返回当前状态和 dispatch 函数。
dispatch 函数用于发送 action，触发状态更新。

### 5. useCallback
useCallback 返回一个记忆化的回调函数，在依赖项不变的情况下，返回的回调函数不会发生变化。

```jsx
import React, { useState, useCallback } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```
useCallback 接受一个内联回调函数和依赖项数组，返回记忆化的回调函数。

### 6. useMemo
useMemo 返回一个记忆化的值，仅在依赖项变化时重新计算该值。

```jsx
import React, { useMemo, useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  const expensiveComputation = useMemo(() => {
    return count * 2;
  }, [count]);

  return (
    <div>
      <p>{expensiveComputation}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```
useMemo 接受一个创建函数和依赖项数组，返回记忆化的值。

### 7. useRef
useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（初始值）。

```jsx
import React, { useRef } from 'react';

function TextInputWithFocusButton() {
  const inputEl = useRef(null);

  const onButtonClick = () => {
    inputEl.current.focus();
  };

  return (
    <div>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </div>
  );
}
```
useRef 返回一个 ref 对象，可以持久化一个 DOM 元素或一个值。
inputEl.current 持有对 DOM 元素的引用，可以用于访问或操作该元素。

---
React 还提供了其他一些高级 Hook，如 useLayoutEffect、useImperativeHandle 等，用于处理特定场景下的需求。通过合理使用这些 Hook，可以使你的函数组件更加简洁、可读且功能强大。