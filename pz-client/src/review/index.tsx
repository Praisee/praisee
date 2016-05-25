import * as React from "react";
import * as ReactDOM from "react-dom";

import ReviewList from "./reviewList.component";

ReactDOM.render(
  <ReviewList sourceUrl="/reviews" />,
  document.getElementById("reviewList")
);