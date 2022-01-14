import cytoscape, {Stylesheet, NodeSingular} from 'cytoscape'
const dagre = require('cytoscape-dagre')
import * as Utils from './utils'
import {IThread} from "./Interfaces";
import {
    NODE_WIDTH,
    NODE_HEIGHT,
    NODE_FONT_SIZE
} from './config'

cytoscape.use( dagre )


const defaultConfig: IAppConfig = {
    postsRenderLimit: 30
}
const cyStyle: Stylesheet[] = [{
    selector: 'node',
    style: {
        'background-color': 'data(color)',
        shape: 'rectangle',
        width: `${NODE_WIDTH}`,
        height: `${NODE_HEIGHT}`,
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
    cytoscapeContainer = document.getElementById('cytoscape_container') as HTMLDivElement
    postsContainer = document.getElementById('posts_container') as HTMLDivElement

    constructor(config?: IAppConfig) {
        this.config = {...defaultConfig, ...config}

        this.cy = cytoscape({
            container: this.cytoscapeContainer,
            style: cyStyle,
            wheelSensitivity: 0.1
        })

        // this.cy.on('mouseover', 'node', this.onNodeMouseOver.bind(this))
        // this.cy.on('mouseout', 'node', this.onNodeMouseout.bind(this))
        this.cy.on('render', this.onRender.bind(this))

        // @ts-ignore
        window.loadThread = this.loadData.bind(this)
    }

    private async loadData(board: string, thread: number) {
        this.cy.elements().remove()
        const threadData = await this.loadThreadData(board, thread)
        const preparedData = Utils.convertThreadToGraph(threadData)
        this.cy.add(preparedData)
        this.cy.layout(cyLayout).run()
    }

    private onRender() {
        this.removePosts()

        const visibleNodes = this.getVisibleNodes(true)
        let posts = ''
        const zoom = this.cy.zoom()

        if (visibleNodes.length > this.config.postsRenderLimit || zoom < 0.17) { return }

        visibleNodes.forEach((nodeData: any) => {
            posts += this.createPostContainer(nodeData)
        })

        this.postsContainer.innerHTML = posts
    }

    private getVisibleNodes(normalizePositionData = false) {
        const ext = this.cy.extent()
        const zoom = this.cy.zoom()
        const dirtyResult = this.cy
            .nodes()
            .filter(n => {
                const bb = n.boundingBox({})
                return bb.x1 > ext.x1 - NODE_WIDTH
                    && bb.x2 < ext.x2 + NODE_WIDTH
                    && bb.y1 > ext.y1 - NODE_HEIGHT
                    && bb.y2 < ext.y2 + NODE_HEIGHT
            })
            .map(item => {
                return {
                    data: item.data(),
                    boundBox: item.boundingBox({})
                }
            })

        return normalizePositionData ? Utils.calcBoxPosition(ext, dirtyResult, zoom) : dirtyResult
    }

    private createPostContainer(nodeData: any): string {
        const zoom = this.cy.zoom()
        const width = NODE_WIDTH * zoom
        const height = NODE_HEIGHT * zoom
        const {x, y} = nodeData
        const fontSize = NODE_FONT_SIZE * zoom

        return Utils.createPostContainer(nodeData.data.comment, width, height, x, y, fontSize)
    }

    private removePosts() {
        this.postsContainer.innerHTML = ''
    }

    private loadThreadData(board: string, thread: number): Promise<IThread> {
        return fetch(`/api/${board}/res/${thread}.json`)
            .then((response) => response.json())
    }

    private getChildNodes(node: NodeSingular) {

    }
}

export interface IAppConfig {
    postsRenderLimit: number
}