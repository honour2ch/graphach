import * as Utils from './utils'
import {IPost, IThread} from "./Interfaces";

describe('Utils', () => {
    describe('convertThreadToGraph', () => {
        it('simple test', () => {
            const threadData: IThread = {
                title: 'title',
                threads: [{
                    posts: [
                        {num: 0, comment: ''} as IPost,
                        {num: 1, comment: '<a href="/b/res/0.html#0" class="post-reply-link" data-thread="0" data-num="0">>>0</a>'} as IPost,
                        {
                            num: 2,
                            comment: `
                                        <a href="/b/res/0.html#0" class="post-reply-link" data-thread="0" data-num="0">>>0</a>
                                        <a href="/b/res/0.html#1" class="post-reply-link" data-thread="1" data-num="1">>>1</a>
                                     `
                        } as IPost,
                        {num: 3, comment: '<a href="/b/res/0.html#2" class="post-reply-link" data-thread="0" data-num="2">>>0</a>'} as IPost,
                    ]
                }]
            }
            const result = Utils.convertThreadToGraph(threadData as any)


            expect(result.edges.length).toStrictEqual(3)
            expect(result.nodes.length).toStrictEqual(4)
        })
    })

    describe('getParentPostsNumbers', () => {
        it('Simple answer with one parent link', () => {
            const str = `
                <a href="/b/res/253054773.html#253054793" class="post-reply-link" data-thread="253054773" data-num="253054793">>>253054793</a>
                <br>bla bla bla`

            const result = Utils.getAnswersInfo(str)
            const expectedResult = [{thread: 253054773, post: 253054793}]

            expect(result).toStrictEqual(expectedResult)
        })

        it('Simple answer with two equal parent links', () => {
            const str = `
                <a href="/b/res/253054773.html#253054793" class="post-reply-link" data-thread="253054773" data-num="253054793">>>253054793</a>
                <br>bla bla bla
                <a href="/b/res/253054773.html#253054793" class="post-reply-link" data-thread="253054773" data-num="253054793">>>253054793</a>
                <br>bla bla bla`

            const result = Utils.getAnswersInfo(str)
            const expectedResult = [{thread: 253054773, post: 253054793}]

            expect(result).toStrictEqual(expectedResult)
        })

        it('Simple answer with two different parent links', () => {
            const str = `
                <a href="/b/res/253054773.html#253054791" class="post-reply-link" data-thread="253054773" data-num="253054791">>>253054791</a>
                <br>bla bla bla
                <a href="/b/res/253054773.html#253054793" class="post-reply-link" data-thread="253054773" data-num="253054793">>>253054793</a>
                <br>bla bla bla`

            const result = Utils.getAnswersInfo(str)
            const expectedResult = [
                {thread: 253054773, post: 253054791},
                {thread: 253054773, post: 253054793},
            ]

            expect(result).toStrictEqual(expectedResult)
        })
    })
})