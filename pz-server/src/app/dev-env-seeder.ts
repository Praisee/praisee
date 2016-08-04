import promisify from 'pz-support/src/promisify';

export class DevEnvSeeder {
    app: IApp;

    constructor(app) {
        this.app = app;
    }

    userSeeds() {
        return [
            {
                email: 'test@praisee.com',
                displayName: 'Test',
                password: 'test'
            }
        ];
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
                isVerified: true,
                overviewContent: "Nikon Corporation, also known just as Nikon, is a Japanese multinational corporation headquartered in Tokyo, Japan, specializing in optics and imaging products."
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

    communityItemSeeds() {
        return [
            {
                type: "Question",
                summary: 'Is there any D810 successor is coming in 2016?',
                body:
                `I have seen lots of people selling D810 these days in gulf countries. Also its used price gone a bit up than old days. (Don't know why)
                    is there any successor to D810? 
                    I want a D810 badly and I can hold a bit if any new camera is going to release in 2016. 
                    What is your opinion ? Should I wait or its time to buy D810 ?`
            }]
    }

    async seed(): Promise<any> {
        if (process.env === 'production') {
            return;
        }

        console.log('Seeding development environment...');

        await this._seedWith(this.userSeeds(), this.app.models.User);
        await this._seedWith(this.topicSeeds(), this.app.models.Topic);
        await this._seedWith(this.communityItemSeeds(), this.app.models.Topic);

        console.log('Seeding complete')
    }

    private async _seedWith(seeds: Array<any>, Model: IPersistedModel): Promise<void> {
        console.log('Seeding ' + Model.modelName + '...');

        await Promise.all(seeds.map(async (seed) => {
            try {
                const topic = new Model(seed);
                await promisify(topic.save, topic)()

            } catch (error) {

                console.error(error);
                throw error;
            }
        }));

        console.log('Seeding ' + Model.modelName + ' complete');
    }
}

module.exports = function SeedDevEnv(app: IApp, next: ICallback) {
    return (
        (new DevEnvSeeder(app))
            .seed()
            .then(() => next(null))
            .catch(next)
    );
};
