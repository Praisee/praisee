export default {
    index: 'praisee',
    
    types: {
        communityItem: 'communityItem',
        topic: 'topic'
    },
    
    typeMappings: {
        communityItem: {
            communityItemId: {
                type: 'long',
            },
            
            type: {
                type: 'string',
                index: 'not_analyzed'
            },
            
            summary: {
                type: 'string'
            },
            
            body: {
                type: 'string'
            }
        },
        
        topic: {
        }
    }
}
