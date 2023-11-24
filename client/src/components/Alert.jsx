import classNames from "classnames";

const Alert = ({type = "info", enabled = true, extra, children, className}) => {

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
        enabled && children
            ? (
                <>
                    <div className={classNames([
                        'alert',
                        `alert-${style}`,
                        ...className
                    ])}><i className={classNames([
                        'fas',
                        `fa-${icon}`
                    ])}></i> {children}</div>

                    {
                        extra && (
                            <div id={"extraData"} style={{display: "none"}}>
                                {typeof extra === "object" ? JSON.stringify(extra, null, 2) : extra}
                            </div>
                        )
                    }
                </>
            )
            : <></>
    )
}

export default Alert