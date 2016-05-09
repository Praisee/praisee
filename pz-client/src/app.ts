import * as React from 'react';
import {Component} from 'react';
import * as ReactDom from 'react-dom';

import Home from 'pz-client/src/home.component';

ReactDom.render(React.createElement(Home), document.querySelector('.app-container'));
