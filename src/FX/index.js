import React, { Component } from 'react';
import { Modal, Header, Button } from 'semantic-ui-react';
import Connect from './Connect';
import FxMenu from './FxMenu';
import './index.css';

export * from './Connect';

/** FX container component that provides authentication,
 * standard header navigation, and salesforce connection context
 * @property title - application name displayed in the menu bar
 * @property version - a build number to display in the user menu
 * @property permissions - default permissions required to use the app */
export default class FxApp extends Component {
  state = { sessionExpired: false, hasError: false };

  componentDidCatch(error, info) {
    console.error(error, info);
    this.setState({ hasError: true });
  }

  onSessionExpired = () => {
    this.setState({ sessionExpired: true });
  };

  render() {
    const { title, version, children } = this.props;
    const { sessionExpired, hasError } = this.state;

    return (
      <React.StrictMode>
        <Connect onSessionExpired={this.onSessionExpired}>
          <div id="fx">
            <FxMenu title={title} version={version} />
            <div id="fx-app">{hasError === false && children}</div>
          </div>
        </Connect>

        {hasError && (
          <Modal open={true} size="tiny" centered={false}>
            <Header
              icon="warning sign"
              content="An Unexpected Error Occurred"
            />
            <Modal.Content>
              Please try again or contact LiquidFrameworks Support for
              assistance
            </Modal.Content>
            <Modal.Actions>
              <Button
                color="green"
                content="Reload"
                onClick={() => window.location.reload()}
              />
            </Modal.Actions>
          </Modal>
        )}

        {sessionExpired && (
          <Modal open={true} size="tiny" centered={false}>
            <Header icon="hourglass half" content="Are you still there?" />
            <Modal.Content>
              This page has been inactive for a while. Please log in again
              before continuing so we can verify your identity.
            </Modal.Content>
            <Modal.Actions>
              <Button
                color="green"
                content="Log In"
                onClick={() => window.location.reload()}
              />
            </Modal.Actions>
          </Modal>
        )}
      </React.StrictMode>
    );
  }
}
