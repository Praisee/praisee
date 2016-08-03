import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import CommunityItemsAuthorizer from 'pz-server/src/community-items/community-items-authorizer';
import {AuthorizationError, NotAuthenticatedError, NotOwnerError} from 'pz-server/src/support/authorization';

chai.use(chaiAsPromised);

describe('CommunityItemAuthorizer', function () {
    let user;
    let communityItem;
    let communityItems;
    let communityItemsAuthorizer;
    let authorizedCommunityItems;

    beforeEach(() => {
        communityItem = {
            id: 123
        };

        communityItems = {
            findById: sinon.stub(),
            isOwner: sinon.stub(),
            create: sinon.stub(),
            update: sinon.stub()
        };

        communityItemsAuthorizer = new CommunityItemsAuthorizer(
            communityItems
        );

        user = {id: 1};
        authorizedCommunityItems = communityItemsAuthorizer.as(user);
    });

    describe('when not authenticated', () => {
        beforeEach(() => {
            user = null;
            authorizedCommunityItems = communityItemsAuthorizer.as(user);
        });

        it('cannot create a new community item', async () => {
            return expect(
                (async () => await authorizedCommunityItems.create(communityItem))()

            ).to.eventually.be.instanceof(NotAuthenticatedError);
        });

        it('cannot update a community item', async () => {
            return expect(
                (async () => await authorizedCommunityItems.update(communityItem))()

            ).to.eventually.be.instanceof(NotAuthenticatedError);
        });
    });

    describe('when authenticated', () => {
        it('can create a new community item', async () => {
            return expect(
                (async () => await authorizedCommunityItems.create(communityItem))()

            ).to.eventually.not.be.instanceof(AuthorizationError);
        });
    });

    describe('when not the owner of a community item', () => {
        it('cannot update the community item', async () => {
            communityItems.isOwner.returns(false);

            return expect(
                (async () => await authorizedCommunityItems.update(communityItem))()

            ).to.eventually.be.instanceof(NotOwnerError);
        });
    });

    describe('when the owner', () => {
        it('can update the community item', () => {
            communityItems.isOwner.returns(true);

            return expect(
                (async () => await authorizedCommunityItems.update(communityItem))()

            ).to.eventually.not.be.instanceof(AuthorizationError);
        });
    });
});
