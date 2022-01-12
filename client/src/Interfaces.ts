export interface IThread {
    title: string
    threads: { posts: IPost[] }[]
}

export interface IPost {
    num: number
    timestamp: number
    subject: string
    comment: string
}

export interface IAnswerInfo {
    thread: number
    post: number
}

export interface IBoundingBox {
    x1: number
    y1: number
    x2: number
    y2: number
    w: number
    h: number
}