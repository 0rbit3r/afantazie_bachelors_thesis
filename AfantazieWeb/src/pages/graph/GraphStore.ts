import { create } from 'zustand';
import { Viewport } from './model/Viewport';
import { RenderedThought } from './model/renderedThought';
import { MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT } from './model/graphParameters';

interface GraphStore {
    allRenderedThoughts: RenderedThought[];
    setAllRenderedThoughts: (thoughts: RenderedThought[]) => void;

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

    timeShiftControl: number;
    setTimeShiftControl: (timeShift: number) => void;

    timeShift: number;
    setTimeShift: (timeShift: number) => void;

    maxThoughtsOnScreen: number;
    setMaxThoughtsOnScreen: (value: number) => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
    allRenderedThoughts: [],
    setAllRenderedThoughts: (thoughts: RenderedThought[]) => set({ allRenderedThoughts: thoughts }),

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
        const thought = get().allRenderedThoughts.find((thought) => thought.id === id);
        set({ highlightedThought: thought || null });
        if (thought !== null && thought !== undefined) {
            thought.highlighted = true;
            set({ lockedOnHighlighted: true });

            //handle time shift on highlight
            const allRenderedThoughts = get().allRenderedThoughts;
            const newUnboundedTimeShift = allRenderedThoughts.length - 1 - allRenderedThoughts.indexOf(thought) - Math.floor(get().maxThoughtsOnScreen / 2);
            const newTimeshift = newUnboundedTimeShift < 0
                ? 0
                : newUnboundedTimeShift > get().allRenderedThoughts.length - get().maxThoughtsOnScreen
                    ? get().allRenderedThoughts.length - get().maxThoughtsOnScreen
                    : newUnboundedTimeShift;
            set({ timeShift: newTimeshift });
        }
    },
    setHighlightedThought: (thought: RenderedThought) => {
        const currentlyhighlighted = get().highlightedThought;
        if (currentlyhighlighted !== null)
            currentlyhighlighted.highlighted = false;

        // //handle time shift on highlight
        // const allRenderedThoughts = get().allRenderedThoughts;
        // const newUnboundedTimeShift = allRenderedThoughts.length - 1 - allRenderedThoughts.indexOf(thought) - Math.floor(get().maxThoughtsOnScreen / 2);
        // const newTimeshift = newUnboundedTimeShift < 0
        //     ? 0
        //     : newUnboundedTimeShift > get().allRenderedThoughts.length - get().maxThoughtsOnScreen
        //         ? get().allRenderedThoughts.length - get().maxThoughtsOnScreen
        //         : newUnboundedTimeShift;
        // set({ timeShift: newTimeshift });

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

    timeShiftControl: 0,
    setTimeShiftControl: (timeShiftControl) => set({ timeShiftControl }),
    timeShift: 0,
    setTimeShift: (timeShift) => set({ timeShift }),

    maxThoughtsOnScreen: MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT,
    setMaxThoughtsOnScreen: (value) => set({ maxThoughtsOnScreen: value }),
}));