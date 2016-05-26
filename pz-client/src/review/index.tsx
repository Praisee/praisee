import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router'

import ReviewList from "./reviewList.component";

ReactDOM.render(
  <ReviewList sourceUrl="/reviews" />,
  document.getElementById("reviewList")
);