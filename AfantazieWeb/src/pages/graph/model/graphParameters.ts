export const MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT = 100;

// simulation container
export const SIM_WIDTH = 30000;
export const SIM_HEIGHT = 30000;

// simulation progress
export const SIMULATION_FRAMES = 10000;
export const SLOW_SIM_EVERY_N_FRAMES = 3000;
export const FRAMES_WITH_OVERLAP = 0;

export const THOUGHTS_CACHE_FRAME = 1000;

// size and positions of nodes
export const BASE_RADIUS = 50;
export const REFERENCE_RADIUS_MULTIPLIER = 1.3;
export const MAX_RADIUS = 700;

export const INITIAL_POSITIONS_RADIUS = 3000;

// forces simulation
export const IDEAL_LINKED_DISTANCE = 300;
export const EDGE_COMPRESSIBILITY_FACTOR = 1.5;
export const MAX_PULL_FORCE = 100;

export const PUSH_THRESH = 1000;
export const MAX_PUSH_FORCE = 100;

export const GRAVITY_FREE_RADIUS = 1600;

export const FRAMES_WITH_LESS_INFLUENCE = 100;

export const MOMENTUM_DAMPENING_RATE = 1.55; //1.55

export const MAX_MOVEMENT_SPEED = 50;

// Mass allows unsymetric forces based on radius
export const NODE_MASS_ON = true;
export const MAX_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER = 1.1;
export const MIN_MASS_DIFFERENCE_PULL_FORCE_MULTIPLIER = 0.9;
export const MAX_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER = 10;
export const MIN_MASS_DIFFERENCE_PUSH_FORCE_MULTIPLIER = 0.9;

//edges appearance
export const BASE_EDGE_WIDTH = 9;
export const BASE_EDGE_ALPHA = 0.8;

export const HIGHLIGHTED_EDGE_WIDTH = 14;
export const HIGHLIGHTED_EDGE_ALPHA = 1;

export const UNHIGHLIGHTED_EDGE_WIDTH = 4;
export const UNHIGHLIGHTED_EDGE_ALPHA = 0.6;

// zoom
export const MAX_ZOOM = 5;
export const MIN_ZOOM = 0.01;
export const INITIAL_ZOOM = 0.1;
export const ZOOM_TEXT_VISIBLE_THRESHOLD = 0.3;
export const ZOOM_STEP_MULTIPLICATOR_WHEEL = 1.04;
export const ZOOM_STEP_MULTIPLICATOR_BUTTONS = 1.02;


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

export const gravityForce = (centerDistance: number) => {
    const GRAVITY_FORCE = 0.00005;

    if (centerDistance > GRAVITY_FREE_RADIUS) {
        return GRAVITY_FORCE * (centerDistance - GRAVITY_FREE_RADIUS);
    }
    else {
        return 0;
    }
}

// Makes bigger thoughts less active and thus reduces jitter after loading them
export const backlinksNumberForceDivisor = (bl: number) => bl < 2 ? 1 : bl / 3;

