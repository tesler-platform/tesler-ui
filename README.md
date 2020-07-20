
# Tesler UI &middot; ![Build status](https://github.com/tesler-platform/tesler-ui/workflows/Build/badge.svg) ![Coverage](https://coveralls.io/repos/github/tesler-platform/tesler-ui/badge.svg?branch=develop)

Tesler UI is an open source library that supplies user interaction support for Tesler framework in form of React components, Redux reducers and redux-observable epics for handling asynchronous actions.
More specifically that includes:
- Major UI abstractions of Tesler framework such as Screen, View, Widget, Field
- Standard actions, reducers and epics for handling Tesler API, routing and build-in controls
- Custom <Provider> component and `connect` function to work with combined Redux store of Tesler UI library and your own application
- Reusable UI controls

# Main concepts

UI side of Tesler framework is based on a concept of configurable dashboards ("views") with widgets. Visually widgets could be  represented as a card with a table, graph, form or something more exotic inside.
Internally, every widget has a direct link to an entity that we call "business component" (BC). BC controls what data is displayed on widget and whhich interactions are available to the user. Interactions could be a simple filtration or some complex business process, initiated through Tesler API.
Information about loaded views and widgets grouped into "screens" and stored in application Redux store.
Client applications could reuse, extend and customize that functionality by providing its own reducers and epics, widgets and ui controls.

# Installation

Tesler UI distributed in form of ES5 compatible npm package:
```sh
yarn add @tesler-ui/core
```

Several libraries are specified as peer dependencies and should be installed for client application: react, react-dom, redux, react-redux, rxjs, redux-observable, antd, axios. 

# Usage

<Provider> component provides configurable Redux context and should be used on top level of your application:

```tsx
import {Provider} from '@tesler-ui/core'
import {reducers} from 'reducers'

const App = <Provider>
    <div>Client side application</div>
</Provider>

render(App, document.getElementById('root'))
```

After that, components of your own application could access combined Redux store and import library components:

```tsx
import React from 'react'
import {connect, View} from '@tesler-ui/core'

export const ClientComponent: FunctionComponent = (props: { screenName }) => {
    const Card = (props) => <div>
        <h1>Client side component</h1>
        {props.children}
    </div>
    return <View card={Card} />
}

function mapStateToProps(store) {
    return { screenName: store.router.screenName }
}

export default connect(mapStateToProps)(ClientComponent)
```

# Documentation

The documentation is divided into several sections:
* [Tutorial](http://idocs.tesler.io/ui/#/screen/tutorial)
* [Components Overview](http://idocs.tesler.io/ui/#/screen/components)
* [Features](http://idocs.tesler.io/ui/#/screen/features)
* [API Reference](http://idocs.tesler.io/ui/#/screen/api-reference)

You could also check our [changelog section](https://github.com/tesler-platform/tesler-ui/blob/master/CHANGELOG.md).

# Reporting an error

In case you've encountered a problem, please open an issue with reproducible example and detailed description.  
If you are also willing to provide a fix, please check our [contributing guide](https://github.com/tesler-platform/tesler-ui/blob/master/CONTRIBUTING.md)!

# Contributing

All contributions are welcomed, as even a minor pull request with grammar fixes or a single documentation update is of a significant help for us!  
We promise to handle all PR reviews in a friendly and respectful manner.
