import { thoughtNodeDto } from "../../../api/dto/ThoughtDto";
import { fetchNeighborhoodThoughts, fetchTemporalThoughts } from "../../../api/graphClient";
import { getUserSettings } from "../../../api/UserSettingsApiClient";
import { useGraphStore } from "../GraphStore";
import { computeSize } from "../simulation/simpleSizeComputer";
import { BASE_RADIUS, SIM_WIDTH, INITIAL_POSITIONS_RADIUS, SIM_HEIGHT, MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT } from "./graphParameters";
import { mapDtosToRenderedThoughts, RenderedThought } from "./renderedThought";
import { ThoughtPositionCache } from "./thoughtPositionCache";

// selects and returns thoughts to render and animate or consider highlighting in graph walk
export function getThoughtsOnScreen() {
  const state = useGraphStore.getState();
  const { timeShift, temporalRenderedThoughts, maxThoughtsOnScreen } = state;

  // no neighborhood -> return temporal thoughts
  if (state.neighborhoodThoughts.length === 0) {
    return temporalRenderedThoughts.slice(
      Math.max(temporalRenderedThoughts.length - maxThoughtsOnScreen - timeShift, 0),
      Math.min(temporalRenderedThoughts.length - timeShift, temporalRenderedThoughts.length)
    );
  }

  // neighborhood -> return both temporal and neighborhood thoughts
  // todo - size of neighborhod - what if it is more then maxthoughts?
  return [
    ...state.neighborhoodThoughts,
    ...temporalRenderedThoughts.slice(
      Math.max(temporalRenderedThoughts.length - maxThoughtsOnScreen - timeShift + state.neighborhoodThoughts.length, 0),
      Math.min(temporalRenderedThoughts.length - timeShift, temporalRenderedThoughts.length)
    )];
}
// this function will initialize temporal array either in the latest time window or around a given thought if provided.
export function initializeTemporalThoughts(initialHighligthedId: number | null) {
  // console.log("initializing temporal thoughts with id", id);

  var fetchedThoughts = [] as thoughtNodeDto[];

  const graphState = useGraphStore.getState();

  const fetchAndSetStateAsync = async () => {
    const userSettings = await getUserSettings(); // todo-  move this to a more appropriate location (maybe even in a react context that loads settings on root-ish level?)
    if (userSettings.ok) {
      graphState.setMaxThoughtsOnScreen(userSettings.data?.maxThoughts ?? MAX_THOUGHTS_ON_SCREEN_FOR_LOGGED_OUT);
    }

    const response = await fetchTemporalThoughts({ amount: userSettings.data?.maxThoughts!, aroundThoughtId: initialHighligthedId ?? undefined });
    console.log('fetched thoughts', response);
    if (response.ok) {
      graphState.setTemporalRenderedThoughts(mapDtosToRenderedThoughts(response.data!));
      if (initialHighligthedId && initialHighligthedId !== 0) {
        graphState.setHighlightedThoughtId(initialHighligthedId);
      }
    }
  };
  fetchAndSetStateAsync();

  if (fetchedThoughts.length === 0) {
    return;
  }

  const storage = localStorage.getItem('thoughts-cache');
  // console.log(storage);

  const cachedPositions: ThoughtPositionCache[] = storage ? JSON.parse(storage) : [];

  const newThoughts = fetchedThoughts.map<RenderedThought>(t =>
  ({
    id: t.id, title: t.title,
    color: t.color, radius: BASE_RADIUS, author: t.author,
    links: t.links, backlinks: t.backlinks,
    position: { x: 0, y: 0 }, momentum: { x: 0, y: 0 }, forces: { x: 0, y: 0 },
    held: false, highlighted: false
  }));

  computeSize(newThoughts);

  //set position either by cache or by initial positions circle
  let angle = 0;
  newThoughts.forEach(thought => {
    if (initialHighligthedId === thought.id) {
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

  graphState.setTemporalRenderedThoughts(newThoughts);
  if (initialHighligthedId && initialHighligthedId !== 0) {
    graphState.setHighlightedThoughtId(initialHighligthedId);
  }
}

// if the time window is exceded, this function will fetch new thoughts from api and update the temporal thoughts array
export const updateTemporalThoughts = () => {
  const graphState = useGraphStore.getState();

  const currentTemporalThoughts = graphState.temporalRenderedThoughts;

  if (currentTemporalThoughts.length === 0) {
    return;
  }

  // EITHER - we need the before...
  if (graphState.fetchingTemporalThoughts === false &&
    currentTemporalThoughts[0].id > 1 //this will cause bug if the first thought doesnt' have id 1 but it oh well...
    && graphState.timeShift + graphState.maxThoughtsOnScreen > currentTemporalThoughts.length) {

    // console.log("time shift ", graphState.timeShift);
    // console.log("bounds: ", graphState.temporalBoundIds.low, graphState.temporalBoundIds.high);
    // console.log("left side: ", graphState.timeShift + graphState.maxThoughtsOnScreen );
    // console.log("totalTemporalThoughts", totalTemporalThoughts);
    // console.log("fetchingTemporalThoughts", graphState.fetchingTemporalThoughts);

    graphState.setFetchingTemporalThoughts(true);
    // console.log("time window bound exceded into the past -> Updating temporal thoughts");

    const fetchAndSetStateAsync = async () => {

      const response = await fetchTemporalThoughts({ amount: graphState.maxThoughtsOnScreen * 2, beforeThoughtId: currentTemporalThoughts[0].id });
      // console.log('new thoughts', response);
      if (response.ok) {


        const convertedToRenderedThoughts = mapDtosToRenderedThoughts(response.data!);

        graphState.temporalRenderedThoughts.unshift(...convertedToRenderedThoughts);
        const newRenderedThoughts = graphState.temporalRenderedThoughts;
        graphState.setTemporalBoundIds(newRenderedThoughts[0].id, newRenderedThoughts[newRenderedThoughts.length - 1].id);

        // graphState.setTemporalRenderedThoughts(mapDtosToRenderedThoughts([...convertedToRenderedThoughts, ...currentTemporalThoughts]));
      }
      graphState.setFetchingTemporalThoughts(false);
      // todo: error handling
    };
    fetchAndSetStateAsync();
  }
  // OR we need the after...
  if (graphState.fetchingTemporalThoughts === false
    && graphState.timeShift < 0) {

    graphState.setFetchingTemporalThoughts(true);
    // console.log("time window bound exceded into the future -> Updating temporal thoughts");

    const fetchAndSetStateAsync = async () => {

      const response = await fetchTemporalThoughts({ amount: graphState.maxThoughtsOnScreen * 2, afterThoughtId: currentTemporalThoughts[currentTemporalThoughts.length - 1].id });
      // console.log('new thoughts', response);
      if (response.ok && response.data!.length > 0) {
        const convertedToRenderedThoughts = mapDtosToRenderedThoughts(response.data!);
        graphState.setTimeShift(graphState.timeShift + convertedToRenderedThoughts.length);

        graphState.temporalRenderedThoughts.push(...convertedToRenderedThoughts);
      }
      setTimeout(() => graphState.setFetchingTemporalThoughts(false), 2000); // this might be a hack but it seems to work well...
    }
    fetchAndSetStateAsync();

  }
}

export const clearNeighborhoodThoughts = () => {
  const graphState = useGraphStore.getState();
  graphState.setNeighborhoodThoughts([]);
}

export const updateNeighborhoodThoughts = (thoughtId: number) => {
  const graphState = useGraphStore.getState();

  const fetchAndSetStateAsync = async () => {
    const response = await fetchNeighborhoodThoughts(thoughtId, 3);
    // console.log('neighborhood-thoughts', response);
    const newNeighborhoodThoughts: RenderedThought[] = [];


    if (response.ok) {
      const fetchedThoughts = mapDtosToRenderedThoughts(response.data!);

      fetchedThoughts.forEach(fetchedThought => {
        const foundInTemporal = graphState.temporalRenderedThoughts.find(tt => fetchedThought.id === tt.id);
        const foundInNeighborhood = graphState.neighborhoodThoughts.find(tt => fetchedThought.id === tt.id);
        // if (fetchedThought.id === 439) {
        //   console.log(fetchedThought)
        //   console.log("found in temporal", foundInTemporal)
        //   console.log("found in neighborhood", foundInNeighborhood)
        // }
        if (foundInTemporal) {
          newNeighborhoodThoughts.push(foundInTemporal);
        }
        else if (foundInNeighborhood) {
          newNeighborhoodThoughts.push(foundInNeighborhood);
        }
        else {
          newNeighborhoodThoughts.push(fetchedThought);
        }

      });

      graphState.setNeighborhoodThoughts(newNeighborhoodThoughts.sort((a, b) => a.id - b.id));
    }
  };
  fetchAndSetStateAsync();
}