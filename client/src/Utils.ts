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

export function convertThreadToGraph(a: number, b: number) {
    return a + b
}