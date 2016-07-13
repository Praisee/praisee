import * as path from 'path';

const routePaths = {
    index: () => '/',
    
    topic: (urlSlug: string) => path.join(
        routePaths.index(), urlSlug
    ),
    
    communityItem: {
        review: (urlSlug: string) => path.join(
            routePaths.index(), 'review', urlSlug
        ),
        
        question: (urlSlug: string) => path.join(
            routePaths.index(), 'question', urlSlug
        ),
        
        howto: (urlSlug: string) => path.join(
            routePaths.index(), 'how-to', urlSlug
        ),
        
        comparison: (urlSlug: string) => path.join(
            routePaths.index(), 'comparison', urlSlug
        )
    },
};

export default routePaths;
