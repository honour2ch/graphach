import * as Utils from './Utils'
import threadData from './thread-data'

describe('Utils', () => {
    describe('convertThreadToGraph', () => {
        // it('simple test', () => {
        //     const result = Utils.convertThreadToGraph(threadData as any)
        //
        //     expect(result).toStrictEqual(3)
        // })
    })

    describe('getParentPostsNumbers', () => {
        it('Simple answer with one parent link', () => {
            const str = `
                <a href="/b/res/253054773.html#253054793" class="post-reply-link" data-thread="253054773" data-num="253054793">>>253054793</a>
                <br>bla bla bla`

            const result = Utils.getParentPostsNumbers(str)
            const expectedResult = [253054793]

            expect(result).toStrictEqual(expectedResult)
        })

        it('Simple answer with two equal parent links', () => {
            const str = `
                <a href="/b/res/253054773.html#253054793" class="post-reply-link" data-thread="253054773" data-num="253054793">>>253054793</a>
                <br>bla bla bla
                <a href="/b/res/253054773.html#253054793" class="post-reply-link" data-thread="253054773" data-num="253054793">>>253054793</a>
                <br>bla bla bla`

            const result = Utils.getParentPostsNumbers(str)
            const expectedResult = [253054793]

            expect(result).toStrictEqual(expectedResult)
        })

        it('Simple answer with two different parent links', () => {
            const str = `
                <a href="/b/res/253054773.html#253054791" class="post-reply-link" data-thread="253054771" data-num="253054791">>>253054791</a>
                <br>bla bla bla
                <a href="/b/res/253054773.html#253054793" class="post-reply-link" data-thread="253054773" data-num="253054793">>>253054793</a>
                <br>bla bla bla`

            const result = Utils.getParentPostsNumbers(str)
            const expectedResult = [253054791, 253054793]

            expect(result).toStrictEqual(expectedResult)
        })
    })
})