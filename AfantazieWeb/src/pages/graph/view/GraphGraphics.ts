import { Application, Color, Container, Graphics } from "pixi.js";
import { ARROW_Z, NODES_Z, TEXT_Z } from "./zIndexes";
import { BASE_EDGE_ALPHA, BASE_EDGE_WIDTH, HIGHLIGHTED_EDGE_ALPHA, HIGHLIGHTED_EDGE_WIDTH, SIM_HEIGHT, SIM_WIDTH, UNHIGHLIGHTED_EDGE_ALPHA, UNHIGHLIGHTED_EDGE_WIDTH } from "../model/graphParameters";
import { RenderedThought } from "../model/renderedThought";
import { addDraggableViewport } from "./ViewportInitializer";
import { XAndY } from "../model/xAndY";
import tinycolor from "tinycolor2";
import { useGraphStore } from "../GraphStore";
import { getThoughtsInTimeWindow } from "../model/temporalThoughtsProvider";


const DRAG_TIME_THRESHOLD = 200;

export const initGraphics = (
    app: Application, renderedThoughts: RenderedThought[],
    thoughtGrabbed: () => void) => {

    app.stage.eventMode = 'static';

    const zSortedContainer = new Container();
    zSortedContainer.sortableChildren = true;
    app.stage.addChild(zSortedContainer);

    const nodeContainer = new Graphics();

    const viewport = addDraggableViewport(app, zSortedContainer);

    useGraphStore.getState().viewport = viewport;

    // nodeGraphics.sortableChildren = true;
    nodeContainer.zIndex = NODES_Z;

    zSortedContainer.addChild(nodeContainer);

    const textContainer = new Container();
    textContainer.zIndex = TEXT_Z;

    zSortedContainer.addChild(textContainer);

    // prepare elements

    renderedThoughts.forEach(thought => {
        const circle = new Graphics();
        thought.graphics = circle;

        //interactivity
        circle.eventMode = 'static';
        circle.cursor = 'pointer';

        // circle.on('click', e => {
        //     if (e)
        //     thoughtClicked(thought.id);
        // });
        // circle.on('tap', () => {
        //     setTimeout(() => { //Timeout to prevent overlay from registring the click too.
        //         thoughtClicked(thought.id);
        //     }, 10);
        // });

        let holdStartTime = 0;

        circle.on('globalpointermove', e => {
            if (thought.held) {
                thought.position.x += e.movementX / viewport.zoom;
                thought.position.y += e.movementY / viewport.zoom;
            }
        });

        circle.on('pointerdown', () => {
            thoughtGrabbed();
            thought.held = true;
            holdStartTime = performance.now();
        });

        circle.on('wheel', (e) => {
            viewport.zoomByWheelDelta(-e.deltaY);
        });

        app.stage.on('pointerup', () => {
            if (thought.held && performance.now() - holdStartTime < DRAG_TIME_THRESHOLD) {
                // setTimeout(() => thoughtClicked(thought.id), 30); //timeout to prevent overlay from registering the click too
                useGraphStore.getState().setHighlightedThought(thought);
            }
            thought.held = false;
            viewport.dragged = false;
        });

        nodeContainer.addChild(circle);

        // const style = new TextStyle({
        //     breakWords: false,
        //     wordWrap: true,
        //     fontFamily: 'Arial',
        //     fontSize: 13,
        //     fontWeight: 'bold',
        //     fill: 'white',
        //     wordWrapWidth: thought.radius * 4,
        //     stroke: "#000000",
        //     strokeThickness: 3,
        //     // dropShadow: true,
        //     // dropShadowDistance: 2,
        // });

        // const text = new Text(thought.title, style);
        // text.zIndex = TEXT_Z;
        // text.x = thought.position.x - text.width / 2;
        // text.y = thought.position.y - text.height / 2 + text.height / 2 + BASE_RADIUS + 5;
        // thought.text = text;

        // textContainer.addChild(text);
    });

    // let lastZoom = 1;                                    BIG TODO BIG TODO BIG TODO BIG TODO BIG TODO - UNCOMMENT THIS
    const renderGraph = () => {

        const thoughtsInCurrentTimeWindow = getThoughtsInTimeWindow();

        const graphStore = useGraphStore.getState();
        nodeContainer.clear();
        nodeContainer.children.forEach(child => {
            if (child instanceof Graphics) {
                child.clear();
            }
        });

        // nodes
        thoughtsInCurrentTimeWindow.forEach(thought => {
            
            const circle = thought.graphics as Graphics;
            circle.clear();

            const circleCoors = graphStore.viewport.toViewportCoordinates({ x: thought.position.x, y: thought.position.y });
            if (circleCoors.x < -thought.radius || circleCoors.x > graphStore.viewport.width + thought.radius
                || circleCoors.y < -thought.radius || circleCoors.y > graphStore.viewport.height + thought.radius) {
                return;
            }

            // draw node
            circle.beginFill(thought.color, 1);
            circle.lineStyle(8 * graphStore.viewport.zoom, tinycolor(thought.color).lighten(15).toString(), 0.5);
            circle.drawCircle(circleCoors.x, circleCoors.y, graphStore.viewport.zoom * thought.radius);
            circle.endFill();

            // muffins!
            // if (thought.id == 318 || thought.id == 1) {
            //     (async () => {
            //         const muffinSvg = await Assets.load(import.meta.env.VITE_PUBLIC_FOLDER + '/icons/muffin.svg');
            //         const muffinTexture = new Sprite(muffinSvg as Texture);;
            //         muffinTexture.width = (thought.radius * 2) * viewport.zoom;
            //         muffinTexture.height = (thought.radius * 2) * viewport.zoom;
            //         muffinTexture.position.set((circleCoors.x - muffinTexture.width/2), (circleCoors.y - muffinTexture.height/2));  
            //         muffinTexture.interactive = false;

            //         circle.removeChildren();
            //         circle.addChild(muffinTexture);
            //     })();
            // }

            if (thought.highlighted) {
                circle.lineStyle(6, "#ffffff", 0.4);
                circle.drawCircle(circleCoors.x, circleCoors.y, graphStore.viewport.zoom * thought.radius + 6);
            }

            circle.lineStyle(0);
            circle.beginFill("#000000", 0.001);//this is here only to make the hit area bigger
            circle.drawCircle(circleCoors.x, circleCoors.y, graphStore.viewport.zoom * thought.radius + 10);
            circle.endFill();

            // const text = thought.text as Text; UNCOMMENT BIG TODO ABOVE AND BELLOW
            // if (graphStore.viewport.zoom > ZOOM_TEXT_VISIBLE_THRESHOLD) {

            //     const textCoors = graphStore.viewport.toViewportCoordinates({
            //         x: thought.position.x,
            //         y: thought.position.y + thought.radius + 5
            //     });
            //     textCoors.x -= text.width / 2;
            //     text.x = textCoors.x;
            //     text.y = textCoors.y;

            //     if (lastZoom <= ZOOM_TEXT_VISIBLE_THRESHOLD) {
            //         textContainer.addChild(text);
            //     }
            // }
            // else if (lastZoom > ZOOM_TEXT_VISIBLE_THRESHOLD) {
            //     textContainer.removeChild(text);
            // }
        });

        // edges
        thoughtsInCurrentTimeWindow.forEach(thought => {
            const highlightedThought = useGraphStore.getState().highlightedThought;

            thought.links.forEach(referencedThoughtId => {
                const referencedThought = thoughtsInCurrentTimeWindow.filter(t => t.id == referencedThoughtId)[0];
                // handle dynamic edge appearance based on highlighted thought
                if (referencedThought) {
                    // const arrowColor = highlightedThought === null
                    //     ? referencedThought.color
                    //     : highlightedThought === thought || highlightedThought === referencedThought
                    //         ? tinycolor(referencedThought.color).lighten(5).toString()
                    //         : tinycolor(referencedThought.color).darken(10).toString();
                    const arrowColor = referencedThought.color;
                    const arrowThickness = highlightedThought === null
                        ? BASE_EDGE_WIDTH
                        : highlightedThought === thought || highlightedThought === referencedThought
                            ? HIGHLIGHTED_EDGE_WIDTH
                            : UNHIGHLIGHTED_EDGE_WIDTH;
                    const arrowAlpha = highlightedThought === null
                        ? BASE_EDGE_ALPHA
                        : highlightedThought === thought || highlightedThought === referencedThought
                            ? HIGHLIGHTED_EDGE_ALPHA
                            : UNHIGHLIGHTED_EDGE_ALPHA;
                    draw_edge(
                        nodeContainer,
                        graphStore.viewport.toViewportCoordinates({ x: referencedThought.position.x, y: referencedThought.position.y }),
                        graphStore.viewport.toViewportCoordinates({ x: thought.position.x, y: thought.position.y }),
                        arrowColor, graphStore.viewport.zoom, thought.radius, arrowThickness, arrowAlpha);
                }
            });

        });

        // boundaries
        nodeContainer.lineStyle(2, "#400000", 1);
        nodeContainer.drawRect(
            graphStore.viewport.toViewportCoordinates({ x: 0, y: 0 }).x,
            graphStore.viewport.toViewportCoordinates({ x: 0, y: 0 }).y,
            SIM_WIDTH * graphStore.viewport.zoom,
            SIM_HEIGHT * graphStore.viewport.zoom

        );
        // lastZoom = graphStore.viewport.zoom;   BIG TODO BIG TODO BIG TODO BIG TODO BIG TODO - UNCOMMENT THIS 
    };

    renderGraph();

    return renderGraph;
};

const draw_edge = (
    graphics: Graphics,
    from: XAndY,
    to: XAndY,
    color: string,
    zoom: number,
    targetThoughtRadius: number,
    thickness = 1,
    alpha = 1
) => {
    const x1 = from.x;
    const y1 = from.y;
    const x2 = to.x;
    const y2 = to.y;

    // Arrowhead properties
    const arrowLength = 50 * zoom;
    const arrowAngle = Math.PI / 5;

    // Calculate the angle of the arrow line
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Calculate the position where the arrow should end (radius distance from (x2, y2))
    const arrowTipX = x2 - targetThoughtRadius * zoom * Math.cos(angle);
    const arrowTipY = y2 - targetThoughtRadius * zoom * Math.sin(angle);

    // Draw the main line (shaft of the arrow) ending at (arrowTipX, arrowTipY)

    graphics.moveTo(x1, y1);

    graphics.zIndex = ARROW_Z;
    graphics.lineStyle({ color: new Color(color), width: zoom * thickness, alpha: alpha });

    const normal = { x: y1 - y2, y: x2 - x1 };
    const bezier1 = { x: x1 - ((x1 - arrowTipX) / 3) + normal.x * 0.1, y: y1 - ((y1 - arrowTipY) / 3) + normal.y * 0.1 };
    const bezier2 = { x: x1 - ((x1 - arrowTipX) * 2 / 3), y: y1 - ((y1 - arrowTipY) * 2 / 3) };
    graphics.bezierCurveTo(bezier1.x, bezier1.y, bezier2.x, bezier2.y, arrowTipX, arrowTipY);


    // graphics.lineTo(arrowTipX, arrowTipY);
    // graphics.beginFill();

    // Calculate the positions of the arrowhead lines
    const arrowX1 = arrowTipX - arrowLength * Math.cos(angle - arrowAngle);
    const arrowY1 = arrowTipY - arrowLength * Math.sin(angle - arrowAngle);

    const arrowX2 = arrowTipX - arrowLength * Math.cos(angle + arrowAngle);
    const arrowY2 = arrowTipY - arrowLength * Math.sin(angle + arrowAngle);

    // Draw the left arrowhead line
    graphics.moveTo(arrowTipX, arrowTipY);
    graphics.lineTo(arrowX1, arrowY1);

    // Draw the right arrowhead line
    graphics.moveTo(arrowTipX, arrowTipY);
    graphics.lineTo(arrowX2, arrowY2);
};
