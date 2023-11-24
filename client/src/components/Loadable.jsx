import loadable from "@loadable/component";
import {timeout} from "promise-timeout";
import {TopLoading} from "./Loading.jsx";


const LoadableComponent = (component) => loadable(() => timeout(import(`../${component}.jsx`), 15000), {
    fallback: <TopLoading/>
})

export default LoadableComponent