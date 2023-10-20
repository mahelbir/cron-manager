import classNames from "classnames";

const Alert = ({type, children, className}) => {

    let style, icon;

    switch (type) {
        case 'success':
            style = 'success'
            icon = 'check-circle'
            break
        case 'error':
            style = 'danger'
            icon = 'warning'
            break
        default:
            style = 'primary'
            icon = 'info-circle'
    }

    if (!Array.isArray(className)) className = [className]

    return (
        <div className={classNames([
            'alert',
            `alert-${style}`,
            ...className
        ])}><i className={classNames([
            'fas',
            `fa-${icon}`
        ])}></i> {children}</div>
    )
}

Alert.defaultProps = {
    type: 'info'
}

export const alertCall = (message, func, inputs = null) => {
    func(message)
    setTimeout(() => {
        func(null)
    }, 3000)
    if (inputs) {
        if (!inputs.forEach) inputs = [inputs]
        inputs.forEach(input => input.current.value = '')
    }
}

export default Alert