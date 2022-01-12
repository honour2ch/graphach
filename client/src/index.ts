import cytoscape from "cytoscape"
import * as Utils from './utils'
import threadData from './thread-data'
import {IBoundingBox, IPosition, IPost, IThread} from "./Interfaces";

const dagre = require('cytoscape-dagre')

cytoscape.use( dagre )
const postsContainer = Utils.createPostsContainer()
const cytoscapeContainer = Utils.createCytoscapeContainer()
const data = Utils.convertThreadToGraph(threadData)
const app = cytoscape({
    container: cytoscapeContainer,
    style: [{
        selector: 'node',
        style: {
            // label: 'data(comment)',
            shape: 'rectangle',
            width: '350',
            height: '300',
            'text-wrap': 'wrap',
            'text-max-width': '300',
            'text-halign': 'center',
            'text-valign': 'center'
        }
    }],
    layout: {
        //@ts-ignore
        name: 'dagre',
        nodeSep: '100', // the separation between adjacent nodes in the same rank
        edgeSep: '100', // the separation between adjacent edges in the same rank
        rankSep: '200', // the separation between each rank in the layout
        rankDir: 'TB', // 'TB' for top to bottom flow, 'LR' for left to right,
        ranker: 'network-simplex', // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
        // @ts-ignore
        minLen: function( edge ){ return 1; }, // number of ranks to keep between the source and target of the edge
        // edgeWeight: function( edge ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges
        //
        // // general layout options
        // fit: true, // whether to fit to viewport
        // padding: 30, // fit padding
        // spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
        // animate: false, // whether to transition the node positions
        // animateFilter: function( node, i ){ return true; }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
        // animationDuration: 500, // duration of animation in ms if enabled
        // animationEasing: undefined, // easing of animation if enabled
        // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        // transform: function( node, pos ){ return pos; }, // a function that applies a transform to the final node position
        // ready: function(){}, // on layoutready
        // stop: function(){} // on layoutstop
    },
    elements: data
})

function onNodeClick(e: any) {
    const targetId = e.target.id()

    data.nodes.forEach(node => {
        if (node.data.id === targetId) {
            const answersInfo = Utils.getAnswersInfo(node.data.comment)
        }
    })
}

function onRender() {
    const ext = app.extent()
    const nodesPositions = app
        .nodes()
        .filter(n => {
        // @ts-ignore
        const bb = n.boundingBox()
        return bb.x1 > ext.x1 && bb.x2 < ext.x2 && bb.y1 > ext.y1 && bb.y2 < ext.y2
    })
        .map(item => {
            return {
                data: item.data(),
                // @ts-ignore
                boundBox: item.boundingBox()
            }
        })
    const zoom = app.zoom()
    const postsPositions = Utils.calcBoxPosition(ext, nodesPositions, zoom)

    postsContainer.innerHTML = ''

    postsPositions.forEach((nodeData: any) => {
        const el = document.createElement('div')
        el.className = 'post'
        el.style.width = `${350*zoom}px`
        el.style.height = `${300*zoom}px`
        el.style.position = 'absolute'
        el.style.left = `${nodeData.x}px`
        el.style.top = `${nodeData.y}px`
        el.style.zIndex = '9999'
        el.style.textOverflow = 'ellipsis'
        el.style.overflow = 'hidden'
        el.style.fontSize = 17 * zoom + 'px'

        el.innerHTML = nodeData.data.comment

        postsContainer.appendChild(el)
    })
}

app.on('click', 'node', onNodeClick)

app.on('render', onRender)