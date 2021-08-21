export interface IThread {
    title: string
    threads: { posts: IPost[] }[]
}

export interface IPost {
    num: number
    timestamp: number
    subject: string,
    comment: string
}