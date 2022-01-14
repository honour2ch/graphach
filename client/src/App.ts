import cytoscape, {Stylesheet} from 'cytoscape'
import * as Utils from './utils'
import {IThread} from "./Interfaces";
const dagre = require('cytoscape-dagre')

cytoscape.use( dagre )


const defaultConfig: IAppConfig = {
    postsRenderLimit: 30
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
    cytoscapeContainer = document.getElementById('cytoscape_container') as HTMLDivElement
    postsContainer = document.getElementById('posts_container') as HTMLDivElement

    constructor(config?: IAppConfig) {
        this.config = {...defaultConfig, ...config}

        this.cy = cytoscape({
            container: this.cytoscapeContainer,
            style: cyStyle,
            wheelSensitivity: 0.1
        })

        this.cy.on('click', 'node', this.onNodeClick.bind(this))
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

        if (visibleNodes.length > this.config.postsRenderLimit) { return }

        visibleNodes.forEach((nodeData: any) => {
            posts += this.createPostContainer(nodeData)
        })

        this.postsContainer.innerHTML = posts
    }

    private onNodeClick(e: any) {
        const targetId = e.target.id()

        // this.data.nodes.forEach(node => {
        //     if (node.data.id === targetId) {
        //         const answersInfo = Utils.getAnswersInfo(node.data.comment)
        //     }
        // })
    }

    private getVisibleNodes(normalizePositionData = false) {
        const ext = this.cy.extent()
        const zoom = this.cy.zoom()
        const dirtyResult = this.cy
            .nodes()
            .filter(n => {
                const bb = n.boundingBox({})
                return bb.x1 > ext.x1 && bb.x2 < ext.x2 && bb.y1 > ext.y1 && bb.y2 < ext.y2
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
        const width = 350*zoom
        const height = 300*zoom
        const {x, y} = nodeData
        const fontSize = 17 * zoom

        return Utils.createPostContainer(nodeData.data.comment, width, height, x, y, fontSize)
    }

    private removePosts() {
        this.postsContainer.innerHTML = ''
    }

    private loadThreadData(board: string, thread: number): Promise<IThread> {
        return fetch(`/api/${board}/res/${thread}.json`)
            .then((response) => response.json())
    }
}

export interface IAppConfig {
    postsRenderLimit: number
}