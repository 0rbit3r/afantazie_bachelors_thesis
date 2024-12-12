import { Application } from 'pixi.js';
import { pull_and_push } from './pullAndPush';
import { initGraphics } from '../view/GraphGraphics';
import { SIMULATION_FRAMES, THOUGHTS_CACHE_FRAME } from '../model/graphParameters';
import { useGraphStore } from '../GraphStore';
import { ThoughtPositionCache } from '../model/thoughtPositionCache';
import { updateTemporalThoughts } from '../model/temporalThoughtsProvider';

export default function runGraph(app: Application) {

    const thoughtGrabbed = () => {
        useGraphStore.getState().setFrame(1);
    };

    const allRenderedThoughts = useGraphStore.getState().temporalRenderedThoughts; //after dynamic loading this might need to move to ticker.

    const renderGraph = initGraphics(app, allRenderedThoughts, thoughtGrabbed);

    useGraphStore.getState().setFrame(0);

    // main apploication loop
    app.ticker.add((_) => {
        // cache thoughts
        if (useGraphStore.getState().frame === THOUGHTS_CACHE_FRAME) {
            // console.log('caching thoughts positions');
            localStorage.removeItem('thoughts-cache');
            // console.log(useGraphStore.getState().allRenderedThoughts);

            localStorage.setItem('thoughts-cache',
                JSON.stringify(useGraphStore.getState()
                    .temporalRenderedThoughts.map<ThoughtPositionCache>(t => ({
                        id: t.id,
                        position: t.position,
                    }))));
        }

        
        // handle zoom input from user
        const zoomingControl = useGraphStore.getState().zoomingControl;
        if (zoomingControl !== 0) {
            useGraphStore.getState().viewport.zoomByButtonDelta(zoomingControl);
        }
        // handle TimeShift  control input from user
        const timeShiftControl = useGraphStore.getState().timeShiftControl;
        const timeShift = useGraphStore.getState().timeShift;
        const maxThoughtsOnScreen = useGraphStore.getState().maxThoughtsOnScreen;
        
        // if live preview - update temporal thoughts
        if (useGraphStore.getState().timeShift <= 0 && useGraphStore.getState().frame > 1 && useGraphStore.getState().frame % 300 === 0) {
            updateTemporalThoughts();
        }
        else if ((timeShiftControl > 0 && timeShift < useGraphStore.getState().temporalRenderedThoughts.length)
            || (timeShiftControl < 0 && timeShift > -maxThoughtsOnScreen)) { //todo check the one
            useGraphStore.getState().setTimeShift(timeShift + timeShiftControl); //todo move this in store
            useGraphStore.getState().setFrame(1);

            updateTemporalThoughts();
        }

        //move the viewport to the highlighted thought
        const lockedOnHighlighted = useGraphStore.getState().lockedOnHighlighted;
        if (lockedOnHighlighted) {
            const highlightedThought = useGraphStore.getState().highlightedThought;
            const viewport = useGraphStore.getState().viewport;
            if (highlightedThought !== null) {
                const dx = viewport.position.x + viewport.width / 2 / viewport.zoom - highlightedThought.position.x;
                const dy = viewport.position.y + viewport.height / 2 / viewport.zoom - highlightedThought.position.y;
                // console.log(dx, dy, lockedOnHighlighted);
                if (Math.abs(dx) > 0.01 && Math.abs(dy) > 0.01) {
                    useGraphStore.getState().viewport.moveBy({ x: dx / 10, y: dy / 10 });
                }
            }
        }

        // force simulation
        const frame = useGraphStore.getState().frame;
        if (frame < SIMULATION_FRAMES) {
            pull_and_push();
        }
        useGraphStore.getState().setFrame(frame + 1);

        // render the graph
        renderGraph();
    });
}
