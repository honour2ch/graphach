import {uniqBy, template, templateSettings, random} from 'lodash'
import {v4 as UUID} from "uuid"
import chroma from "chroma-js";
import cytoscape, {EdgeDefinition, ElementDefinition} from "cytoscape";
import {IAnswerInfo, IBoundingBox, IPost, IThread} from "./Interfaces";

templateSettings.interpolate = /\{\{([\s\S]+?)\}\}/g;

export function createPostContainer(comment: string, width: number, height: number, left: number, top: number, fontSize: number): string {
    const postTemplate = template(`
        <div 
                class="post post_type_reply"
                style="width: {{width}}px; height: {{height}}px; left: {{left}}px; top: {{top}}px; font-size: {{fontSize}}px"
            >
            <article class="post__message">{{comment}}</article>
        </div>
    `)

    return postTemplate({comment, width, height, left, top, fontSize})
}

export function convertThreadToGraph(thread: IThread): cytoscape.ElementsDefinition {
    const result: cytoscape.ElementsDefinition = {
        nodes: [],
        edges: []
    }

    const posts = thread.threads[0].posts
    const postsMap: Map<number, IPost> = new Map<number, IPost>()
    const nodeMap: Map<number, ElementDefinition[]> = new Map<number, ElementDefinition[]>()
    const opPost = getOpPost(thread)

    posts.forEach(post => {
        postsMap.set(post.num, post)
    })

    const opPostNode = createNode(opPost)
    result.nodes.push(opPostNode)
    nodeMap.set(opPost.num, [opPostNode])

    posts.forEach(post => {
        if (post.num === opPost.num) { return }

        const answersInfo = getAnswersInfo(post.comment)

        function registerNode(sourceNodeId: string | undefined) {
            if (!sourceNodeId) {
                throw new Error('parameter sourceNodeId not found')
            }

            const node = createNode(post)
            const targetNodeId = node.data.id
            const nodes = nodeMap.get(post.num) || []

            result.nodes.push(node)
            nodeMap.set(post.num, [...nodes, node])

            if (sourceNodeId && targetNodeId) {
                const edge: EdgeDefinition = {
                    data: {
                        source: sourceNodeId,
                        target: targetNodeId
                    }
                }
                result.edges.push(edge)
            }
        }

        if (answersInfo.length === 0) {
            registerNode(opPostNode.data.id)
        } else {
            answersInfo.forEach(answerInfo => {
                const parentNode = postsMap.get(answerInfo.post)
                if (parentNode) {
                    const parentPostNodes = nodeMap.get(answerInfo.post)
                    if (parentPostNodes && parentPostNodes.length > 0) {
                        parentPostNodes.forEach(parentPostNode => {
                            registerNode(parentPostNode.data.id)
                        })
                    }
                } else {

                }
            })
        }
    })

    const color = chroma.scale(['black','red','yellow','white']).correctLightness().domain([0, nodeMap.size])
    let i = 0
    nodeMap.forEach((value, key, map) => {
        value.forEach(node => {
            node.data.color = color(i++).hex()
        })
    })

    return result
}

function createNode(post: IPost): cytoscape.ElementDefinition {
    return {
        data: {
            id: UUID(),
            num: post.num,
            name: `${post.num}`,
            comment: post.comment
        }
    }
}

function getOpPost(threadData: IThread): IPost {
    return threadData.threads[0].posts[0]
}

export function getAnswersInfo(text: string): IAnswerInfo[] {
    const result: IAnswerInfo[] = []
    const tmpSet = new Set<IAnswerInfo>()
    const regex = new RegExp('data-thread="([0-9]*)" data-num="([0-9]*)">[>0-9]*<\\/a', 'gmi')

    let matches

    do {
        matches = regex.exec(text);
        if (matches  && matches[1]) {
            const answerInfo = {
                thread: parseInt(matches[1]),
                post: parseInt(matches[2])
            }
            tmpSet.add(answerInfo)
        }
    } while (matches)

    tmpSet.forEach(value => result.push(value))

    return uniqBy(result, 'post')
}

export function calcBoxPosition(viewport: IBoundingBox, nodes: any, zoom: number) {
    return nodes.map((nodeData: any) => {
        const {boundBox, data} = nodeData
        return {
            data: data,
            x: (boundBox.x1 - viewport.x1) * zoom,
            y: (boundBox.y1 - viewport.y1) * zoom
        }
    })
}

function getRandomGRBColor_(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

let color = {r: 77, g:0, b:243}
const step = 100
function getRandomGRBColor(): string {
    let {r, g, b} = color

    if (b < 128) {
        b += step
    } else {
        g+= step/10
        b = 0
    }
    color = {
        r,g,b
    }

    return `rgb(${r}, ${g}, ${b})`;
}


function registerColor(postNum: number, colors: Map<number, string>): string {
    const color = getRandomGRBColor()
    colors.set(postNum, color)

    return color
}