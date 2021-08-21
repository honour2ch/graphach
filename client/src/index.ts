import cytoscape from "cytoscape"
import * as utils from './utils'

cytoscape({
    container: utils.createCytoscapeContainer(),
    layout: {
        name: 'concentric',
        concentric: function(n: any){ return n.id() === 'j' ? 200 : 0; },
        levelWidth: function(){ return 100; },
        minNodeSpacing: 100
    },
    elements: {
        nodes: [
            { data: { id: 'j', name: 'Jerry' } },
            { data: { id: 'e', name: 'Elaine' } },
            { data: { id: 'k', name: 'Kramer' } },
            { data: { id: 'g', name: 'George' } }
        ],
        edges: [
            { data: { source: 'j', target: 'e' } },
            { data: { source: 'j', target: 'k' } },
            { data: { source: 'j', target: 'g' } },
            { data: { source: 'e', target: 'j' } },
            { data: { source: 'e', target: 'k' } },
            { data: { source: 'k', target: 'j' } },
            { data: { source: 'k', target: 'e' } },
            { data: { source: 'k', target: 'g' } },
            { data: { source: 'g', target: 'j' } }
        ]
    }
})