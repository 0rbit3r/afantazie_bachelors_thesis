import { NavLink, useLocation } from "react-router-dom"
import { LocationState } from "../../interfaces/LocationState";
import LogViewer from "../../components/log/LogViewer";
import { Localization } from "../../locales/localization";


function Home() {
    const location = useLocation();
    const message = (location.state as LocationState)?.message;

    return (
        <div className="content-container home-container">
            <h1>{Localization.Title}</h1>
            <h2>{message}</h2>
            <div className="hero">
                <LogViewer></LogViewer>
                <div className="hero-text">
                    <p>
                        {Localization.HeroText}
                    </p>
                </div>
            </div>
            <div className="center">
                <NavLink to="/graph">
                    <button className="button-primary home-action-button">{Localization.Graph}</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/chat">
                    <button className="button-secondary home-action-button">Chat</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/user">
                    <button className="button-secondary home-action-button">{Localization.UserSettings}</button>
                </NavLink>
            </div>
        </div>
    )
}

export default Home