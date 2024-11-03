import { create } from 'zustand';
import { Viewport } from './model/Viewport';
import { RenderedThought } from './model/renderedThought';

interface GraphStore {
    renderedThoughts: RenderedThought[];
    setRenderedThoughts: (thoughts: RenderedThought[]) => void;

    viewport: Viewport;
    setViewport: (viewport: Viewport) => void;
    lockedOnHighlighted: boolean;
    freeLockOnHighlighted: () => void;

    zoomingControl: number;
    setZoomingControl: (value: number) => void;

    highlightedThought: RenderedThought | null;
    setHighlightedThoughtId: (id: number) => void;
    setHighlightedThought: (thought: RenderedThought) => void;
    unsetHighlightedThought: () => void;

    frame: number;
    setFrame: (frame: number) => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
    renderedThoughts: [],
    setRenderedThoughts: (thoughts: RenderedThought[]) => set({ renderedThoughts: thoughts }),

    viewport: new Viewport(0, 0),
    setViewport: (viewport: Viewport) => set({ viewport }),
    lockedOnHighlighted: false,
    freeLockOnHighlighted: () => set({ lockedOnHighlighted: false }),
    
    zoomingControl: 0,
    setZoomingControl: (value: number) => set({ zoomingControl: value }),
    
    highlightedThought: null,
    setHighlightedThoughtId: (id) => {
        const currentlyhighlighted = get().highlightedThought;
        if (currentlyhighlighted !== null)
            currentlyhighlighted.highlighted = false;
        if (id === 0) {
            set({ highlightedThought: null });
            return;
        }
        const thought = get().renderedThoughts.find((thought) => thought.id === id);
        set({ highlightedThought: thought || null });
        if (thought !== null && thought !== undefined){
            thought.highlighted = true;
            set({ lockedOnHighlighted: true });
        }
    },
    setHighlightedThought: (thought: RenderedThought) => {
        const currentlyhighlighted = get().highlightedThought;
        if (currentlyhighlighted !== null)
            currentlyhighlighted.highlighted = false;
        
        set({ highlightedThought: thought });
        set({ lockedOnHighlighted: true });
        thought.highlighted = true;
    },
    unsetHighlightedThought: () => {
        const currentlyhighlighted = get().highlightedThought;
        if (currentlyhighlighted !== null)
            currentlyhighlighted.highlighted = false;
        set({ highlightedThought: null });
        set({ lockedOnHighlighted: false });
    },

    frame: 0,
    setFrame: (frame) => set({ frame }),
}));