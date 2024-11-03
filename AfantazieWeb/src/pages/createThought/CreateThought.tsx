import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchThought, fetchThoughtTitles, postNewThought } from '../../api/graphClient';
import { thoughtDto, thoughtTitleDto } from '../../api/dto/ThoughtDto';
import { LocationState } from '../../interfaces/LocationState';

const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

interface ThoughtReference {
    id: number;
    title: string;
    refText: string;
    color: string;
}

function CreateThought() {
    const REFERENCES_LIMIT = 5;
    const CONTENT_LENGTH_LIMIT = 1000;
    const TITLE_LENGTH_LIMIT = 100;

    const [formData, setFormData] = useState({ title: '', content: '' });
    const navigate = useNavigate();
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [searchOverlayVisible, setSearchOverlayVisible] = useState(false);
    const [shakingThoughtIds, setShakingThoughtIds] = useState<number[]>([]);

    const [thoughtTitles, setThoughtTitles] = useState<thoughtTitleDto[]>([]);
    const [filteredThoughtTitles, setFilteredThoughtTitles] = useState<thoughtTitleDto[]>([]);
    const [validThoughtReferences, setValidThoughtReferences] = useState<ThoughtReference[]>([]);
    const [notFoundThoughtIds, setNotFoundThoughtIds] = useState<number[]>([]);
    const [previewOverlayVisible, setPreviewOverlayVisible] = useState(false);
    const [previewedThought, setPreviewedThought] = useState<thoughtDto | null>(null);
    const [createButtonEnabled, setCreateButtonEnabled] = useState(false);

    const [tutorialOverlayVisible, setTutorialOverlayVisible] = useState(false);

    const location = useLocation();

    useEffect(() => {
        const fetchAndSetAsync = async () => {
            const response = await fetchThoughtTitles();
            if (response.ok) {
                setThoughtTitles(response.data!);
            }
        };
        fetchAndSetAsync();
    }, []);

    useEffect(() => {
        if (thoughtTitles.length > 0 && location.state && (location.state as LocationState).thoughtId) {
            const id = (location.state as LocationState).thoughtId;
            const thought = thoughtTitles.find(t => t.id === id);
            setFormData({ ...formData, content: `Odpověď na [${id}](${thought?.title});\n` });
        }
    }, [location, thoughtTitles]);

    const thoughtRegex = (id: number) => new RegExp(`\\[${id}\\]\\(.+?\\)`, '');
    const thoughtRegexGlobal = (id: number) => new RegExp(`\\[${id}\\]\\(.+?\\)`, 'g');
    const thoughtRegexUniversal = /\[([0-9]+)\]\((.+?)\)/gm;

    // Handle input changes for the title field
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle input changes for the content field
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const inputContent = e.target.value;
        // Update form content
        setFormData({ ...formData, content: inputContent });
    };

    // Update valid thought references on content change
    useEffect(() => {
        const validThoughts: ThoughtReference[] = [];

        const matches = formData.content.match(thoughtRegexUniversal) || [];

        matches.forEach((match) => {
            const id = parseInt(match.match(/\[([0-9]+)\]/)![1]);
            const searchedThought = thoughtTitles.find(t => t.id === id);
            if (searchedThought && !validThoughts.find(t => t.id === searchedThought.id)) {
                validThoughts.push({
                    id: searchedThought.id,
                    title: searchedThought.title,
                    refText: match.match(/\[([0-9]*)\]\((.+)\)/)![2],
                    color: searchedThought.color
                });
            }
        });

        setValidThoughtReferences(validThoughts);
    }, [formData]);

    //update not found references on contetn change
    useEffect(() => {
        const notFoundThoughts: number[] = []; // Store invalid thought IDs

        // Find all references in the content
        const matches = formData.content.match(thoughtRegexUniversal) || [];

        matches.forEach((match) => {
            const id = parseInt(match.match(/\[([0-9]+)\]/)![1]);
            const searchedThought = thoughtTitles.find(t => t.id === id);
            if (!searchedThought) {
                notFoundThoughts.push(id);
            }
        });

        setNotFoundThoughtIds(notFoundThoughts);
    }, [formData]);

    // Handle adding new thought reference
    const handleReferenceSelect = (id: number) => {
        setFormData(oldFormData => {
            //new thought is already selected
            if (validThoughtReferences.find(ref => ref.id == id)) {
                setSearchOverlayVisible(false);
                const newForm = { ...formData };
                newForm.content = formData.content.replace(thoughtRegex(id), '');
                return newForm;
            } else {
                // if the limit is reached, shake the thought
                if (validThoughtReferences.length >= REFERENCES_LIMIT) {
                    setShakingThoughtIds([id]);
                    setTimeout(() => setShakingThoughtIds([]), 500);
                    return oldFormData;
                }

                setSearchOverlayVisible(false);

                const textarea = document.getElementById('text-area-editor') as HTMLTextAreaElement;

                const title = thoughtTitles.find((thought) => thought.id === id)?.title;
                if (!title)
                    return oldFormData; // If title is not found, exit early

                const newText = `[${id}](${title})`;

                // Get the current cursor position
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;

                // Get the current content of the textarea
                const currentContent = textarea.value;

                // Create the new content by inserting the newText at the cursor position
                const newContent = currentContent.slice(0, start) + newText + currentContent.slice(end);


                // Move the cursor to the end of the inserted text
                textarea.selectionStart = start + newText.length;

                // Optionally, you may want to focus the textarea again
                textarea.focus();

                // Update the textarea value
                return { ...oldFormData, content: newContent };
            }
        });
    }

    function handleReferenceDelete(id: number): void {
        setFormData(oldFormData => {
            const newForm = { ...oldFormData };
            newForm.content = oldFormData.content.replace(thoughtRegexGlobal(id), '');
            return newForm;
        });
    }

    //Update Create button enabled based on conditions
    useEffect(() => {
        const referencesValid = validThoughtReferences.length <= REFERENCES_LIMIT;
        const contentValid = formData.content.length <= CONTENT_LENGTH_LIMIT;
        const titleValid = formData.title.length <= TITLE_LENGTH_LIMIT;
        const notFoundValid = notFoundThoughtIds.length === 0;
        setCreateButtonEnabled(referencesValid && contentValid && titleValid && notFoundValid);
    }, [formData, validThoughtReferences, notFoundThoughtIds,]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await postNewThought({ title: formData.title, content: formData.content, links: validThoughtReferences.map(t => t.id) });

        if (response.error) {
            setValidationMessage(response.error);
        } else {
            navigate('/graph/' + response.data);
        }
    };

    // Reset search bar when search overlay is closed or thoughtTitles loaded
    useEffect(() => {
        onSearchBarChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }, [thoughtTitles, searchOverlayVisible]);

    function onSearchBarChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const search = event.target.value;
        if (search === '') {
            setFilteredThoughtTitles(
                thoughtTitles.filter(thought => validThoughtReferences.filter(t => t.id === thought.id).length === 0));
            return;
        }

        setFilteredThoughtTitles(
            thoughtTitles.filter((thought) =>
                thought.title.toLowerCase().includes(search.toLowerCase()) && validThoughtReferences.filter(t => t.id === thought.id).length === 0));
    }

    function handlePreviewClick(id: number): void {
        const fetchAndSetAsync = async () => {
            const response = await fetchThought(id);
            if (response.ok) {
                setPreviewedThought(response.data!);
                setPreviewOverlayVisible(true);
            }
        };
        fetchAndSetAsync();
    }

    return (
        <div className="content-container">
            {searchOverlayVisible && <div className="search-overlay">
                <input className='search-bar' type="search-bar" placeholder="Hledat" onChange={onSearchBarChange} />
                <div className="search-overlay-content">
                    <div className="search-results">
                        {filteredThoughtTitles.map((thought) => (
                            <button
                                className={`search-result-item 
                                ${shakingThoughtIds.includes(thought.id)
                                        ? 'shake' : ''}`}
                                style={{ borderColor: thought.color }}
                                key={thought.id}
                                onClick={() => handleReferenceSelect(thought.id)}>{thought.title}
                            </button>
                        ))}
                    </div>
                </div>
                <button className='button-secondary' onClick={() => setSearchOverlayVisible(false)}>Zavřít</button>
            </div>}

            {previewOverlayVisible && previewedThought &&
                <div className='referenced-thought-overlay'>
                    <div className='text-scroll-container'>
                        <div className='text-flex-container'>
                            <h2>{previewedThought.title}</h2>
                            <h3>{previewedThought.author} - {previewedThought.dateCreated}</h3>
                            <p>{previewedThought.content}</p>
                            {/* //todo: single previewer to use in graph page and here (and elsewhere?)*/}
                        </div>
                    </div>
                    <button className='button-secondary' onClick={() => setPreviewOverlayVisible(false)}>Zavřít náhled</button>
                </div>}
            {tutorialOverlayVisible && <div className='tutorial-overlay'>
                <div className='scroll-view'>
                    <h1>Nápověda</h1>
                    <h2>Odkazy</h2>
                    <p>
                        Komentář, odpověď, otázka, pokračování nebo kritika jiné myšlenky - to vše a víc může být důvod, proč chceš ve své myšlence odkázat na jinou.
                    </p>
                    <p>
                        Myšlenky, které na sebe odkazují, se navzájem přitahují a díky tomu můžeš ovlivnit, kde se v grafu bude nacházet jak tvá nová myšlenka tak
                        do jisté míry i její odkazy.
                    </p>
                    <h2>Používání</h2>
                    <p>
                        Nejjednodušší je použít tlačítko <b>Přidat odkaz</b> a vybrat si myšlenku, na kterou chceš odkázat. Můžeš jí vložit kamkoliv do textu pomocí pozice kurzoru.
                    </p>
                    <p>
                        Odkaz ale můžeš přidat a upravit i manuálně a to pomocí tvaru: <br />
                        <b>[ID MYŠLENKY](TEXT)</b>.
                    </p>
                    <p>
                        <b>ID MYŠLENKY</b> musí odkazovat na nějakou již existující myšlenku.<br />
                        <b>TEXT</b> může být libovolný a je to právě to, co se zobrazí ve výsledném odkazu.<br />
                    </p>
                    <p>
                        To se hodí hlavně, když je název odkazované myšlenky dlouhý nebo se jinak nehodí to tvého textu.
                    </p>
                    <p>
                        Například místo<br />
                        "První myšlenka na Afantázi je: <b>[1](Hello World!)</b>"<br />
                        můžeš napsat<br />
                        "První myšlenka na Afantázii je <b>[1](tato)</b>."
                    </p>
                    <p>
                        Jedna myšlenka může obsahovat až pět odkazů.
                        {/* Ale pozor! Čím víc odkazů, tím slabší bude síla, kterou tvoje myšlenka přitahuje ostatní.  */}
                    </p>
                    <button className='button-secondary' onClick={() => setTutorialOverlayVisible(false)}>Zpět</button>
                </div>
            </div>}
            <div className='new-thought-form'>
                <h1>Nová myšlenka</h1>

                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            className='title-input'
                            placeholder='Nadpis'
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleTitleChange}
                        />
                        <p className='character-limit character-limit-title'>{formData.title.length} / {TITLE_LENGTH_LIMIT}</p>
                    </div>
                    <textarea
                        id="text-area-editor"
                        placeholder='Obsah'
                        name="content"
                        className='content-input'
                        value={formData.content}
                        onChange={handleContentChange}
                    />
                    <p className='bottom-row-buttons'>
                        <span className='character-limit'>{formData.content.length} / {CONTENT_LENGTH_LIMIT}</span>
                        <button className='button-secondary' type="button" onClick={() => setSearchOverlayVisible(true)}>Přidat odkaz</button>
                    </p>
                    {notFoundThoughtIds.map((id) => (
                        <p key={id} className='red-text'>Myšlenka s ID <b>{id}</b> neexistuje.</p>
                    ))}
                    {validThoughtReferences.map((ref) => (
                        <p key={ref.id} className='thought-reference-row'>
                            <button
                                type="button"
                                className='ref-row-button'
                                onClick={() => handleReferenceDelete(ref.id)}>
                                <img className='delete-svg' src={PUBLIC_FOLDER + '/icons/delete.svg'}></img>
                            </button>

                            <span className='referenced-thought' style={{ borderColor: ref.color }}>
                                {ref.refText == ref.title ? ref.title : `${ref.refText} (${ref.title})`}
                            </span>

                            <button
                                type="button"
                                className='ref-row-button'
                                onClick={() => handlePreviewClick(ref.id)}>
                                <img className='eye-svg' src={PUBLIC_FOLDER + '/icons/eye.svg'}></img>
                            </button>

                        </p>
                    ))}
                    {validationMessage && <pre className='red-text'>{validationMessage}</pre>}

                    <p className='bottom-row-buttons'>
                        <button type="button" className='button-secondary' onClick={() => navigate('/graph')}>Zpět</button>
                        <span className={`references-num ${validThoughtReferences.length > REFERENCES_LIMIT ? 'references-num-over-limit' : ''}`}>
                            {validThoughtReferences.length} / {REFERENCES_LIMIT}
                            {validThoughtReferences.length > REFERENCES_LIMIT && ' !!!'}
                        </span>
                        <button
                            type="submit"
                            className={`button-primary ${createButtonEnabled ? '' : 'button-primary-disabled'}`}
                            disabled={!createButtonEnabled}>Vytvořit</button>
                    </p>
                    <button className='button-secondary tutorial-button' type="button" onClick={() => setTutorialOverlayVisible(true)}>Nápověda</button>
                </form>
            </div>
        </div>
    );
}

export default CreateThought;