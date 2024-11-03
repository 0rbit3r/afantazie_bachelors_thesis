import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterRequest } from '../../api/dto/auth/RegisterRequest';
import { registerUser } from '../../api/AuthApiClient';
import { LocationState } from '../../interfaces/LocationState';


function Registration() {
    const [formData, setFormData] = useState<RegisterRequest>({ username: '', email: '', password: '' });
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await registerUser(formData);

        if (!response.ok) {
            setValidationMessage(response.error ?? "<unknown error>");
        } else {
            setFormData({ username: '', email: '', password: '' });
            setValidationMessage("Registrace úspěšná!");
            navigate('/login', { state: { message: 'Registrace úspěšná.' } as LocationState });
        }
    };

    return (
        <div className="content-container">
            <div className='auth-form'>
                <h1>Registrace</h1>
                <form onSubmit={handleSubmit}>
                    <p>
                            <input placeholder='Jméno' type="text" name="username" value={formData.username} onChange={handleChange} />
                    </p>
                    <p>
                            <input placeholder='Email' type="email" name="email" value={formData.email} onChange={handleChange} />
                    </p>
                    <p>
                            <input placeholder='Heslo' type="password" name="password" value={formData.password} onChange={handleChange} />
                    </p>
                    <p>
                        <button type="submit" className='button-primary'>Registrovat</button>
                    </p>
                </form>
                {validationMessage && <pre className='red-text'>{validationMessage}</pre>}
                <p>Už máš účet? <Link to="/login">Přihlásit se</Link> </p>
                <p>Vytvořením učtu souhlasíš s <Link to="/about">Podmínkami používání a Zásadami o ochraně osobních údajů.</Link></p>
            </div>
        </div>
    )
}

export default Registration;