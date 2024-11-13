import { useGraphStore } from "../GraphStore";

export function getThoughtsInTimeWindow() {
    const timeShift = useGraphStore.getState().timeShift;
    const allRenderedThoughts = useGraphStore.getState().allRenderedThoughts;
    
    // if (allRenderedThoughts.length < useGraphStore.getState().maxThoughtsOnScreen) {
    //     return allRenderedThoughts;
    // }

    return allRenderedThoughts.slice(
        Math.max(allRenderedThoughts.length - useGraphStore.getState().maxThoughtsOnScreen - timeShift, 0),
        Math.min(allRenderedThoughts.length - timeShift, allRenderedThoughts.length));
}