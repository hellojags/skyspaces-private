import "./App.css";
import React, {Fragment} from "react";
import theme from "./theme";
import SnRouter from "./router/sn.router";
import {Connect} from '@blockstack/connect';
import {ThemeProvider} from '@material-ui/core';
import SnLoader from "./components/tools/sn.loader";
import SnFooter from "./components/footer/sn.footer";
import {library} from "@fortawesome/fontawesome-svg-core";
import {appDetails, authOrigin, userSession} from "./blockstack/constants";
import {
  faBlog,
  faCloudUploadAlt,
  faEllipsisV,
  faEnvelope,
  faFan,
  faHeadphones,
  faLaughWink,
  faStar,
  faVideo,
  faWifi
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faEnvelope,
  faFan,
  faLaughWink,
  faCloudUploadAlt,
  faStar,
  faVideo,
  faBlog,
  faWifi,
  faHeadphones,
  faEllipsisV
);

const authOptions = {
  redirectTo: '/',
  manifestPath: '/manifest.json',
  authOrigin,
  userSession,
  finished: ({userSession}: { userSession: any }) => {
    console.log(userSession.loadUserData());
  },
  appDetails: appDetails,
};

class App extends React.Component {
  constructor(props: any) {
    super(props);
    if (process.env.NODE_ENV === 'production') {
      console.log = function () {
      };
    }
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <React.Fragment>
          <Connect authOptions={authOptions}>
            <SnLoader/>
            <SnRouter/>
            <SnFooter/>
          </Connect>
        </React.Fragment>
      </ThemeProvider>
    );
  }
}

export default App;
