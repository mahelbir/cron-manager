import classNames from "classnames";
import TopBarProgress from "react-topbar-progress-indicator";

TopBarProgress.config({
    barColors: {
        "0": "#2ba3dc",
        "0.5": "#2487b6",
        "1.0": "#217da9"
    },
    shadowColor: "#ddd",
    shadowBlur: 3
});
export const TopLoading = ({enabled}) => enabled && <TopBarProgress/>

const Loading = ({enabled = false, size = 4}) => {
    return (
        enabled && (
            <div className="text-center my-5">
                <i className={classNames(["fas", "fa-spinner", "fa-spin", `fa-${size}x`])}></i>
            </div>
        )
    )
}

export default Loading