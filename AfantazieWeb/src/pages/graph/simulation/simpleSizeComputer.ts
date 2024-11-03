import { MAX_RADIUS, REFERENCE_RADIUS_MULTIPLIER } from "../model/graphConstants";
import { RenderedThought } from "../model/renderedThought"

export const computeSize = (thoughts: RenderedThought[]) => {
    thoughts.forEach(thought => {
        const encounteredAuthors : string[] = []; //string?...
        thought.backlinks.forEach(backlink => {
            const linkingThought = thoughts.find(t => t.id === backlink);
            if (linkingThought && linkingThought.author !== thought.author && !encounteredAuthors.includes(linkingThought.author)) {
                encounteredAuthors.push(linkingThought.author);
                thought.radius = Math.min(thought.radius * REFERENCE_RADIUS_MULTIPLIER, MAX_RADIUS);
            }
        });
    });
     
};