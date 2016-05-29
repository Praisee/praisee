import * as React from 'react';
import {Component} from 'react';
import * as util from 'util';
import ContributionArea from 'pz-client/src/topic/contribution-area.component';

interface ITopicState {
    topicContent;
    topicName;
}

interface ITopicProps {
    topicSlug;
    params;
}

export default class TopicController extends Component<ITopicProps, ITopicState> {
    //provide contexts for sub components
    
    render() {
        return (
            <div className="topic-namespace" >
                {this._renderPrimarySection()}
                {this._renderSideSection()}
            </div>
        )
    }
    
    componentWillMount() {
        //Go look up topic slug and set it in the state
         this._lookupSlugInfo(this.props.params.topicSlug);
        //Get topic content and put in state
    }
    
    componentWillReceiveProps(nextProps) {
        //will have updated slug if user changed it via url
        this._lookupSlugInfo(nextProps.params.topicSlug);
        //Get topic content and put in state
    }
    
    _lookupSlugInfo(topicSlug){
        this.setState({
            topicContent: Math.random(),
            topicName: Math.random()
        })
    }
    
    _renderPrimarySection(){
        return (
            <div className="primary-section" >
                 {this._renderContributionSection()}
                 {this._renderTopicContentSection()}
            </div>
        )
    }
    
    _renderContributionSection(){
        return (
            <ContributionArea addContribution={this._addContibution} />
        )
    }
    
    _renderTopicContentSection(){
        var content = {};
        //TODO: Populate content from backend
        
        if(content){
            return this._renderTopicContent();
        } 
        else {
            return this._renderEmptyContent();
        }
    }
    
    _renderTopicContent(){
        return this.state.topicContent;
    }
    
    _renderEmptyContent(){
        return (
            <div>
                <span>empty content</span>
            </div>
        ); //change to list of questions
    }
    
    _renderSideSection(){
        return (
            <div className="side-section">
                <h2>{this.state.topicName}</h2>
            </div>
        )
    }

    _addContibution(){
        console.log("submited");
        var num = Math.random();
        return num > .5 ? Promise.resolve(true) : Promise.resolve(false);
    }
}

