import React from 'react'
import {Select as AntdSelect} from 'antd'
import {SelectProps as AntdSelectProps, SelectValue} from 'antd/lib/select'

type SelectProps = AntdSelectProps & {
    forwardedRef?: React.RefObject<AntdSelect<string>>
}

// Обертка для старой версии rc-select, т.к. в актуальной версии происходит обновление ширины выпадающего списка даже когда список закрыт
// https://github.com/react-component/select/issues/378
export class Select<T = SelectValue> extends React.PureComponent<SelectProps> {
    static Option = AntdSelect.Option

    render() {
        const extendedProps: any = {
            ...this.props,
            transitionName: ''
        }

        return <AntdSelect
            {...extendedProps}
            className={this.props.className}
            ref={this.props.forwardedRef}
        />
    }
}

export default Select
