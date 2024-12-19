import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import './App.css';
import { NODE_DATA } from './Data';

function App() {
  const cyRef = useRef(null); // Create a ref for the container div

  useEffect(() => {
    const n = 10;
    const elements = Array.from(Array(n).keys()).map(i => ({data: {id: 'n'+i} }));
    const edges = Array.from(Array(n-1).keys()).map(i => ({ data: {id: 'e'+i, source: 'n'+i, target: 'n'+(i+1) }}));
    elements.push(...edges);
    const cy = cytoscape({
      container: cyRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            label: 'data(id)',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: {
        name: 'grid',
        fit: true, // Fit the graph into the container
      },
    });
  
    // Explicitly center and fit the graph
    cy.fit();
  
    return () => {
      if (cy) cy.destroy();
    };
  }, []);
  

  return (
    <div className="App">
      {/* Cytoscape container */}
      <div ref={cyRef} style={{ width: '600px', height: '400px', border: '1px solid black' }}></div>
    </div>
  );
}

export default App;
