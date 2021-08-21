import {convertThreadToGraph} from './Utils'

describe('Utils', () => {
    describe('convertThreadToGraph', () => {
        it('simple test', () => {
            const result = convertThreadToGraph(1, 2)

            expect(result).toStrictEqual(3)
        })
    })
})