import {expect} from 'chai';
import * as React from 'react';
import * as ReactDomServer from 'react-dom/server';
import supertest from 'supertest-as-promised';
import promisify from 'pz-support/src/promisify';
import SchemaInjector from 'pz-client/src/support/schema-injector';

describe('schema injector', function () {
    const context = this;

    describe('given a schema', () => {

        beforeEach(() => {

        });

        afterEach(() => {

        });

        it('injects schema into parent element', () => {
            let schema = {
                "just-a-test": {
                    property: "justATest"
                }
            };
            let injector = new SchemaInjector(schema);
            let testElement = (<div className="just-a-test"></div>);

            let resultElement = injector.inject(testElement);

            // console.log(ReactDomServer.renderToString(resultElement));

            expect(resultElement).to.not.be.null;
            expect(resultElement.props).to.have.property('property').that.equals('justATest');
        });

        it('injects schema into the child element', () => {
            let schema = {
                "just-a-test": {
                    property: "justATest"
                }
            };
            let injector = new SchemaInjector(schema);
            let testElement = (
                <div>
                    <span className="just-a-test">test</span>
                </div>
            );

            let resultElement = injector.inject(testElement);
            let firstChild = React.Children.toArray(resultElement.props.children)[0];

            expect(resultElement).to.not.be.null;
            expect(firstChild.props).to.have.property('property').that.equals('justATest');
        });

        it('injects schema into the childs sub-element', () => {
            let schema = {
                "just-a-test": {
                    property: "justATest"
                }
            };
            let injector = new SchemaInjector(schema);
            let testElement = (
                <div>
                    <p>
                        <span className="just-a-test">test</span>
                    </p>
                </div>
            );

            let resultElement = injector.inject(testElement);
            let firstChild = React.Children.toArray(resultElement.props.children)[0];
            let secondChild = React.Children.toArray(firstChild.props.children)[0];
            console.log(secondChild);
            expect(resultElement).to.not.be.null;
            expect(secondChild.props).to.have.property('property').that.equals('justATest');
        });
    });
});
