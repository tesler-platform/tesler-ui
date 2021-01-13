import React from 'react'
// tslint:disable:jsdoc-require
interface ErrorBoundaryProps {
    msg?: React.ReactNode
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
    static getDerivedStateFromError(error: any) {
        return { hasError: true }
    }

    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error(error)
    }

    render() {
        if (this.state.hasError) {
            return this.props.msg || 'Render error occured'
        }
        return this.props.children
    }
}
