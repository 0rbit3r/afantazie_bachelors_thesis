import { NavLink } from "react-router-dom"
import LogViewer from "../../components/log/LogViewer";


function Welcome() {
    return (
        <div className="content-container home-container">
            <h1>Vítej na Afantázii</h1>
            <div className="hero">
                {/* <div>
                    <img className="map" src="map.png" alt="mapa" />
                </div>
                    <div>Online: {onlineUsers}</div> */}
                <LogViewer></LogViewer>
                <div className="hero-text">
                    <p>
                        Pojďme spolu grafovat.
                    </p>
                </div>
            </div>
            {/* <Rules></Rules> */}
            <div className="center">
                <NavLink to="/graph">
                    <button className="button-primary home-action-button">Graf</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/login">
                    <button className="button-primary home-action-button">Přihlásit se</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/about">
                    <button className="button-secondary home-action-button">O co tu vlastně jde?</button>
                </NavLink>
            </div>
            <div className="center">
                <NavLink to="/register">
                    <button className="button-secondary home-action-button">Zaregistrovat se</button>
                </NavLink>
            </div>
        </div>
    )
}

export default Welcome