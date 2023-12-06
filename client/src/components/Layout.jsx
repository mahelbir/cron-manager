import useAuthStore from "../stores/authStore.js";
import LoadableComponent from "./Loadable.jsx";


const UserNav = LoadableComponent("components/UserNav")
const Login = LoadableComponent("components/Login")

const Layout = () => {

    const loggedIn = useAuthStore(state => state.authToken)

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="container my-5">
                <h1 className="d-flex justify-content-center mb-5">Cron Job Manager</h1>
                <div className="card">
                    {loggedIn
                        ? <UserNav/>
                        : <Login/>
                    }
                </div>
            </div>

            <footer className="bg-light text-lg-start mt-auto">
                <div className="container p-2 text-center">
                    <span>
                        Copyright &copy;&nbsp;
                        <a href="https://mahmuthanelbir.com.tr" className="text-decoration-none" target="_blank">Mahmuthan Elbir</a>
                    </span>
                </div>
            </footer>
        </div>
    )
}

export default Layout