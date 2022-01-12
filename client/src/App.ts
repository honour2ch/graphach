import cytoscape, {Stylesheet} from 'cytoscape'
import * as Utils from './utils'
import threadData from './thread-data'
const dagre = require('cytoscape-dagre')

cytoscape.use( dagre )


const defaultConfig: IAppConfig = {
    postsRenderLimit: 20
}
const cyStyle: Stylesheet[] = [{
    selector: 'node',
    style: {
        shape: 'rectangle',
        width: '350',
        height: '300',
        'text-wrap': 'wrap',
        'text-max-width': '300',
        'text-halign': 'center',
        'text-valign': 'center'
    }
}]
const cyLayout = {
    name: 'dagre',
    nodeSep: '100', // the separation between adjacent nodes in the same rank
    edgeSep: '100', // the separation between adjacent edges in the same rank
    rankSep: '200', // the separation between each rank in the layout
    rankDir: 'TB', // 'TB' for top to bottom flow, 'LR' for left to right,
    ranker: 'network-simplex', // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
    minLen: function( edge: any ){ return 1; }, // number of ranks to keep between the source and target of the edge
    nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
}

export default class App {
    config: IAppConfig
    cy: cytoscape.Core
    cytoscapeContainer = Utils.createCytoscapeContainer()
    postsContainer = Utils.createPostsContainer()
    data = Utils.convertThreadToGraph(threadData)

    constructor(config?: IAppConfig) {
        this.config = {...defaultConfig, ...config}

        document.body.appendChild(this.cytoscapeContainer)
        document.body.appendChild(this.postsContainer)

        this.cy = cytoscape({
            container: this.cytoscapeContainer,
            style: cyStyle,
        })

        this.loadData()

        this.cy.on('click', 'node', this.onNodeClick.bind(this))
        this.cy.on('render', this.onRender.bind(this))
    }

    loadData() {
        this.cy.elements().remove()
        this.cy.add(this.data)
        this.cy.layout(cyLayout).run()
    }

    private onRender() {
        const ext = this.cy.extent()
        const nodesPositions = this.cy
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
        const zoom = this.cy.zoom()

        this.postsContainer.innerHTML = ''
        if (nodesPositions.length > this.config.postsRenderLimit) { return }

        const postsPositions = Utils.calcBoxPosition(ext, nodesPositions, zoom)

        postsPositions.forEach((nodeData: any) => {
            const width = 350*zoom
            const height = 300*zoom
            const {x, y} = nodeData
            const fontSize = 17 * zoom
            const postContainer = Utils.createPostContainer(nodeData.data.comment, width, height, x, y, fontSize)

            this.postsContainer.appendChild(postContainer)
        })
    }

    private onNodeClick(e: any) {
        const targetId = e.target.id()

        this.data.nodes.forEach(node => {
            if (node.data.id === targetId) {
                const answersInfo = Utils.getAnswersInfo(node.data.comment)
            }
        })
    }
}

export interface IAppConfig {
    postsRenderLimit: number
}