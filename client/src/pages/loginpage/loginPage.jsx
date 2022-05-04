import {Link} from "react-router-dom";
import React from "react";
import "./loginPage.css"

export function LoginPage() {
    return (
        <div className={"login"}>
            <h1>Login to access the articles.</h1>
            <div>
                <Link to={"/login/google"}>Google login</Link>
            </div>
            <div>
                <Link to={"/login/microsoft"}>Kristiania login</Link>
            </div>
        </div>
    );
}
