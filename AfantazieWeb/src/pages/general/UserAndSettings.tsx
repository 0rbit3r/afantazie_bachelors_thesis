// User.tsx
import { ChangeEvent, useEffect, useState } from 'react';
import { getUserSettings, postUserSettings } from '../../api/UserSettingsApiClient';
import { Localization } from '../../locales/localization';
import { getTotalThoughtsCount } from '../../api/graphClient';

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
    const [selectedColor, setSelectedColor] = useState<string>("#dddddd");
    const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
    const [ColorValidationMessage, setColorValidationMessage] = useState<string | null>(null);
    const [maxThoughtsValidationMessage, setMaxThoughtsValidationMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [maxThoughtsInput, setMaxThoughtsInput] = useState<number>(0);
    const [thoughtsCount, setThoughtsCount] = useState<number>(0);

    useEffect(() => {
        const getSettings = async () => {
            const response = await getUserSettings();
            if (response.ok) {
                setSelectedColor(response.data?.color!);
                setMaxThoughtsInput(response.data?.maxThoughts!);
                setUsername(response.data?.username!)
            }
            else {
                setColorValidationMessage(response.error!);
            }
        }
        getSettings();

        const getThoughtsCount = async () => {
            const response = await getTotalThoughtsCount();
            if (response.ok) {
                // console.log(response.data);
                setThoughtsCount(response.data!);
            }
            else {
                setColorValidationMessage(response.error!);
            }
        }
        getThoughtsCount();
    }, []);

    function handlePaletteColorChoice(index: number) {
        setSelectedColor(colors[index]);
        setIsPickerOpen(false);
    }

    function openColorPicker() {
        setIsPickerOpen(true);
    }

    function closeColorPicker() {
        setIsPickerOpen(false);
    }

    async function saveSettings() {
        setColorValidationMessage(null);
        setSuccessMessage(null);
        var result = await postUserSettings({ color: selectedColor, username: username, maxThoughts: maxThoughtsInput });
        if (result.ok) {
            setSuccessMessage(Localization.SettingsSaved);
        }
        else {
            setColorValidationMessage(result.error!);
        }
    }

    function logOut() {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    function handleHexInputChange(e: React.ChangeEvent<HTMLInputElement>): void {

        setSelectedColor(_ => e.target.value);

        const hexColorRegexp = /^#([A-Fa-f0-9]{6})$/;
        if (!hexColorRegexp.test(e.target.value)) {
            setMaxThoughtsValidationMessage(Localization.ColorValidation);
        }
        else {
            setMaxThoughtsValidationMessage(null);
        }
    }

    function handleMaxThoughtsChange(e: ChangeEvent<HTMLInputElement>): void {

        console.log(e.target.value);
        const number = parseInt(e.target.value)
            ? parseInt(e.target.value)
            : 0;

        setMaxThoughtsInput(number);

        if (number < 10) {
            setColorValidationMessage(Localization.MaxThoughtsValidation);
        }
        else {
            setColorValidationMessage(null);
        }
    }

    return (
        <div className="content-container settings-container" style={{ padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
            <h1>{Localization.UserSettings}</h1>
            {ColorValidationMessage && <pre className='red-text'>{ColorValidationMessage}</pre>}
            {maxThoughtsValidationMessage && <pre className='red-text'>{maxThoughtsValidationMessage}</pre>}
            {successMessage && <pre className='green-text'>{successMessage}</pre>}
            <hr></hr>
            <label className='settings-label'>{Localization.ColorLabel} </label>
            <span className='username' style={{ color: selectedColor }}
                onClick={openColorPicker}
            >{username}</span><span> {Localization.ClickHere}</span>
            {isPickerOpen && (
                <div className="color-picker-overlay" onClick={closeColorPicker}>
                    <div className="color-picker-popup" onClick={(e) => e.stopPropagation()}>
                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className={`color-dot ${color === selectedColor ? 'selected' : ''}`}
                                style={{ backgroundColor: color, cursor: 'pointer', width: '24px', height: '24px', borderRadius: '50%', margin: '5px' }}
                                onClick={() => handlePaletteColorChoice(index)}
                            />
                        ))}
                    </div>
                </div>
            )}
            <br></br>
            <input className='color-hex-input' type='text' value={selectedColor} onChange={(e) => handleHexInputChange(e)}></input>
            <hr></hr>

            <p>
                <label className='settings-label'>{Localization.MaxThoughtsLabel}</label><br />
                <input className='max-thoughts-input' type='number' value={maxThoughtsInput} onChange={e => handleMaxThoughtsChange(e)}></input><br />
                <label>{Localization.MaxThoughtsHint}</label><br/>
                <label>{Localization.CurrentNumberOfThoughtsLabel} {thoughtsCount}</label>
            </p>

            <hr/>
            <button className='button-primary' disabled={ColorValidationMessage !== null} onClick={saveSettings}>{Localization.SaveButton}</button> <br />

            <button className='button-secondary' onClick={logOut}>{Localization.LogoutButton}</button>
        </div>
    );
}

export default UserAndSettings;
