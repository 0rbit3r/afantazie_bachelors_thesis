import { useGraphStore } from "../GraphStore";
import { pullForce, linksNumberDivisor, pushForce, SIM_HEIGHT, SIM_WIDTH, PUSH_THRESH, MOMENTUM_DAMPENING_RATE, FRAMES_WITH_OVERLAP, SLOW_SIM_EVERY_N_FRAMES } from "../model/graphParameters";
import { RenderedThought } from "../model/renderedThought";

export const get_border_distance = (thought1: RenderedThought, thought2: RenderedThought) => {
    const x1 = thought1.position.x;
    const y1 = thought1.position.y;
    const x2 = thought2.position.x;
    const y2 = thought2.position.y;
    const centerDistance = Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
    const borderDistance = centerDistance - thought1.radius - thought2.radius;
    // if (borderDistance > centerDistance) {
    //     return borderDistance - 
    // }
    
    return borderDistance;
}

const get_center_distance = (thought1: RenderedThought, thought2: RenderedThought) => {
    const x1 = thought1.position.x;
    const y1 = thought1.position.y;
    const x2 = thought2.position.x;
    const y2 = thought2.position.y;
    return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
}

export const pull_and_push = () => {
    const thoughts = useGraphStore.getState().renderedThoughts;

    thoughts.forEach(thought => {
        handleOutOfBounds(thought);

        thoughts.forEach(otherThought => {
            if (thought.id > otherThought.id) { //This relies on the fact that thoughts can only reference older ones...
                const borderDistance = get_border_distance(thought, otherThought);

                if (thought.links.includes(otherThought.id)) {
                    pull_or_push_connected(thought, otherThought);
                } else if (borderDistance < PUSH_THRESH) {
                    push_unconnected(thought, otherThought);
                }
            }
        });
    });

    const frame = useGraphStore.getState().frame;
    thoughts.forEach(thought => {

        if (Math.abs(thought.momentum.x) < Math.abs(thought.forces.x)){
            thought.momentum.x = Math.abs(thought.momentum.x) * Math.sign(thought.forces.x);
        }
        if (Math.abs(thought.momentum.y) < Math.abs(thought.forces.y)){
            thought.momentum.y = Math.abs(thought.momentum.y) * Math.sign(thought.forces.y);
        }

        thought.momentum.x += thought.forces.x;
        thought.momentum.y += thought.forces.y;

        thought.momentum.x /= MOMENTUM_DAMPENING_RATE;
        thought.momentum.y /= MOMENTUM_DAMPENING_RATE;

        // thought.momentum.x = Math.min(thought.momentum.x, MAX_MOMENTUM);
        // thought.momentum.y = Math.min(thought.momentum.y, MAX_MOMENTUM);

        thought.position.x += thought.momentum.x / (Math.floor(frame / SLOW_SIM_EVERY_N_FRAMES) + 1);
        thought.position.y += thought.momentum.y / (Math.floor(frame / SLOW_SIM_EVERY_N_FRAMES) + 1);

        thought.forces.x /= MOMENTUM_DAMPENING_RATE;
        thought.forces.y /= MOMENTUM_DAMPENING_RATE;
    });

}

export const pull_or_push_connected = (sourceThought: RenderedThought, targetThought: RenderedThought) => {
    const dx = targetThought.position.x - sourceThought.position.x;
    const dy = targetThought.position.y - sourceThought.position.y;
    const centerDistance = get_center_distance(sourceThought, targetThought);
    const borderDistance = get_border_distance(sourceThought, targetThought);
    // const borderDistance = get_border_distance(sourceThought, targetThought);
    // if (borderDistance < 0) {
    //     return;
    // }
    const force = pullForce(borderDistance) / linksNumberDivisor(sourceThought.links.length)

    sourceThought.forces.x += sourceThought.held ? 0 : (dx / centerDistance) * force;
    sourceThought.forces.y += sourceThought.held ? 0 : (dy / centerDistance) * force;
    targetThought.forces.x -= targetThought.held ? 0 : (dx / centerDistance) * force;
    targetThought.forces.y -= targetThought.held ? 0 : (dy / centerDistance) * force;
}

export const push_unconnected = (sourceThought: RenderedThought, targetThought: RenderedThought) => {
    const dx = targetThought.position.x - sourceThought.position.x;
    const dy = targetThought.position.y - sourceThought.position.y;
    const centerDistance = get_center_distance(sourceThought, targetThought);
    const borderDistance = get_border_distance(sourceThought, targetThought);

    // const force = borderDistance < 0 && useGraphStore.getState().frame > FRAMES_WITH_OVERLAP
    //     ? -borderDistance
    //     : pushForce(centerDistance);
    // const force = pushForce(centerDistance);
    const force = useGraphStore.getState().frame > FRAMES_WITH_OVERLAP
        ? pushForce(borderDistance)
        : 0;

    sourceThought.forces.x -= sourceThought.held ? 0 : (dx / centerDistance) * force;
    sourceThought.forces.y -= sourceThought.held ? 0 : (dy / centerDistance) * force;
    targetThought.forces.x += targetThought.held ? 0 : (dx / centerDistance) * force;
    targetThought.forces.y += targetThought.held ? 0 : (dy / centerDistance) * force;
}

const handleOutOfBounds = (thought: RenderedThought) => {
    if (thought.position.x < thought.radius * 2.5) {
        thought.position.x = thought.radius * 2.5;
    }
    if (thought.position.x > SIM_WIDTH - thought.radius * 2.5) {
        thought.position.x = SIM_WIDTH - thought.radius * 2.5;
    }
    if (thought.position.y < thought.radius * 2.5) {
        thought.position.y = thought.radius * 2.5;
    }
    if (thought.position.y > SIM_HEIGHT - thought.radius * 2.5) {
        thought.position.y = SIM_HEIGHT - thought.radius * 2.5;
    }
}