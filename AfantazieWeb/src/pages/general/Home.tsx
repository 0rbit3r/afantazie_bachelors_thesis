import { NavLink, useLocation } from "react-router-dom"
import { LocationState } from "../../interfaces/LocationState";
import LogViewer from "../../components/log/LogViewer";


function Home() {
    const location = useLocation();
    const message = (location.state as LocationState)?.message;

    return (
        <div className="content-container home-container">
            <h1>Afantázie</h1>
            <h2>{message}</h2>
            <div className="hero">
                {/* <div>
                    <img className="map" src="map.png" alt="mapa" />
                </div> */}
                <LogViewer></LogViewer>
                <div className="hero-text">
                    <p>
                        Když myšlenka vede k myšlence...
                    </p>
                </div>
            </div>
            <div className="center">
                <NavLink to="/graph">
                    <button className="button-primary home-action-button">Graf</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/chat">
                    <button className="button-secondary home-action-button">Chat</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/user">
                    <button className="button-secondary home-action-button">Uživatelské nastavení</button>
                </NavLink>
            </div>
        </div>
    )
}

export default Home