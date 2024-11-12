export const BASE_RADIUS = 19;
export const REFERENCE_RADIUS_MULTIPLIER = 1.5;

export const MAX_RADIUS = 400;

export const IDEAL_LINKED_DISTANCE = 100;
export const EDGE_COMPRESSIBILITY_FACTOR = 3;
export const PUSH_THRESH = 1500;

export const MOMENTUM_DAMPENING_RATE = 1.8;
export const MAX_PULL_FORCE = 100;
export const MAX_PUSH_FORCE = 100;

export const SIMULATION_FRAMES = 10000;
export const SLOW_SIM_EVERY_N_FRAMES = 3000;
export const FRAMES_WITH_OVERLAP = 0;

export const SIM_WIDTH = 13000;
export const SIM_HEIGHT = 13000;

export const MAX_ZOOM = 2;
export const MIN_ZOOM = 0.01;
export const INITIAL_ZOOM = 0.1;
export const ZOOM_TEXT_VISIBLE_THRESHOLD = 0.3;
export const ZOOM_STEP_MULTIPLICATOR_WHEEL = 1.04;
export const ZOOM_STEP_MULTIPLICATOR_BUTTONS = 1.01;

export const INITIAL_POSITIONS_RADIUS = 2000;

// export const pushForce = (centerDistance: number) => {
//     return 1 / Math.sqrt(centerDistance);
// };

// export const pullForce = (centerDistance: number) => {
//     return 0.005 * (centerDistance - PULL_THRESH);
// };
export const pushForce = (borderDist: number) => {
    
    if (borderDist === 0) {
        return 0;
    }
    if (borderDist < 0) {
        return -borderDist;
    }
    const computed = 5 / Math.sqrt(borderDist);
    return Math.min(MAX_PUSH_FORCE, computed);
};

export const pullForce = (borderDist: number) => {

    if (borderDist <= 0) {
        return borderDist; // todo when borderDist is negative the nodes tend to "oscilate"
    }

    const computed = 0.01 * (borderDist - IDEAL_LINKED_DISTANCE);
    const limited = computed > MAX_PULL_FORCE
        ? MAX_PULL_FORCE
        : computed < -MAX_PULL_FORCE
            ? -MAX_PULL_FORCE
            : computed;
    
    const final = Math.sign(limited) === -1
        ? limited / EDGE_COMPRESSIBILITY_FACTOR
        : limited;

    return final;
};

export const linksNumberDivisor = (_: number) => 1;

