import {uniqBy} from 'lodash'
import {v4 as UUID} from "uuid"
import cytoscape from "cytoscape";
import {IAnswerInfo, IBoundingBox, IPost, IThread} from "./Interfaces";

export function createPostContainer(comment: string, width: number, height: number, x: number, y: number, fontSize: number): HTMLDivElement {
    const postContainer = document.createElement('div')
    const commentContainer = document.createElement('article')

    postContainer.className = 'post post_type_reply'
    commentContainer.className = 'post__message '

    postContainer.appendChild(commentContainer)
    commentContainer.innerHTML = comment

    postContainer.className = 'post'
    postContainer.style.width = `${width}px`
    postContainer.style.height = `${height}px`
    postContainer.style.left = `${x}px`
    postContainer.style.top = `${y}px`
    postContainer.style.fontSize = `${fontSize}px`

    return postContainer
}

export function convertThreadToGraph(thread: IThread): cytoscape.ElementsDefinition {
    const result: cytoscape.ElementsDefinition = {
        nodes: [],
        edges: []
    }

    const posts = thread.threads[0].posts
    const postsMap: Map<number, IPost> = new Map<number, IPost>()
    const nodeMap: Map<number, cytoscape.ElementDefinition[]> = new Map<number, cytoscape.ElementDefinition[]>()
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

        if (answersInfo.length === 0) {
            const node = createNode(post)
            result.nodes.push(node)
            nodeMap.set(post.num, [node])

            const sourceNodeId = opPostNode.data.id
            const targetNodeId = node.data.id

            if (sourceNodeId && targetNodeId) {
                const edge: cytoscape.EdgeDefinition = {
                    data: {
                        source: sourceNodeId,
                        target: targetNodeId
                    }
                }
                result.edges.push(edge)
            }
        } else {
            answersInfo.forEach(answerInfo => {
                const parentNode = postsMap.get(answerInfo.post)
                if (parentNode) {
                    const parentPostNodes = nodeMap.get(answerInfo.post)
                    if (parentPostNodes && parentPostNodes.length > 0) {
                        parentPostNodes.forEach(parentPostNode => {
                            const node = createNode(post)
                            const sourceNodeId = parentPostNode.data.id
                            const targetNodeId = node.data.id

                            result.nodes.push(node)
                            const nodes = nodeMap.get(post.num) || []
                            nodeMap.set(post.num, [...nodes, node])

                            if (sourceNodeId && targetNodeId) {
                                const edge: cytoscape.EdgeDefinition = {
                                    data: {
                                        source: sourceNodeId,
                                        target: targetNodeId
                                    }
                                }
                                result.edges.push(edge)
                            }
                        })
                    }
                } else {

                }
            })
        }
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