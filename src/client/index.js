import React from "react";
import { hydrate } from "react-dom";
import Main from "./main";

hydrate(<Main sessionType={window.__sessionType}/>, document.getElementById("root"));