import { Component } from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import { DateDisplay } from 'pz-client/src/widgets/date-display.component'

export class ErrorList extends Component<IErrorListProps, any>{
    constructor(props, context) {
        super(props, context);
        this.state = {
            closedErrorIds: {}
        }
    }

    //TODO: OnComponentDidUpdate - Check if props has the errorID and if not remove it from closed error ids

    render() {
        let {responseErrorsList: error} = this.props.viewer;
        
        let unclosedErrors = error.filter((error)=>
            !this.state.closedErrorIds.hasOwnProperty(error.id)
        );

        return (
            <div className="error-namespace">
                {unclosedErrors.map((error) =>
                    (
                        <div key={error.id} className="error">
                            {error.message}
                            <i className="close" title="close" onClick={this._closeError.bind(this, error.id)}></i>
                        </div>
                    )
                )}
            </div>
        );
    }

    private _closeError(errorId){
        const closedErrorIds = Object.assign({}, this.state.closedErrorIds, {
            [errorId]: true
        });

        this.setState({closedErrorIds});
    }
}

export default Relay.createContainer(ErrorList, {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                responseErrorsList{
                    id
                    message
                }
            } 
        `
    }
});

export interface IErrorListProps {
    viewer:{
        responseErrorsList: Array<{id: number, message:string}>
    }
}
