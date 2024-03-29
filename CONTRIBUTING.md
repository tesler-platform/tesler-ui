# Versioning

Tesler UI follows [semver](https://semver.org/), e.g. MAJOR.MINOR.PATCH.  
All significant changes are documented in our [changelog file](./CHANGELOG.md).  
Backwards incompatible changes are denoted with `[BREAKING CHANGE]` mark.

# Branch organization 

Realeses are build from master branch, marked with a corresponding tag.  
Minor versions and patches are merged into "develop" branch first.  
Features and bugfixes should be named in `feat/issue-number` and `fix/issue-number` format.  

# Development

All changes by internal team or external contributors should be performed via public pull request.  
All commits should be reasonably squashed before pull request will be merged (multiple commits for a single feature are not
encouraged but acceptable when they are helpful)  
All commits should contain a commit message with a gist of reasoning behind the change. Full description should be provided via pull
request description.  
All changes should correlate with our style guide, pass lint and test checks:
```sh
yarn check
```
When submitting a bugfix, unit test should be provided.

# Proposing a change

If you come up with a feature that looks more attractive as a library component rather than customization layer of your application, please open an issue with your proposal.  

# Style guide

Before commit launch prettier and eslint checks:

```sh
yarn lint --fix
```

## Naming, documentation and folder structure

* Test files should be named as <testedModule>.tests.ts or <TestedComponent>.tests.ts
* Multiple files component should store corresponding tests inside __tests__ folder. Single file component could store their test near them.
* Reusable UI components without dependencies on Tesler UI functionality (not connected) should be placed inside `components/ui` folder
* Widgets should be placed inside `components/widgets` folder
* All exportable components should be specified inside `components/index.ts` file
* Use JSDoc comments to describe interfaces and functions when possible

## React

* Use React hooks to manage component state
* Always use functional form for components. Following templates are recommended:

```tsx
// Connected component template
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cn from 'classnames'
import { $do } from '../../actions/actions'
import { Store } from '../../interfaces/store'
import styles from './Component.less'

export interface ComponentProps {
    className?: string
    bcName: string
}

export const Component = ({
    className,
    bcName
}: ComponentProps) => {

    const cursor = useSelector((store: Store) => store.screen.bo.bc[bcName].cursor)
    const dispatch = useDispatch()

    const handleEmptyAction = useCallback(() => {
        dispatch($do.emptyAction(null)
    }, [dispatch])
    
    const handleAction = React.useCallback(() => {
        dispatch($do.someAction({ test: 'Test' }))
    }, [dispatch])

    return <div className={cn(styles.container, className)}>
        <h2>Cursor - {cursor}</h2>
        <button onClick={handleEmptyAction}>
            Empty action
        </button>
        <button onClick={handleAction}>
            Action with args
        </button>
    </div>
}
```

```tsx
// Non-connected component template
import React from 'react'
import cn from 'classnames'

export interface ComponentProps {
    className?: string
}

export const Component: FunctionComponent<ComponentProps> = ({ className }: ComponentProps) => {
    return <div className={cn(styles.container, props.className)}>
        Test
    </div>
}

export default React.memo(Component)
```

* Always use relative paths for import statements
* Use cn helper for complex or conditional classnames
* Visual components should accept className as a property and apply it to the root element
* Always specify `key` property when you render an array of components
* Helper functions for component should be located below render function
* Avoid renderComponentPart functions, prefer render on site or extraction into different component

## CSS/LESS

* Avoid nested selectors when possible
* Avoid `!important` statement
* Avoid id selectors, tag selectors or universal * selectors - prefer class selectors
* Put more specific selector on the right side for complex selectors as CSS selectors checked from right to left
