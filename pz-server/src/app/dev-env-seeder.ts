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
                displayName: 'Andesl Adams',
                password: 'test'
            },
            {
                email: 'test2@praisee.com',
                displayName: 'Puh Z.',
                password: 'test'
            },
            {
                email: 'test2@praisee.com',
                displayName: 'P. Ness',
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
                name: 'Cosmetics',
                isVerified: true
            }
        ];
    }

    communityItemSeeds() {
        return [
            {
                topicId: 4,
                userId: 1,
                type: "Question",
                summary: 'Is there any D810 successor is coming in 2016?',
                body: "I have seen lots of people selling D810 these days in gulf countries. Also its used price gone a bit up than old days. (Don't know why) is there any successor to D810? I want a D810 badly and I can hold a bit if any new camera is going to release in 2016. What is your opinion ? Should I wait or its time to buy D810?"
            },
            { topicId: 4, userId: 3, type: 'Howto', summary: 'Luke...', body: `I am your father.` },
            { topicId: 4, userId: 3, type: 'Howto', summary: 'Luuuuukkkee', body: `I AM your father.` },
            { topicId: 4, userId: 3, type: 'Howto', summary: 'I AM', body: `^^^` },
            { topicId: 4, userId: 3, type: 'Howto', summary: 'YOUR', body: `^^^^` },
            { topicId: 4, userId: 3, type: 'Howto', summary: 'FATHER.', body: `^^^^^^` }
        ];
    }

    topicCommunityItemSeeds() {
        return [
            {
                communityItemId: 1,
                topicId: 4
            },

            {
                communityItemId: 1,
                topicId: 3
            },

            {
                communityItemId: 1,
                topicId: 1
            },

            { communityItemId: 2, topicId: 4 },
            { communityItemId: 3, topicId: 4 },
            { communityItemId: 4, topicId: 4 },
            { communityItemId: 5, topicId: 4 },
            { communityItemId: 6, topicId: 4 }
        ];
    }

    commentSeeds() {
        return [
            {
                userId: 2,
                parentId: 1,
                parentType: "CommunityItem",
                body:
                `There are rumors about a Photokina launch
                The D810 is (almost) 2 years old and and with the normal timeframe it would be replaced this year.
                It's time for Nikon to make use of some of their current technology into a new camera body.
                The 153 point AF, the wireless solutions, new Expeed processor, new Sensor ( we'll see what Sony been sittning on) to take a big step forwardThe launch of the Canon 5DIV and the D900 will be close in time and this should be this year
                `,
                bodyData:
                { "version": "0", "type": "text", "value": "There are rumors about a Photokina launch. The D810 is (almost) 2 years old and and with the normal timeframe it would be replaced this year. It's time for Nikon to make use of some of their current technology into a new camera body.The 153 point AF, the wireless solutions, new Expeed processor, new Sensor (we'll see what Sony been sittning on) to take a big step forward The launch of the Canon 5DIV and the D900 will be close in time and this should be this year." }
            },
            {
                userId: 1,
                parentId: 1,
                parentType: "Comment",
                body: 'Given the impact of the earthquake in Japan, my guesstimate is announcement this year, availability next',
                bodyData: { "version": "0", "type": "text", "value": "Given the impact of the earthquake in Japan, my guesstimate is announcement this year, availability next" }
            },
            {
                userId: 2,
                parentId: 2,
                parentType: "Comment",
                body: 'yeah, true we will wait and see...',
                bodyData: { "version": "0", "type": "text", "value": "yeah, true we will wait and see..." }
            },
            {
                userId: 3,
                parentId: 1,
                parentType: "CommunityItem",
                body: 'Sometimes I like to take pictures of mountains',
                bodyData: { "version": "0", "type": "text", "value": "Sometimes I like to take pictures of mountains" }
            },
            {
                userId: 2,
                parentId: 1,
                parentType: "CommunityItem",
                body: 'This is probably the most useless topic ever...',
                bodyData: { "version": "0", "type": "text", "value": "This is probably the most useless topic ever..." }
            },
            {
                userId: 1,
                parentId: 5,
                parentType: "Comment",
                body: `thats pretty rude, ur a dick`,
                bodyData: { "version": "0", "type": "text", "value": "thats pretty rude, ur a dick" }
            },
            {
                userId: 2,
                parentId: 6,
                parentType: "Comment",
                body: `u're***`,
                bodyData: { "version": "0", "type": "text", "value": "u're**" }
            }
        ]
    }

    async seed(): Promise<any> {
        if (process.env === 'production') {
            return;
        }

        console.log('Seeding development environment...');

        await this._seedWith(this.userSeeds(), this.app.models.PraiseeUser);
        await this._seedWith(this.topicSeeds(), this.app.models.Topic);
        await this._seedWith(this.communityItemSeeds(), this.app.models.CommunityItem);
        await this._seedWith(this.topicCommunityItemSeeds(), this.app.models.TopicCommunityItem);
        await this._seedWith(this.commentSeeds(), this.app.models.Comment);

        console.log('Seeding complete')
    }

    private async _seedWith(seeds: Array<any>, Model: IPersistedModel): Promise<void> {
        console.log('Seeding ' + Model.modelName + '...');

        await Promise.all(seeds.map(async (seed) => {
            try {
                const model = new Model(seed);
                await promisify(model.save, model)()

            } catch (error) {

                console.log(error);
                console.log('Failed to seed: ' + error.message);
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
