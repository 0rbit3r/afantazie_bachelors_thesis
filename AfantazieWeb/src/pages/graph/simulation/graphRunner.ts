import { Application } from 'pixi.js';
import { pull_and_push } from './pullAndPush';
import { initGraphics } from '../view/GraphGraphics';
import { SIMULATION_FRAMES } from '../model/graphConstants';
import { useGraphStore } from '../GraphStore';

export default function runGraph(
    app: Application) {

    const thoughtGrabbed = () => {
        useGraphStore.getState().setFrame(1);
    };

    const renderedThoughts = useGraphStore.getState().renderedThoughts; //after dynamic loading this might need to move to ticker.

    const renderGraph = initGraphics(app, renderedThoughts, thoughtGrabbed);

    app.ticker.add((_) => {
        // handle zoom input from user
        const zoomingControl = useGraphStore.getState().zoomingControl;
        if (zoomingControl !== 0) {
            useGraphStore.getState().viewport.zoomByButtonDelta(zoomingControl);
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
                    useGraphStore.getState().viewport.moveBy({x: dx / 10, y: dy / 10});
                }
            }
        }

        // force simulation
        const frame = useGraphStore.getState().frame;
        if (frame < SIMULATION_FRAMES) {
            pull_and_push();
            useGraphStore.getState().setFrame(frame + 1);
        }

        // render the graph
        renderGraph();
    });
}
