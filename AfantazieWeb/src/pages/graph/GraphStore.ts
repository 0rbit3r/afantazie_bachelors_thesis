import { create } from 'zustand';
import { Viewport } from './model/Viewport';
import { RenderedThought } from './model/renderedThought';
import { MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT } from './model/graphParameters';

interface GraphStore {
    // Temporal thoughts are thoughts viewed using time slider
    temporalRenderedThoughts: RenderedThought[];
    setTemporalRenderedThoughts: (thoughts: RenderedThought[]) => void;

    //Flag to indicate whether the app is fetching temporal thoughts from API (to prevent from multiple calls)
    fetchingTemporalThoughts: boolean;
    setFetchingTemporalThoughts: (value: boolean) => void;
    // contains lowest and highest thought id present in the temporalRenderedThoughts
    temporalBoundIds: { low: number, high: number };
    setTemporalBoundIds: (low: number, high: number) => void; 

    // Neighborhood thoughts are thoughts that are in the neighborhood of the highlighted thought
    neighborhoodThoughts: RenderedThought[];
    setNeighborhoodThoughts: (thoughts: RenderedThought[]) => void;

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
    temporalRenderedThoughts: [],
    setTemporalRenderedThoughts: (thoughts: RenderedThought[]) => {
        set({ temporalRenderedThoughts: thoughts });
        set({ temporalBoundIds: { low: thoughts[0].id, high: thoughts[thoughts.length - 1].id } });
    },

    fetchingTemporalThoughts: false,
    setFetchingTemporalThoughts: (value: boolean) => set({ fetchingTemporalThoughts: value }),

    temporalBoundIds: { low: 0, high: 0 },
    setTemporalBoundIds: (low: number, high: number) => set({ temporalBoundIds: { low, high } }),

    neighborhoodThoughts: [],
    setNeighborhoodThoughts: (thoughts: RenderedThought[]) => set({ neighborhoodThoughts: thoughts }),

    viewport: new Viewport(0, 0),
    setViewport: (viewport: Viewport) => set({ viewport }),
    lockedOnHighlighted: false,
    freeLockOnHighlighted: () => set({ lockedOnHighlighted: false }),

    zoomingControl: 0,
    setZoomingControl: (value: number) => set({ zoomingControl: value }),

    highlightedThought: null,
    // this is used for graph walk - the function expects the thought with the id be present in neighborhood thoughts
    setHighlightedThoughtId: (id) => {
        const currentlyhighlighted = get().highlightedThought;
        if (currentlyhighlighted !== null)
            currentlyhighlighted.highlighted = false;
        if (id === 0) {
            set({ highlightedThought: null });
            return;
        }
        const newlyHighlightedThought = get().neighborhoodThoughts.find((thought) => thought.id === id);

        set({ highlightedThought: newlyHighlightedThought || null });
        if (newlyHighlightedThought !== null && newlyHighlightedThought !== undefined) {
            newlyHighlightedThought.highlighted = true;
            set({ lockedOnHighlighted: true });

            //handle time shift on highlight
            const allRenderedThoughts = get().temporalRenderedThoughts;
            const newUnboundedTimeShift = allRenderedThoughts.length - 1 - allRenderedThoughts.indexOf(newlyHighlightedThought) - Math.floor(get().maxThoughtsOnScreen / 2);
            const newTimeshift = newUnboundedTimeShift < 0
                ? 0
                : newUnboundedTimeShift > get().temporalRenderedThoughts.length - get().maxThoughtsOnScreen
                    ? get().temporalRenderedThoughts.length - get().maxThoughtsOnScreen
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