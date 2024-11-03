import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

function Navbar() {

    const [expanded, setExpanded] = useState(false);


    useEffect(() => {
        if (window.innerWidth > 500) {
            setExpanded(true);
        }
    }, []);

    const location = useLocation();

    const handleExpansion = () => {
        setExpanded(!expanded);
    }

    const handleClick = () => {
        if (window.innerWidth <= 600) {
            setExpanded(false);
        }
    };

    return (
        <div className={`navbar ${expanded ? 'navbar-expanded' : ''}`}>
            <div className='menu-button navbar-icon' onClick={handleExpansion}>
                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </div>
            {expanded && (<>
                <NavLink to="/" onClick={handleClick} className={({ isActive }) =>
                    isActive || location.pathname === '/welcome' ? 'navbar-icon-active' : 'navbar-icon'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z">
                        </path>
                        <polyline points="9 22 9 12 15 12 15 22">
                        </polyline>
                    </svg>
                </NavLink>
                <NavLink to="/graph" onClick={handleClick} className={({ isActive }) =>
                    isActive ? 'navbar-icon-active' : 'navbar-icon'}>
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier"> <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"></circle>
                            <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"></circle> <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"></circle>
                            <path d="M15.408 6.51199L8.59436 10.4866M15.408 17.488L8.59436 13.5134" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </g></svg>
                </NavLink>
                <NavLink to="/chat" onClick={handleClick} className={({ isActive }) =>
                    isActive ? 'navbar-icon-active' : 'navbar-icon'}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="0.00024000000000000003" width="52" height="52">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M18.3121 23.3511C17.4463 23.0228 16.7081 22.5979 16.1266 22.1995C14.8513 22.7159 13.4578 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 14.2788 22.306 16.3983 21.1179 18.1551C21.0425 19.6077 21.8054 20.9202 22.5972 22.0816C23.2907 23.0987 23.1167 23.9184 21.8236 23.9917C21.244 24.0245 19.9903 23.9874 18.3121 23.3511ZM3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 13.9503 20.3808 15.7531 19.328 17.2262C18.8622 17.8782 19.1018 19.0998 19.2616 19.8011C19.4167 20.4818 19.7532 21.2051 20.0856 21.8123C19.7674 21.7356 19.4111 21.6288 19.0212 21.481C18.1239 21.1407 17.3824 20.6624 16.8594 20.261C16.5626 20.0332 16.1635 19.9902 15.825 20.1494C14.6654 20.6947 13.3697 21 12 21C7.02944 21 3 16.9706 3 12ZM7 9C6.44772 9 6 9.44771 6 10C6 10.5523 6.44772 11 7 11H17C17.5523 11 18 10.5523 18 10C18 9.44771 17.5523 9 17 9H7ZM7 13C6.44772 13 6 13.4477 6 14C6 14.5523 6.44772 15 7 15H17C17.5523 15 18 14.5523 18 14C18 13.4477 17.5523 13 17 13H7Z"
                            fill="currentColor">
                        </path> </g>
                    </svg>
                </NavLink>
                <NavLink to="/user" onClick={handleClick} className={({ isActive }) =>
                    isActive ? 'navbar-icon-active' : 'navbar-icon'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </NavLink>
                <NavLink to="/about" onClick={handleClick} className={({ isActive }) =>
                    isActive ? 'navbar-icon-active' : 'navbar-icon'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </NavLink>
            </>)}
        </div>
    )
}

export default Navbar