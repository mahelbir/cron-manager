const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            localStorage.setItem("authToken", action.authToken)
            return action.authToken;
        case "LOGOUT":
            localStorage.removeItem("authToken")
            return null;
        default:
            return state;
    }
};

export default AuthReducer