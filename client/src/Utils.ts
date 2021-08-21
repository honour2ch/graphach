import {v4 as UUID} from "uuid"
import cytoscape from "cytoscape";
import {IThread} from "./Interfaces";
import preventExtensions = Reflect.preventExtensions;

export function createCytoscapeContainer() {
    const container = document.createElement('div')

    container.style.width = '100%'
    container.style.height = '100%'
    container.style.position = 'absolute'
    container.style.left = '0'
    container.style.top = '0'
    container.style.zIndex = '999'

    document.body.appendChild(container)

    return container
}

export function convertThreadToGraph(thread: IThread): cytoscape.ElementsDefinition {
    const result: cytoscape.ElementsDefinition = {
        nodes: [],
        edges: []
    }

    const postsMap: {
        [key: string]: {
            uuid: string,
            num: number
            comment: string
            parentPostsNumbers: number[]
        }
    } = {}

    thread.threads[0].posts.forEach(post => {
        const parentPostsNumbers = getParentPostsNumbers(post.comment)
        const {num, comment} = post
        const uuid = UUID()

        postsMap[post.num] = {uuid, num, comment, parentPostsNumbers}
    })

    const postsMapKeys = Object.keys(postsMap)

    postsMapKeys.forEach((postsMapKey, index) => {
        const postData = postsMap[postsMapKey]
        const nodeData: cytoscape.ElementDefinition = {
            data: {
                id: postData.uuid,
                name: `${index}`,
                comment: postData.comment
            }
        }
        result.nodes.push(nodeData)

        postData.parentPostsNumbers.forEach(parentPostNumber => {
            const parentPostData = postsMap[parentPostNumber]

            if (parentPostData) {
                const edgeData: cytoscape.EdgeDefinition = {
                    data: {
                        source: postData.uuid,
                        target: parentPostData.uuid
                    }
                }

                result.edges.push(edgeData)
            }
        })
    })

    return result
}

export function getParentPostsNumbers(text: string): number[] {
    const result: number[] = []
    const tmpSet = new Set<number>()
    const regex = new RegExp('<a href="\\/[a-z]\\/res\\/[0-9]*.html#[0-9]*" class="post-reply-link" data-thread="[0-9]*" data-num="([0-9]*)">[>0-9]*<\\/a>', 'gmi')

    let matches

    do {
        matches = regex.exec(text);
        if (matches  && matches[1]) {
            tmpSet.add(parseInt(matches[1]))
        }
    } while (matches)

    tmpSet.forEach(value => result.push(value))

    return result
}