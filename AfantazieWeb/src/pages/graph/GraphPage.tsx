import React, { useEffect, useRef, useState } from 'react';
import { Stage } from '@pixi/react';
import { fullThoughtDto, thoughtNodeDto } from '../../api/dto/ThoughtDto';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LocationState } from '../../interfaces/LocationState';
import { useGraphStore } from './GraphStore';
import GraphContainer from './GraphContainer';
import { Localization } from '../../locales/localization';
import { MediaContent } from '../../components/MediaContent';
import { fetchReplies, fetchThought } from '../../api/graphClient';
import { clearNeighborhoodThoughts, getThoughtsOnScreen, updateNeighborhoodThoughts } from './model/temporalThoughtsProvider';

const COLOR_BACKGROUND = 0x020304;

const PUBLIC_FOLDER = import.meta.env.VITE_PUBLIC_FOLDER;

const initialStageSize = { width: window.innerWidth, height: window.innerHeight - 60 };
const landscapeMode = initialStageSize.width > initialStageSize.height;


const GraphPage: React.FC = () => {
    // navigation
    const navigate = useNavigate();
    const [initialHighlightedThoughtId, setInitialHighlightedThoughtId] = useState<number | null | undefined>(undefined);
    const { urlThoughtId } = useParams();

    // data
    const temporalThoughts = useGraphStore((state) => state.temporalRenderedThoughts);
    const neighborhoodThoughts = useGraphStore((state => state.neighborhoodThoughts));

    const [replies, setReplies] = useState<thoughtNodeDto[]>([]);

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

    const [fullHighlightedThought, setfullHighlightedThought] = useState<fullThoughtDto | null>(null);

    const timeShift = useGraphStore((state) => state.timeShift);
    const timeShiftControl = useGraphStore((state) => state.timeShiftControl);
    const setTimeShiftControl = useGraphStore((state) => state.setTimeShiftControl);

    const [newestDate, setNewestDate] = useState<string>('...');//todo localize

    useEffect(() => {
        const visibleThoughts = getThoughtsOnScreen();

        if (visibleThoughts && visibleThoughts.length > 0 && visibleThoughts[visibleThoughts.length - 1].dateCreated) {
            // console.log("allRenderedThoughts: ", temporalThoughts)
            if (timeShift > 0)
            {
                setNewestDate(visibleThoughts[visibleThoughts.length - 1].dateCreated || "...");
            }
            else
            {
                setNewestDate("právě teď...");
            }
        }
    }, [timeShift]);

    // const setMaxThoughtsOnScreen = useGraphStore((state) => state.setMaxThoughtsOnScreen);

    const scrollContainer = useRef<HTMLDivElement>(null);

    // Initialize the graph page
    useEffect(() => {
        const graphState = useGraphStore.getState();

        graphState.setTimeShift(0);
        // set initial highlighted thought
        if (urlThoughtId) {
            const id = parseInt(urlThoughtId);
            if (!isNaN(id)) {
                // console.log('setting initial highlighted thought id', id);
                setInitialHighlightedThoughtId(id);
            }
        }
        else {
            setInitialHighlightedThoughtId(null);
        }
    }, []);

    //handle content fetching when highlighted thought changes
    useEffect(() => {
        if (highlightedThought !== null) {
            fetchThought(highlightedThought.id).then(response => {
                if (response.ok) {
                    setfullHighlightedThought(response.data!);
                    updateNeighborhoodThoughts(highlightedThought.id);
                }
            });

            fetchReplies(highlightedThought.id).then(response => {
                if (response.ok) {
                    setReplies(response.data!);
                }
            });
        } else{
            clearNeighborhoodThoughts();
        }


    }, [highlightedThought]);

    // handle ui changes when highlighted thought changes
    useEffect(() => {

        if (temporalThoughts.length === 0)
            return;
        if (highlightedThought === null) {
            window.history.pushState(null, '', '/graph');
            setStageSize(_ => ({ width: window.innerWidth, height: window.innerHeight - 60 }));
            setOverlayVisible(false);
            return;
        }
        window.history.pushState(null, '', `/graph/${highlightedThought.id}`);

        //set stage size half open
        if (landscapeMode)
            setStageSize({ width: Math.floor(initialStageSize.width / 2), height: initialStageSize.height });
        else
            setStageSize({ width: initialStageSize.width, height: Math.floor(initialStageSize.height / 2) });
        setOverlayVisible(true);
        if (scrollContainer.current) {
            scrollContainer.current.scrollTop = 0;
        }
    }, [highlightedThought]);

    // zooming effect
    useEffect(() => {
        setZoomingControl(zoomingHeld);
    }, [zoomingHeld]);

    // viewport size handler
    useEffect(() => {
        viewport.width = stageSize.width;
        viewport.height = stageSize.height;
    }, [stageSize]);

    // handle overlay controls
    const handleUpButtonOverlay = () => {
        if (fullscreenPreview) {
            setFullscreenPreview(false);
            //set stage size half open
            if (landscapeMode)
                setStageSize({ width: Math.floor(initialStageSize.width / 2), height: initialStageSize.height });
            else
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

    // renders thought content including colorful clickable references
    const renderContentWithReferences = (text: string) => {
        const parts = text.split(/\[([0-9]*?)\]\((.*?)\)/g);
        const result = [];
        for (let i = 0; i < parts.length; i += 3) {
            const id = parseInt(parts[i + 1]);
            result.push(parts[i]);
            result.push(<span
                className='in-text-thought-ref'
                style={{ color: neighborhoodThoughts.find(t => t.id == id)?.color }} key={'link' + i}
                onClick={() => setHighlightedThoughtId(id)}>
                {parts[i + 2]}
            </span>);
        }
        return result;
    }

    return (
        <>
            <div className={
                `overlay ${landscapeMode ? 'overlay-landscape' : 'overlay-portrait'} ${overlayVisible &&
                    highlightedThought !== null
                    ? fullscreenPreview
                        ? landscapeMode
                            ? 'overlay-fullscreen-landscape'
                            : 'overlay-fullscreen-portrait '
                        : landscapeMode
                            ? 'overlay-expanded-landscape'
                            : 'overlay-expanded-portrait'
                    : ''}`
            }>
                {overlayVisible && fullHighlightedThought !== null &&
                    <div className='text-scroll-container' ref={scrollContainer}>
                        <div className='text-flex-container'>
                            <h2>{fullHighlightedThought.title}</h2>
                            <h3>{fullHighlightedThought.author} - {fullHighlightedThought.dateCreated}</h3>
                            {fullHighlightedThought.content && <p className='thought-content'>{renderContentWithReferences(fullHighlightedThought.content)}</p>}
                            <MediaContent id={fullHighlightedThought.id}></MediaContent>
                        </div>
                        {!fullscreenPreview && temporalThoughts.filter(t => t.links.includes(fullHighlightedThought?.id)).length > 0 &&
                            <div className='responses-container-half-screen'>
                                <p className='responses-header'><b>{Localization.Replies}</b></p>
                                <div>
                                    {replies.map(t =>
                                        <span key={`back-link-${t.id}`} className='search-result-item' style={{ borderColor: t.color }}
                                            onClick={_ => setHighlightedThoughtId(t.id)}>{t.title}</span>
                                    )}

{/* TODO -> add dynamic loading of links here. */}

                                    {/* todo - the css here in search-result-item is borrowed from createThought*/}
                                </div>
                            </div>}
                    </div>}
                {fullscreenPreview && highlightedThought !== null && replies.length > 0 &&
                    <>
                        <p><b>{Localization.Replies}</b></p>
                        <div className='responses-container'>
                            {replies.map(t =>
                                <span key={`back-link-${t.id}`} className='search-result-item' style={{ borderColor: t.color }}
                                    onClick={_ => setHighlightedThoughtId(t.id)}>{t.title}</span>
                            )}
                            {/* todo - the css here in search-result-item is borrowed from createThought*/}
                        </div>
                    </>}
                <p className='thought-overlay-button-row'>
                    <button className='button-secondary' onClick={handleUpButtonOverlay}>{landscapeMode && 'X' || '▲'}</button>
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

                    {!fullscreenPreview && !landscapeMode && <button className='button-secondary' onClick={handleDownButtonOverlay}>▼</button>}
                </p>
            </div>

            {/* The visibility: collapse (instead of hidden) here is to not start the graph in the initial position each time its opened again */}
            <div className='graph-bottom-part' style={fullscreenPreview ? { visibility: 'collapse' } : {}}>
                <div className='stage-container'>
                    <Stage className='graph-stage' width={stageSize.width} height={stageSize.height} options={{ backgroundColor: COLOR_BACKGROUND, antialias: true }}>
                        <GraphContainer initialHighlightedThoughtId={initialHighlightedThoughtId}></GraphContainer>
                    </Stage>

                    {(newestDate
                        && (<div className='time-shift-label'>{newestDate}</div>)
                        || <div className='time-shift-label'>0</div>)}

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