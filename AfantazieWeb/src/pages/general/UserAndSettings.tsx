// User.tsx
import { useEffect, useState } from 'react';
import { getUserSettings, postUserSettings } from '../../api/UserSettingsApiClient';

const colors = [
    // First Set
    "#5DADE2", // Light Blue
    "#58D68D", // Soft Green
    "#F7DC6F", // Golden Yellow
    "#A569BD", // Muted Purple
    "#F1948A", // Pale Red
    "#85C1E9", // Sky Blue
    "#73C6B6", // Light Turquoise
    "#82E0AA", // Mint Green
    "#F8C471", // Peach
    "#D7BDE2", // Lavender

    // Second Set (Diverse Brightness/Saturation)
    "#3498DB", // Rich Blue
    "#28B463", // Bright Green
    "#F1C40F", // Golden Yellow
    "#9B59B6", // Deep Purple
    "#E74C3C", // Bright Red
    "#7FB3D5", // Lighter Sky Blue
    "#48C9B0", // Turquoise
    "#45B39D", // Emerald Green
    "#F5B041", // Orange
    "#C39BD3", // Soft Lavender

    // Third Set (Darker & Muted Tones)
    "#1F618D", // Dark Blue
    "#1D8348", // Dark Green
    "#B7950B", // Olive Yellow
    "#633974", // Deep Purple
    "#922B21", // Burgundy Red
    "#2874A6", // Steel Blue
    "#148F77", // Teal
    "#117A65", // Forest Green
    "#B9770E", // Brownish Orange
    "#6C3483"  // Dark Purple
];



function UserAndSettings() {
    const [username, setUsername] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<number>(0);
    const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
    const [errorMessage, setValidationMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const getSettings = async () => {
            const response = await getUserSettings();
            if (response.ok) {
                setSelectedColor(colors.indexOf(response.data?.color ?? ""));
                setUsername(response.data?.username!)
            }
            else{
                setValidationMessage(response.error!);
            }
        }

        getSettings();
    }, []);

    function handleColorChange(index: number) {
        setSelectedColor(index);
        setIsPickerOpen(false);
    }

    function openColorPicker() {
        setIsPickerOpen(true);
    }

    function closeColorPicker() {
        setIsPickerOpen(false);
    }

    async function saveSettings() {
        setValidationMessage(null);
        setSuccessMessage(null);
        var result = await postUserSettings({color: colors[selectedColor], username: username});
        if (result.ok) {
            setSuccessMessage("Nastavení bylo uloženo.");
        }
        else{
            setValidationMessage(result.error!);
        }
    }

    function logOut() {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    return (
        <div className="content-container settings-container" style={{ padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
            <h1>Účet a nastavení</h1>
            {errorMessage && <pre className='red-text'>{errorMessage}</pre>}
            {successMessage && <pre className='green-text'>{successMessage}</pre>}
            <hr></hr>
            <label className='settings-label'>Barva: </label>
            <span className='username' style={{ color: colors[selectedColor] }}
                onClick={openColorPicker}
            >{username}</span>
            {isPickerOpen && (
                <div className="color-picker-overlay" onClick={closeColorPicker}>
                    <div className="color-picker-popup" onClick={(e) => e.stopPropagation()}>
                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className={`color-dot ${index === selectedColor ? 'selected' : ''}`}
                                style={{ backgroundColor: color, cursor: 'pointer', width: '24px', height: '24px', borderRadius: '50%', margin: '5px' }}
                                onClick={() => handleColorChange(index)}
                            />
                        ))}
                    </div>
                </div>
            )}
            <hr></hr>
            <div>
                <button className='button-primary' onClick={saveSettings}>Uložit</button>
                <button className='button-secondary' onClick={logOut}>Odhlásit se</button>
            </div>
        </div>
    );
}

export default UserAndSettings;
