import * as React from 'react';
import { Component } from 'react';
import { Link } from 'react-router';
import { ITopic } from 'pz-server/src/topics/topics';
import classNames from 'classnames';

interface ITagsProps {
    topics: Array<{ id: string, name: string, routePath: string }>
    hideSingleTag: boolean
}

export default class Tags extends Component<ITagsProps, any> {
    render() {
        let tags;
        tags = this.props.topics.map((topic) => {
            return (
                <Link key={topic.id} className="topic-tag" to={topic.routePath}>{topic.name}</Link>
            );
        });

        let tagClass = classNames('tags', { 'hidden': this.props.hideSingleTag && this.props.topics.length < 2 });

        return (
            <div className={tagClass}>
                {tags}
            </div>
        );
    }
}