import React, { useEffect, useState } from 'react';
import { Stage } from '@pixi/react';
import { thoughtDto } from '../../api/dto/ThoughtDto';
import { fetchThoughts } from '../../api/graphClient';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AudioPlayer from '../../components/AudioPlayer';
import { LocationState } from '../../interfaces/LocationState';
import { useGraphStore } from './GraphStore';
import GraphContainer from './GraphContainer';

const COLOR_BACKGROUND = 0x020304;

const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

const initialStageSize = { width: window.innerWidth, height: window.innerHeight - 60 };
const landscapeMode = initialStageSize.width > initialStageSize.height;


const GraphPage: React.FC = () => {
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [thoughts, setThoughts] = useState<thoughtDto[]>([]);
    const [stageSize, setStageSize] = useState(initialStageSize);
    const [zoomingHeld, setZoomingHeld] = useState(0);
    const [fullscreenPreview, setFullscreenPreview] = useState(false);
    const navigate = useNavigate();

    const setZoomingControl = useGraphStore((state) => state.setZoomingControl);
    const highlightedThought = useGraphStore((state) => state.highlightedThought);
    const setHighlightedThoughtId = useGraphStore((state) => state.setHighlightedThoughtId);
    const unsetHighlightedThought = useGraphStore((state) => state.unsetHighlightedThought);
    const viewport = useGraphStore((state) => state.viewport);

    const { urlThoughtId } = useParams();
    const [initialHighlightedThoughtId, setInitialHighlightedThoughtId] = useState(0);

    const setGraphStageSizeHalfOpen = () => setStageSize({ width: initialStageSize.width, height: Math.floor(initialStageSize.height / 2) });
    const setGraphStageFullScreen = () => setStageSize(_ => ({ width: window.innerWidth, height: window.innerHeight - 60 }));
    const setGraphStageCollapsed = () => setStageSize({ width: initialStageSize.width, height: 20 });

    // Fetch thoughts from the server
    useEffect(() => {
        const fetchAndSetAsync = async () => {
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
            setGraphStageFullScreen();
            setOverlayVisible(false);
            return;
        }
        window.history.pushState(null, '', `/graph/${highlightedThought.id}`);
        setGraphStageSizeHalfOpen();
        setOverlayVisible(true);
    }, [highlightedThought]);

    useEffect(() => {
        setZoomingControl(zoomingHeld);
    }, [zoomingHeld]);

    useEffect(() => {
        viewport.width = stageSize.width;
        viewport.height = stageSize.height;
    }, [stageSize]);

    const handleUpButtonOverlay = () => {
        if (fullscreenPreview) {
            setFullscreenPreview(false);
            setGraphStageSizeHalfOpen();
        }
        else {
            unsetHighlightedThought();
        }
    };

    const handleDownButtonOverlay = () => {
        if (!fullscreenPreview) {
            setFullscreenPreview(true);
            setGraphStageCollapsed();
        }
    }

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
                            <p>{renderContentWithReferences(highlightedThought.content)}</p>
                            {highlightedThought?.id === 46 && <AudioPlayer></AudioPlayer>}
                            {highlightedThought?.id === 51 && <img src={`${PUBLIC_FOLDER}/GraphSqueezed.jpg`} style={{ maxWidth: "200px" }}></img>}
                            {highlightedThought?.id === 55 && <img src={`${PUBLIC_FOLDER}/1000_thoughts.png`} style={{ maxWidth: "500px" }}></img>}
                            {highlightedThought?.id === 64 && <img src={`${PUBLIC_FOLDER}/gephi_cithep.png`} style={{ maxWidth: "500px" }}></img>}
                            {highlightedThought?.id === 78 && <video src={`${PUBLIC_FOLDER}/data_did_backflip.mp4`} autoPlay={true} controls={true} style={{ maxWidth: "500px" }}></video>}
                            {/* //todo: better audio/image management */}
                        </div>
                        {!fullscreenPreview && thoughts.filter(t => t.links.includes(highlightedThought?.id)).length > 0 &&
                            <div className='responses-container-half-screen'>
                                <p className='responses-header'><b>Odpovědi</b></p>
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
                        <p><b>Odpovědi</b></p>
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
                        Odpovědět
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

                    {false && <button className='graph-ui-button rewind-button' >
                        <img draggable='false' src={PUBLIC_FOLDER + '/icons/rewind.svg'}>
                        </img>
                    </button>}
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
                <Link to='/create-thought' className='button-primary center link-button'>Nová myšlenka</Link>
            </div>
        </>
    );

};

export default GraphPage;