# React Mode

### 1. `<React.StrictMode>`
- 识别不安全的生命周期方法：比如 `componentWillMount`、`componentWillReceiveProps` 和 `componentWillUpdate`。这些方法在未来的 React 版本中将会被弃用。
- 关于使用遗留字符串 ref API 的警告：建议使用 `React.createRef()` 或回调 ref。
- 关于使用废弃的 `findDOMNode` 方法的警告：建议使用 ref 直接引用 DOM 元素。
- 检测意外的副作用：检查不安全的副作用检测，通过双调用某些生命周期方法（如 `componentDidMount` 和 `componentDidUpdate`），确保他们是幂等的（即多次调用不会产生副作用）。
- 检测过时的 context API：旧的 context API 已经被新 API 取代，`<React.StrictMode>` 可以帮助你发现旧的 context API。

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

```

### 2. `<Fragment>`
- 用于返回多个元素而不额外创建 DOM 元素。
- 也可以使用简写形式 <> 和 </>。

```jsx
import React from 'react';

function List() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </>
  );
}
```

### 3. `<Suspense>`
- 用于在异步加载组件时显示后备内容（通常是一个加载指示器）。
- 通常与 React.lazy 一起使用来实现代码分割。

```jsx
import React, { Suspense } from 'react';

const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}

```

### 4. `<Profiler>`
- 用于测量应用程序中渲染性能的组件。
- 可以帮助你识别渲染瓶颈。

```jsx
import React, { Profiler } from 'react';

function onRenderCallback(
  id, // 发生提交的 Profiler 树的 "id"
  phase, // "mount" 或 "update"
  actualDuration, // 本次更新 committed 花费的渲染时间
  baseDuration, // 估计的渲染时间
  startTime, // 本次更新中 React 开始渲染的时间
  commitTime, // 本次更新中 React committed 的时间
  interactions // 属于本次更新的 interactions 的集合
) {
  // 处理或记录渲染时间
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourComponent />
    </Profiler>
  );
}
```

### 5. `<ErrorBoundary>`
- 并非内置组件，但常见于 React 应用中。
- 用于捕获其子组件树中的 JavaScript 错误，记录错误信息，并展示降级 UI。

```jsx
import React, { Profiler } from 'react';

function onRenderCallback(
  id, // 发生提交的 Profiler 树的 "id"
  phase, // "mount" 或 "update"
  actualDuration, // 本次更新 committed 花费的渲染时间
  baseDuration, // 估计的渲染时间
  startTime, // 本次更新中 React 开始渲染的时间
  commitTime, // 本次更新中 React committed 的时间
  interactions // 属于本次更新的 interactions 的集合
) {
  // 处理或记录渲染时间
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourComponent />
    </Profiler>
  );
}
```