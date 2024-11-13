import { useApp } from '@pixi/react';
import { useEffect } from 'react';
import runGraph from './simulation/graphRunner';
import { RenderedThought } from './model/renderedThought';
import { thoughtDto } from '../../api/dto/ThoughtDto';
import { BASE_RADIUS, INITIAL_POSITIONS_RADIUS, SIM_HEIGHT, SIM_WIDTH } from './model/graphParameters';
import { useGraphStore } from './GraphStore';
import { computeSize } from './simulation/simpleSizeComputer';
import { ThoughtPositionCache } from './model/thoughtPositionCache';

interface GraphRendererProps {
  Thoughts: thoughtDto[];
  initialHighlightedThoughtId: number;
}

const GraphContainer = (props: GraphRendererProps) => {
  let pixiApp = useApp();
  const setHighlightedThoughtId = useGraphStore(state => state.setHighlightedThoughtId);
  const setAllRenderedThoughts = useGraphStore(state => state.setAllRenderedThoughts);
  const allRenderedThoughts = useGraphStore(state => state.allRenderedThoughts);

  useEffect(() => {
    if (props.Thoughts.length === 0) {
      return;
    }

    const storage = localStorage.getItem('thoughts-cache');
    // console.log(storage);

    const cachedPositions: ThoughtPositionCache[] = storage ? JSON.parse(storage) : [];

    const newThoughts = props.Thoughts.map<RenderedThought>(t =>
    ({
      id: t.id, content: t.content, title: t.title, author: t.author, dateCreated: t.dateCreated,
      color: t.color, radius: BASE_RADIUS,
      links: t.links, backlinks: t.backlinks,
      position: { x: 0, y: 0 }, momentum: { x: 0, y: 0 }, forces: { x: 0, y: 0 },
      held: false, highlighted: false
    }));

    computeSize(newThoughts);

    //set position either by cache or by initial positions circle
    let angle = 0;
    newThoughts.forEach(thought => {
      if (props.initialHighlightedThoughtId === thought.id) {
        thought.highlighted = true;
      }

      const cached = cachedPositions.find(c => c.id === thought.id);
      if (cached) {
        thought.position = cached.position;
      }
      else {
        thought.position.x = SIM_WIDTH / 2 + Math.cos(angle) * INITIAL_POSITIONS_RADIUS;
        thought.position.y = SIM_HEIGHT / 2 + Math.sin(angle) * INITIAL_POSITIONS_RADIUS;
      }
      angle += Math.PI * 2 / newThoughts.length;
    });

    setAllRenderedThoughts(newThoughts);
    if (props.initialHighlightedThoughtId !== 0) {
      setHighlightedThoughtId(props.initialHighlightedThoughtId);
    }
  }, [props.Thoughts]);

  useEffect(() => {
    if (allRenderedThoughts.length === 0) {
      return;
    }
    pixiApp.stage.removeChildren();
    runGraph(pixiApp);
  }, [allRenderedThoughts]);

  return (
    <></>
  );
}


export default GraphContainer;