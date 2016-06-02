import promisify from 'pz-support/src/promisify';
import {ITopic} from 'pz-domain/src/models/topic';

export class DevEnvSeeder {
    app: IApp;
    
    constructor(app) {
        this.app = app;
    }
    
    topicSeeds() {
        return [
            {
                name: 'Photography',
                isVerified: true
            },
            
            {
                name: 'Videography',
                isVerified: true
            },
            
            {
                name: 'Cameras',
                isVerified: true
            },

            {
                name: 'Nikon',
                isVerified: true
            },
            
            ...[
                'D1', 'D1X', 'D2X', 'D2Xs', 'D3X',
                'D1H', 'D2H', 'D2Hs', 'D3', 'D3S', 'D4', 'D4S', 'D5',
                'D800', 'D800E', 'D810', 'D810A',
                'Df',
                'D700', 'D750',
                'D100', 'D200', 'D300', 'D300S', 'D500',
                'D600', 'D610',
                'D70', 'D70s', 'D80', 'D90', 'D7000', 'D7100', 'D7200',
                'D50', 'D40X', 'D60', 'D5000', 'D5100', 'D5200', 'D5300', 'D5500',
                'D40', 'D3000', 'D3100', 'D3200', 'D3300'
            ].map(model => ({
                name: `Nikon ${model}`,
                isVerified: true
            })),
            
            {
                name: 'Canon',
                isVerified: true
            },
            
            {
                name: 'Beauty',
                isVerified: true
            },

            {
                name: 'Makeup',
                isVerified: true
            }
        ];
    }
    
    seed(): Promise<any> {
        if (process.env === 'production') {
            return;
        }

        console.log('Seeding development environment');

        return (Promise.resolve()
            .then(() => {
                const Topic = this.app.models.Topic;
                
                return Promise.all(this.topicSeeds().map((topicSeed) => {
                    const topic = new Topic(topicSeed);
                    return (promisify(topic.save, topic)()
                        .catch((error) => {
                            console.error(error);
                            throw error;
                        })
                    );
                }));
            })
                
            .then(() => {
                console.log('Seeding complete')
            })
        );
    }
}

export default function SeedDevEnv(app: IApp) {
    return (new DevEnvSeeder(app)).seed();
}
