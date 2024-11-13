import React, { useEffect, useState } from 'react';
import { Stage } from '@pixi/react';
import { thoughtDto } from '../../api/dto/ThoughtDto';
import { fetchThoughts } from '../../api/graphClient';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LocationState } from '../../interfaces/LocationState';
import { useGraphStore } from './GraphStore';
import GraphContainer from './GraphContainer';
import { MediaContent } from '../../components/MediaContent';
import { Localization } from '../../locales/localization';
import { getUserSettings } from '../../api/UserSettingsApiClient';

const COLOR_BACKGROUND = 0x020304;

const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

const initialStageSize = { width: window.innerWidth, height: window.innerHeight - 60 };
const landscapeMode = initialStageSize.width > initialStageSize.height;


const GraphPage: React.FC = () => {
    // navigation
    const navigate = useNavigate();
    const [initialHighlightedThoughtId, setInitialHighlightedThoughtId] = useState(0);
    const { urlThoughtId } = useParams();

    // data, 
    const [thoughts, setThoughts] = useState<thoughtDto[]>([]);

    // screen state
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [stageSize, setStageSize] = useState(initialStageSize);
    const [fullscreenPreview, setFullscreenPreview] = useState(false);
    const viewport = useGraphStore((state) => state.viewport);

    // controls
    const [zoomingHeld, setZoomingHeld] = useState(0);
    const setZoomingControl = useGraphStore((state) => state.setZoomingControl);
    
    const highlightedThought = useGraphStore((state) => state.highlightedThought);
    const setHighlightedThoughtId = useGraphStore((state) => state.setHighlightedThoughtId);
    const unsetHighlightedThought = useGraphStore((state) => state.unsetHighlightedThought);

    const timeShift = useGraphStore((state) => state.timeShift);
    const timeShiftControl = useGraphStore((state) => state.timeShiftControl);
    const setTimeShiftControl = useGraphStore((state) => state.setTimeShiftControl);

    const setMaxThoughtsOnScreen = useGraphStore((state) => state.setMaxThoughtsOnScreen);

    // Fetch thoughts from the server
    useEffect(() => {
        const fetchAndSetAsync = async () => {
            const userSettings = await getUserSettings();
            if (userSettings.ok) {
                setMaxThoughtsOnScreen(userSettings.data?.maxThoughts!);
            }

            const response = await fetchThoughts();
            if (response.ok) {
                setThoughts(response.data!);
                if (urlThoughtId) {
                    const id = parseInt(urlThoughtId);
                    if (!isNaN(id)) {
                        setInitialHighlightedThoughtId(id);
                    }
                }
            }
        };
        fetchAndSetAsync();
    }, []);

    // clickedThoughtEffect
    useEffect(() => {
        if (thoughts.length === 0)
            return;
        if (highlightedThought === null) {
            window.history.pushState(null, '', '/graph');
            setStageSize(_ => ({ width: window.innerWidth, height: window.innerHeight - 60 }));
            setOverlayVisible(false);
            return;
        }
        window.history.pushState(null, '', `/graph/${highlightedThought.id}`);
        //set stage size half open
        setStageSize({ width: initialStageSize.width, height: Math.floor(initialStageSize.height / 2) });
        setOverlayVisible(true);
    }, [highlightedThought]);

    // zooming effect
    useEffect(() => {
        setZoomingControl(zoomingHeld);
    }, [zoomingHeld]);

    //
    useEffect(() => {
        viewport.width = stageSize.width;
        viewport.height = stageSize.height;
    }, [stageSize]);

    const handleUpButtonOverlay = () => {
        if (fullscreenPreview) {
            setFullscreenPreview(false);
            //set stage size half open
            setStageSize({ width: initialStageSize.width, height: Math.floor(initialStageSize.height / 2) });
        }
        else {
            unsetHighlightedThought();
        }
    };

    const handleDownButtonOverlay = () => {
        if (!fullscreenPreview) {
            setFullscreenPreview(true);
            setStageSize({ width: initialStageSize.width, height: 20 });
        }
    }

    // renders thoiught content including colorful clickable references
    const renderContentWithReferences = (text: string) => {
        const parts = text.split(/\[(.*?)\]\((.*?)\)/g);
        const result = [];
        for (let i = 0; i < parts.length; i += 3) {
            const id = parseInt(parts[i + 1]);
            result.push(parts[i]);
            result.push(<span
                className='in-text-thought-ref'
                style={{ color: thoughts.find(t => t.id == id)?.color }} key={'link' + i}
                onClick={() => setHighlightedThoughtId(id)}>
                {parts[i + 2]}
            </span>);
        }
        return result;
    }

    return (
        <>
            <div className={
                `overlay ${overlayVisible &&
                    highlightedThought !== null
                        ? fullscreenPreview
                            ? landscapeMode 
                                ? 'overlay-fullscreen-landscape'
                                : 'overlay-fullscreen-portrait '
                            : landscapeMode
                            ? 'overlay-expanded-landscape'
                            : 'overlay-expanded-portrait'
                        : ''}` //todo: this does nothing atm
                        }>
                {overlayVisible && highlightedThought !== null &&
                    <div className='text-scroll-container'>
                        <div className='text-flex-container'>
                            <h2>{highlightedThought?.title}</h2>
                            <h3>{highlightedThought.author} - {highlightedThought.dateCreated}</h3>
                            <p className='thought-content'>{renderContentWithReferences(highlightedThought.content)}</p>
                            <MediaContent id={highlightedThought.id}></MediaContent>
                        </div>
                        {!fullscreenPreview && thoughts.filter(t => t.links.includes(highlightedThought?.id)).length > 0 &&
                            <div className='responses-container-half-screen'>
                                <p className='responses-header'><b>{Localization.Replies}</b></p>
                                <div>
                                    {thoughts.filter(t => t.links.includes(highlightedThought?.id)).map(t =>
                                        <span key={`back-link-${t.id}`} className='search-result-item' style={{ borderColor: t.color }}
                                            onClick={_ => setHighlightedThoughtId(t.id)}>{t.title}</span>
                                    )}
                                    {/* todo - the css here in search-result-item is borrowed from createThought*/}
                                </div>
                            </div>}
                    </div>}
                {fullscreenPreview && highlightedThought !== null && thoughts.filter(t => t.links.includes(highlightedThought?.id)).length > 0 &&
                    <>
                        <p><b>{Localization.Replies}</b></p>
                        <div className='responses-container'>
                            {thoughts.filter(t => t.links.includes(highlightedThought?.id)).map(t =>
                                <span key={`back-link-${t.id}`} className='search-result-item' style={{ borderColor: t.color }}
                                    onClick={_ => setHighlightedThoughtId(t.id)}>{t.title}</span>
                            )}
                            {/* todo - the css here in search-result-item is borrowed from createThought*/}
                        </div>
                    </>}
                <p className='thought-overlay-button-row'>
                    <button className='button-secondary' onClick={handleUpButtonOverlay}>▲</button>
                    <button
                        className='button-primary'
                        onClick={() => {
                            if (highlightedThought !== null) {
                                navigate('/create-thought', { state: { thoughtId: highlightedThought.id } as LocationState });
                                unsetHighlightedThought();
                            }
                        }}>
                        {Localization.ReplyButton}
                    </button>
                    {!fullscreenPreview && <button className='button-secondary' onClick={handleDownButtonOverlay}>▼</button>}
                </p>
            </div>

            {/* The visibilityCollapse here is a) to not start the graph in the initial position each time its opened again and b) there is problem with highlighting thoughts when the graphcontainer is lost completely
I suspect it might be because of different references to viewport? (second initialization?) */}
            <div className='graph-bottom-part' style={fullscreenPreview ? { visibility: 'collapse' } : {}}>
                <div className='stage-container'>
                    <Stage className='graph-stage' width={stageSize.width} height={stageSize.height} options={{ backgroundColor: COLOR_BACKGROUND, antialias: true }}>
                        <GraphContainer Thoughts={thoughts} initialHighlightedThoughtId={initialHighlightedThoughtId}></GraphContainer>
                    </Stage>

                    {timeShift && <div className='time-shift-label'>{-timeShift}</div> || <div className='time-shift-label'>0</div> //todo - why is timeshift undefined when zero?
                    } 
                    <button className='graph-ui-button rewind-button'
                        onPointerDown={_ => setTimeShiftControl(1)} onPointerUp={_ => setTimeShiftControl(0)} onPointerLeave={_ => setTimeShiftControl(0)} onPointerOut={_ => setTimeShiftControl(0)}>
                        {timeShiftControl != 1 && <img draggable='false' src={PUBLIC_FOLDER + '/icons/rewind.svg'}></img>}
                    </button>
                    
                    <button className='graph-ui-button play-forward-button' 
                        onPointerDown={_ => setTimeShiftControl(-1)} onPointerUp={_ => setTimeShiftControl(0)} onPointerLeave={_ => setTimeShiftControl(0)} onPointerOut={_ => setTimeShiftControl(0)}>
                        {timeShiftControl != -1 && <img draggable='false' src={PUBLIC_FOLDER + '/icons/play-forward.svg'}></img>}
                    </button>
                    <button className='graph-ui-button zoom-in-button'
                        onPointerDown={_ => setZoomingHeld(1)} onPointerUp={_ => setZoomingHeld(_ => 0)} onPointerLeave={_ => setZoomingHeld(0)} onPointerOut={_ => setZoomingHeld(0)}>
                        {zoomingHeld != 1 && <img draggable='false'
                            src={PUBLIC_FOLDER + '/icons/zoom-in.svg'}></img>}
                    </button>

                    <button className='graph-ui-button zoom-out-button'
                        onPointerDown={_ => setZoomingHeld(-1)} onPointerUp={_ => setZoomingHeld(0)} onPointerLeave={_ => setZoomingHeld(0)} onPointerOut={_ => setZoomingHeld(0)}>
                        {zoomingHeld != -1 && <img draggable='false'
                            src={PUBLIC_FOLDER + '/icons/zoom-out.svg'}></img>}
                    </button>
                </div>
                <Link to='/create-thought' className='button-primary center link-button'>{Localization.NewThought}</Link>
            </div>
        </>
    );

};

export default GraphPage;