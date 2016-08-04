import * as React from 'react';
import * as ReactDom from 'react-dom';
import {Component} from 'react';
import * as util from 'util';

interface IContributionState {
    isLoading: Boolean;
    content?: string;
}

interface IContributionProps {
    addContribution: (body: string) => Promise<Boolean>;
}

export default class ContributionArea extends Component<IContributionProps, IContributionState> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            isLoading: false
        };
    };

    render() {

        return (
            <div className="contribution-area">
                <form onSubmit={this._submit.bind(this) } >
                    <textarea ref="body" 
                        placeholder="Say something nice about {this.props.topic.summary}" 
                        onChange={this._contentChangeHandler.bind(this)} 
                        style="width: 100%" />
                    { this.state.content ?
                        <button className="btn btn-primary" type="submit" disabled={this.state.isLoading}>Submit</button>
                        : null
                    }
                </form>
            </div>
        )
    }

    _submit(e) {
        e.preventDefault();
        const body = (ReactDom.findDOMNode(this.refs["body"]) as any).value;
        this.setState({ isLoading: true });
        this.props.addContribution(body)
            .then((success) => {
                console.log(success);
                this.setState({ isLoading: false });
            });
    }

    private _contentChangeHandler(evt){
        this.setState({
            isLoading: this.state.isLoading,
            content: evt.target.value
        })
    }
}