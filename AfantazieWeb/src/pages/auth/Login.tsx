import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LocationState } from '../../interfaces/LocationState';
import { useState } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { loginUser } from '../../api/AuthApiClient';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const location = useLocation();
    const topmessage = (location.state as LocationState)?.message;
    const { setAccessToken } = useAuth();
    const navigate = useNavigate();
    const [validationMessage, setValidationMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await loginUser(formData);
        if (response.error) {
            setValidationMessage(response.error);
        }
        else {
            setAccessToken(response.data?.token as string);
            navigate('/', { state: { message: 'Vítej zpět.' } as LocationState })// Todo a set of quips.
        }
    }

    return (
        <div className="content-container">

            <div className='auth-form'>
                <h1>Přihlášení</h1>

                {topmessage && <div className="alert">{topmessage}</div>}
                <form onSubmit={handleSubmit}>
                    <p>
                        <input placeholder='Jméno nebo email' type="text" name="email" value={formData.email} onChange={handleChange} />
                    </p>
                    <p>
                        <input placeholder='Heslo' type="password" name="password" value={formData.password} onChange={handleChange} />
                    </p>
                    <p>
                        <button type="submit" className='button-primary'>Přihlásit se</button>
                    </p>
                </form>
                <p>Nemáš účet? <Link to="/register">Zaregistrovat se</Link></p>
                {validationMessage && <pre className='red-text'>{validationMessage}</pre>}
            </div>
        </div>
    )
}

export default Login