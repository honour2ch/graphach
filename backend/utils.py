def thread_to_graph():
    return {
                "nodes": [
                    {
                        "data": { "id": 'a' }
                    },
                    {
                        "data": { "id": 'b' }
                    }
                ],
                "edges": [
                    {
                        "data": { "id": 'ab', "source": 'a', "target": 'b' }
                    }
                ]
            }