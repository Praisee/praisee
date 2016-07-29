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

        it('injects property schema into parent element', () => {
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

        it('injects property schema into the child element', () => {
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

        it('injects property schema into the childs sub-element', () => {
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

            expect(resultElement).to.not.be.null;
            expect(secondChild.props).to.have.property('property').that.equals('justATest');
        });

        it('injects property schema into the child\'s 2nd sub-element', () => {
            let schema = {
                "just-a-test": {
                    property: "justATest"
                }
            };
            let injector = new SchemaInjector(schema);
            let testElement = (
                <div>
                    <p>
                        <span>pewpty pantssss</span>
                        <span className="just-a-test">test</span>
                    </p>
                </div>
            );

            let resultElement = injector.inject(testElement);
            let firstChild = React.Children.toArray(resultElement.props.children)[0];
            let secondChild = React.Children.toArray(firstChild.props.children)[1];

            expect(resultElement).to.not.be.null;
            expect(secondChild.props).to.have.property('property').that.equals('justATest');
        });

        it('injects property schema into the multiple children sub-element', () => {
            let schema = {
                "just-a-test": {
                    property: "justATest"
                },
                "container-test": {
                    property: "containerTest"
                }
            };
            let injector = new SchemaInjector(schema);
            let testElement = (
                <div>
                    <p>
                        <span className="just-a-test">test</span>
                    </p>
                    <div className="container-test"> </div>
                </div>
            );

            let resultElement = injector.inject(testElement);
            let firstChild = React.Children.toArray(resultElement.props.children)[0];
            let subChild = React.Children.toArray(firstChild.props.children)[0];
            let secondChild = React.Children.toArray(resultElement.props.children)[1];

            expect(resultElement).to.not.be.null;
            expect(subChild.props).to.have.property('property').that.equals('justATest');
            expect(secondChild.props).to.have.property('property').that.equals('containerTest');
        });

        it('injects property schema into the sub-element with text and components', () => {
            let schema = {
                "just-a-test": {
                    property: "justATest"
                }
            };
            let injector = new SchemaInjector(schema);
            let testElement = (
                <div>
                    <p>
                        This is some stand-alone text
                        <span>pewpty pantssss</span>
                        <span className="just-a-test">test</span>
                    </p>
                </div>
            );

            let resultElement = injector.inject(testElement);
            let firstChild = React.Children.toArray(resultElement.props.children)[0];
            let secondChild = React.Children.toArray(firstChild.props.children)[2];

            expect(resultElement).to.not.be.null;
            expect(secondChild.props).to.have.property('property').that.equals('justATest');
        });

        it('injects typeOf schema into children sub-element', () => {
            let schema = {
                "review": {
                    typeOf: "Review"
                }
            };
            let injector = new SchemaInjector(schema);
            let testElement = (
                <div>
                    <div className="review">
                        <p>
                            <span className="just-a-test">test</span>
                        </p>
                    </div>
                </div>
            );

            let resultElement = injector.inject(testElement);
            let firstChild = React.Children.toArray(resultElement.props.children)[0];

            expect(resultElement).to.not.be.null;
            expect(firstChild.props).to.have.property('typeOf').that.equals('Review');
        });

        it('doesn\'t inject property schema if set to false', () => {
            let schema = {
                "container-test": {
                    property: false
                }
            };
            let injector = new SchemaInjector(schema);
            let testElement = (
                <div>
                    <div className="container-test">
                        <p>
                            <span className="just-a-test">test</span>
                        </p>
                    </div>
                </div>
            );

            let resultElement = injector.inject(testElement);
            let firstChild = React.Children.toArray(resultElement.props.children)[0];

            expect(resultElement).to.not.be.null;
            expect(firstChild.props).to.not.have.property('itemScope');
        });

        it('doesn\'t inject typeOf schema if set to false', () => {
            let schema = {
                "container-test": {
                    typeOf: false
                }
            };
            let injector = new SchemaInjector(schema);
            let testElement = (
                <div>
                    <div className="container-test">
                        <p>
                            <span className="just-a-test">test</span>
                        </p>
                    </div>
                </div>
            );

            let resultElement = injector.inject(testElement);
            let firstChild = React.Children.toArray(resultElement.props.children)[0];

            expect(resultElement).to.not.be.null;
            expect(firstChild.props).to.not.have.property('typeOf');
        });
    });
});
