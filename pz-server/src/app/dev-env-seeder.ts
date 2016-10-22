import promisify from 'pz-support/src/promisify';

import {createRelatedTopicsAttribute} from 'pz-server/src/topics/topic-attributes/topic-attribute-types';
import serverInfo from 'pz-server/src/app/server-info';

export class DevEnvSeeder {
    app: IApp;

    constructor(app) {
        this.app = app;
    }

    userSeeds() {
        return [
            {
                id: 1,
                email: 'luke.pammant@gmail.com',
                displayName: 'Andesl Adams',
                password: 'test'
            },
            {
                id: 2,
                email: 'james@jameskoshigoe.com',
                displayName: 'Johnny Bravo',
                password: 'test'
            },
            {
                id: 3,
                email: 'test3@praisee.com',
                displayName: 'Dexter L.',
                password: 'test'
            },
            {
                id: 4,
                email: 'test4@praisee.com',
                displayName: 'Jan Itor',
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
            },

            {
                name: 'Praisee',
                isVerified: true
            }
        ];
    }

    topicAttributeSeeds() {
        return [
            createRelatedTopicsAttribute(4, [1, 3])
        ];
    }

    communityItemSeeds() {
        return [
            {
                userId: 1, type: "Question",
                summary: 'Is there any D810 successor is coming in 2016?',
                body: "I have seen lots of people selling D810 these days in gulf countries. Also its used price gone a bit up than old days. (Don't know why) is there any successor to D810? I want a D810 badly and I can hold a bit if any new camera is going to release in 2016. What is your opinion ? Should I wait or its time to buy D810?"
            },
            {
                userId: 3, type: 'Guide', summary: 'Tribute to D300/D300s',
                body: `There is really nothing left to discuss about technical aspects of D300/D300s on this forum, thanks to such a painfully long birth of its successor, which was so long that Nikon even had to fast forward its name by one generation Yet it feels a bit sad to let these legendarty veterans vanish in the history pages of this forum without saying proper goodbye. So please, post some of your best images taken with these cameras to remind how great they were, and still are, despite more than 10 year of camera evolution. For me, I am just re-posting my photos from another recent thread, as I think they represent some of my best efforts with my beloved D300 outside of family portraiture. Look forward to many great examples of D300 legacy. Best shots with D200 are also welcome `
            },
            {
                userId: 2, type: 'Question', summary: 'Flash for D-500',
                body: `What is a decent flash for the Nikon D-500?`
            },
            {
                userId: 3, type: 'Question', summary: 'Hey enthusiasts, how do you justify your purchases?',
                body: `Hey folks,

I've been silently but actively following this D500 forum for about three months and I thought it was time to ask you all a question. I'm an enthusiast who dreams about doing more, and for the past 5 years I've been a happy Pentax K-5 shooter (great bang-for-the-buck, imho.) In addition to shooting the kids around the house and local high school soccer, I really enjoy the challenge of shooting live theater (mostly the ones my kids are in). If curious, here you go: gallery  My K-5 is showing signs of its age and I'm anxious to upgrade my body and lenses. This site has absolutely convinced me to go with the D500.

I'm 90% certain I'm going to upgrade within the month, but I'm curious how everyone justifies their purchases - both to themselves and more importantly to their significant non-photographer other. Although this question might be more appropriately asked of a psychologist/marriage counselor I figure most of us here have had to convince someone (or even maybe ourselves) that we weren't being irresponsible with our cash. I have my reasons to upgrade now, but I would like to hear yours. Perhaps they will convince me to finally move the items off my wishlist at B&H!

My wife and I together earn slightly above the median family income for our area. We have a number of kids (2 of them are currently in college), we own a house, and pay our bills. But we don't spend much at all on things for ourselves. So dropping around $5,000 on a D500, a Tamron 70-200 2.8 di vc, and a Sigma 18-35 1.8, plus a speed light, card, extra battery, and several other little items is a real big deal. I know I could spend more (and I am bothered by that large gap in my focal lengths), but I think this set-up will give me what I need for shooting theater. I'm all about getting the most for my money.

My wife is happy I enjoy shooting as I do, but she worries that any 'extra' money should go toward deferred maintenance around the house or something more necessary for the kids. I understand her concerns; they are perfectly reasonable. However, we have the money and I'm sure this purchase won't make it impossible for us to continue to pay our bills - even if it means we have to wait a little longer to replace the roof.

I earned several hundred dollars this year selling my youth theater shots to parents, and I'm thinking about getting into the senior portrait business, but I don't think it realistic that I'll ever actually pay for my gear.

So, if you are an enthusiast on a limited budget . . . how do you justify your purchases?` },
            { userId: 3, type: 'Review', summary: 'Setting new standards: Nikon D5 Review', body: `Lots more formatted content here`, reviewedTopicId: 4, reviewRating: 3, reviewPricePaid: '2345.53'},
            { userId: 4, type: 'Review', summary: 'The little camera that could: Nikon D1 Review', body: `Mas stuff ici`, reviewedTopicId: 4, reviewRating: 5, reviewPricePaid: '7543.49' }
        ];
    }

    topicCommunityItemSeeds() {
        return [
            { communityItemId: 1, topicId: 4 },
            { communityItemId: 1, topicId: 3 },
            { communityItemId: 1, topicId: 1 },
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
                rootParentId: 1,
                rootParentType: "CommunityItem",
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
                userId: 4,
                parentId: 1,
                parentType: "Comment",
                rootParentId: 1,
                rootParentType: "CommunityItem",
                body: 'Given the impact of the earthquake in Japan, my guesstimate is announcement this year, availability next',
            },
            {
                userId: 2,
                parentId: 2,
                parentType: "Comment",
                rootParentId: 1,
                rootParentType: "CommunityItem",
                body: 'yeah, true we will wait and see...',
            },
            {
                userId: 3,
                parentId: 1,
                parentType: "CommunityItem",
                rootParentId: 1,
                rootParentType: "CommunityItem",
                body: 'Sometimes I like to take pictures of mountains',
            },
            {
                userId: 1,
                parentId: 1,
                parentType: "CommunityItem",
                rootParentId: 1,
                rootParentType: "CommunityItem",
                body: 'This is probably the most useless topic ever...',
            },
            {
                userId: 4,
                parentId: 5,
                parentType: "Comment",
                rootParentId: 1,
                rootParentType: "CommunityItem",
                body: `thats pretty rude, ur a dick`,
            },
            {
                userId: 1,
                parentId: 6,
                parentType: "Comment",
                rootParentId: 1,
                rootParentType: "CommunityItem",
                body: `u're***`,
            },
            {
                userId: 2,
                parentId: 2,
                parentType: "CommunityItem",
                rootParentId: 2,
                rootParentType: "CommunityItem",
                body: `Really a glorious tribute with so much amazing fine art there.  Wow.`,
            },
            {
                userId: 3,
                parentId: 8,
                parentType: "Comment",
                rootParentId: 2,
                rootParentType: "CommunityItem",
                body: `Thanks Ernie. Your Flickr photo stream is awesome. I found it very inspirational. And a great tribute to what D800 is capable of.`,
            },
            {
                userId: 3,
                parentId: 4,
                parentType: "CommunityItem",
                rootParentId: 4,
                rootParentType: "CommunityItem",
                body: `My wife said if I buy one more camera she's gonna leave me, gosh, I'm really gonna miss her!`,
            }

        ]
    }

    async seed(): Promise<any> {
        if (serverInfo.isProductionEnv()) {
            return;
        }

        console.log('Seeding development environment...');

        await this._seedWith(this.userSeeds(), this.app.models.PraiseeUser);
        await this._seedWith(this.topicSeeds(), this.app.models.Topic);
        await this._seedWith(this.topicAttributeSeeds(), this.app.models.TopicAttribute);
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
