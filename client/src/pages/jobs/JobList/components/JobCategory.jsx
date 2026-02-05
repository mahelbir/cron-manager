import classNames from "classnames";
import JobItem from "./JobItem.jsx";
import {JobItemContext} from "../../../../stores/AppContexts.js";

const JobCategory = ({categories, category, categoryStates, toggleCategoryState, setError, times, jobs}) => {

    const categoryJobs = categories[category].map(jobIndex => jobs[jobIndex])

    return (
        <>
            <tr onClick={() => toggleCategoryState(category)} role="button">
                <td align="center" colSpan="4" className="bg-secondary">
                    <i className={classNames("fas", {
                        "fa-caret-down": !categoryStates[category],
                        "fa-caret-up": !!categoryStates[category],
                    })}></i> {category}
                </td>
            </tr>
            {categoryJobs.map(job => (
                categoryStates[category] && job && (
                    <JobItemContext.Provider
                        value={{
                            job,
                            setError,
                            jobActivity: times[job.id]
                        }}
                        key={job.id}
                    >
                        <JobItem/>
                    </JobItemContext.Provider>
                )
            ))}
        </>
    )
}

export default JobCategory